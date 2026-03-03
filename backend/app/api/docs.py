from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import json

from app.core.database import get_db
from app.models.models import User, Document
from app.api.deps import get_current_user
from app.schemas.schemas import DocQueryRequest
from app.services.auth import get_active_subscription
from app.services.credits import get_or_create_wallet, RAG_QUERY_CREDITS
from app.services.rate_limit import rate_limit_middleware

router = APIRouter()

PLAN_ORDER = ["free", "starter", "pro", "creator", "elite"]
ALLOWED_TYPES = {"pdf", "txt", "md", "docx"}
MAX_SIZE_MB = 50


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan_id = await get_active_subscription(db, str(user.id))
    if PLAN_ORDER.index(plan_id) < PLAN_ORDER.index("pro"):
        raise HTTPException(403, detail={"error": "plan_upgrade_required", "min_plan": "pro"})

    # Check file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type. Allowed: {', '.join(ALLOWED_TYPES)}")

    content = await file.read()
    size_bytes = len(content)

    if size_bytes > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max: {MAX_SIZE_MB}MB")

    # Check document limit
    from sqlalchemy import func
    count_result = await db.execute(
        select(func.count()).select_from(Document).where(
            Document.user_id == user.id,
            Document.status.in_(["ready", "indexing"]),
        )
    )
    doc_count = count_result.scalar()

    from app.models.models import Plan
    plan = await db.get(Plan, plan_id)
    max_docs = plan.max_documents if plan else 0
    if max_docs > 0 and doc_count >= max_docs:
        raise HTTPException(400, f"Document limit reached ({max_docs}). Upgrade plan.")

    # Save file
    import os
    os.makedirs("/app/uploads/docs", exist_ok=True)
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"/app/uploads/docs/{filename}"
    with open(filepath, "wb") as f:
        f.write(content)

    doc = Document(
        user_id=user.id,
        filename=file.filename,
        file_url=f"/uploads/docs/{filename}",
        file_type=ext,
        size_bytes=size_bytes,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Queue indexing
    try:
        from arq import create_pool
        from arq.connections import RedisSettings
        from app.core.config import settings
        import re
        m = re.match(r"redis://:(.+)@(.+):(\d+)", settings.REDIS_URL)
        if m:
            arq_pool = await create_pool(RedisSettings(host=m.group(2), port=int(m.group(3)), password=m.group(1)))
        else:
            arq_pool = await create_pool(RedisSettings())
        await arq_pool.enqueue_job("index_document", doc_id=str(doc.id), filepath=filepath, file_type=ext)
        await arq_pool.aclose()
    except Exception:
        doc.status = "error"
        await db.commit()

    return {
        "doc_id": str(doc.id),
        "filename": doc.filename,
        "size_bytes": doc.size_bytes,
        "status": doc.status,
    }


@router.get("")
async def list_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(Document.user_id == user.id).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        {
            "id": str(d.id),
            "filename": d.filename,
            "file_type": d.file_type,
            "size_bytes": d.size_bytes,
            "status": d.status,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at,
        }
        for d in docs
    ]


@router.get("/{doc_id}/status")
async def document_status(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, uuid.UUID(doc_id))
    if not doc or doc.user_id != user.id:
        raise HTTPException(404, "Document not found")

    return {"status": doc.status, "chunk_count": doc.chunk_count}


@router.post("/query")
async def query_document(
    data: DocQueryRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await rate_limit_middleware(request, str(user.id))

    doc = await db.get(Document, uuid.UUID(data.doc_id))
    if not doc or doc.user_id != user.id:
        raise HTTPException(404, "Document not found")
    if doc.status != "ready":
        raise HTTPException(400, f"Document not ready. Status: {doc.status}")

    wallet = await get_or_create_wallet(db, str(user.id))
    if wallet.balance + wallet.bonus_balance < RAG_QUERY_CREDITS:
        raise HTTPException(402, detail={"error": "insufficient_credits"})

    # Get relevant chunks (simple keyword search if no pgvector)
    from app.models.models import DocumentChunk
    from sqlalchemy import text

    chunks_result = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.doc_id == doc.id)
        .order_by(DocumentChunk.chunk_index)
        .limit(5)
    )
    chunks = chunks_result.scalars().all()

    context = "\n\n".join([f"[Часть {c.chunk_index + 1}]:\n{c.content}" for c in chunks])

    messages = [
        {
            "role": "user",
            "content": f"Документ: {doc.filename}\n\nКонтекст:\n{context}\n\nВопрос: {data.question}"
        }
    ]

    system_prompt = "Ты — аналитик документов. Отвечай только на основе предоставленного контекста. Цитируй источники (часть документа). Если информации нет в контексте — так и скажи."

    async def generate():
        from app.services.providers.llm_openai import get_economy_provider
        from app.services.credits import check_and_deduct, estimate_llm_credits, estimate_tokens

        total_credits = RAG_QUERY_CREDITS
        provider = get_economy_provider()
        full_response = ""

        async for chunk in provider.chat_stream(messages=messages, system_prompt=system_prompt):
            full_response += chunk
            yield f"data: {json.dumps({'delta': chunk})}\n\n"

        llm_cost = estimate_llm_credits(estimate_tokens(data.question + full_response), "economy")
        total_credits += llm_cost

        await check_and_deduct(db, str(user.id), total_credits, "charge", description=f"RAG: {doc.filename}")
        yield f"data: {json.dumps({'done': True, 'credits_used': total_credits})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc = await db.get(Document, uuid.UUID(doc_id))
    if not doc or doc.user_id != user.id:
        raise HTTPException(404, "Document not found")

    import os
    if os.path.exists(f"/app{doc.file_url}"):
        os.remove(f"/app{doc.file_url}")

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted"}
