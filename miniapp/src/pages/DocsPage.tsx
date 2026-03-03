import { useEffect, useState, useRef } from 'react'
import { docsApi } from '../api/client'

export default function DocsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadDocs() }, [])

  const loadDocs = async () => {
    try {
      const r = await docsApi.list()
      setDocs(r.data)
    } finally { setLoading(false) }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await docsApi.upload(file)
      loadDocs()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить документ?')) return
    await docsApi.delete(id)
    setDocs(docs.filter((d) => d.id !== id))
  }

  const STATUS_COLOR: Record<string, string> = {
    pending: 'text-yellow-400',
    indexing: 'text-blue-400',
    ready: 'text-green-400',
    error: 'text-red-400',
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-yellow-400">📄 Документы</h1>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1 bg-yellow-400 text-black text-sm font-semibold rounded-lg"
        >
          + Загрузить
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={handleUpload} />
      </div>

      <div className="p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin text-3xl">⚡</div>
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-sm">Загрузите документ для анализа</p>
            <p className="text-xs text-gray-600 mt-1">PDF, TXT, MD, DOCX · Max 25MB</p>
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{doc.filename}</p>
                <p className="text-xs text-gray-500">{(doc.size_bytes / 1024).toFixed(1)} KB · {doc.chunk_count} чанков</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className={`text-xs ${STATUS_COLOR[doc.status] || 'text-gray-400'}`}>{doc.status}</span>
                <button onClick={() => handleDelete(doc.id)} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
