import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore, MODELS } from '../../store/chatStore'
import { chatApi } from '../../api/client'
import ModelLogo from '../../components/ModelLogo'
import type { BackendMode } from '../../types'
import styles from './ChatPage.module.scss'

const now = () => new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

// Map model pill ID → backend persona mode ID
const MODEL_TO_PERSONA: Record<string, string> = {
  gpt4o:  'persona_gpt4o',
  gpt4m:  'persona_gpt4mini',
  claude: 'persona_claude',
  gemini: 'persona_gemini',
}

// Category labels in Russian
const CATEGORY_LABELS: Record<string, string> = {
  chat:        '💬 Чат',
  code:        '💻 Код',
  content:     '✍️ Контент',
  business:    '📊 Бизнес',
  image:       '🎨 Изображения',
  voice:       '🎤 Голос',
  docs:        '📄 Документы',
  education:   '📐 Обучение',
  creative:    '🖊️ Творчество',
  productivity:'⚡ Продуктивность',
}

export default function ChatPage() {
  const {
    activeModel, activeMode, messages,
    addMessage, updateMessage, clearMessages,
    setActiveModel, setActiveMode, setMessages,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [backendModes, setBackendModes] = useState<BackendMode[]>([])
  const [modesLoading, setModesLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const skipHistoryRef = useRef(false)

  // Load all modes from backend on mount
  useEffect(() => {
    chatApi.modes().then(res => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(res.data) ? res.data : []
      const modes: BackendMode[] = raw.map(m => ({
        id: m.id,
        title: m.title,
        icon_emoji: m.icon_emoji,
        description: m.description,
        category: m.category,
        min_plan: m.min_plan,
        is_locked: m.is_locked,
      }))
      setBackendModes(modes)
    }).catch(() => {}).finally(() => setModesLoading(false))
  }, [])

  // Load history when mode changes (skip when switching model pills)
  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false
      return
    }
    chatApi.history(activeMode.id, 1).then(res => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(res.data) ? res.data : ((res.data as any)?.messages ?? [])
      const msgs = raw.map(m => ({
        id: String(m.id),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        time: m.created_at
          ? new Date(m.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
          : '',
      }))
      setMessages(msgs)
    }).catch(() => { /* keep welcome */ })
  }, [activeMode.id, setMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const send = useCallback(async () => {
    const txt = input.trim()
    if (!txt || typing) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage({ id: `u${Date.now()}`, role: 'user', content: txt, time: now() })
    setTyping(true)

    const requestId = `${Date.now()}`
    const msgId = `a${requestId}`
    let accumulated = ''
    let hadError = false

    addMessage({ id: msgId, role: 'assistant', content: '', time: now() })

    try {
      await chatApi.stream(
        { mode_id: activeMode.id, content: txt, request_id: requestId } as any,
        (rawChunk) => {
          try {
            const chunk = JSON.parse(rawChunk)
            if (chunk.delta) {
              accumulated += chunk.delta
              updateMessage(msgId, accumulated)
            }
            if (chunk.error) {
              hadError = true
              updateMessage(msgId, `❌ ${chunk.error}`)
              setTyping(false)
            }
            if (chunk.done) {
              setTyping(false)
            }
          } catch {}
        }
      )
      if (!accumulated && !hadError) {
        updateMessage(msgId, '❌ Нет ответа от сервера')
      }
    } catch (e: any) {
      const errMsg = e?.response?.data?.detail?.error || e?.message || 'Ошибка соединения'
      updateMessage(msgId, `❌ ${errMsg}`)
    } finally {
      setTyping(false)
    }
  }, [input, typing, activeMode, addMessage, updateMessage])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // Group modes by category for display
  const modesByCategory = backendModes.reduce<Record<string, BackendMode[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = []
    acc[m.category].push(m)
    return acc
  }, {})

  const selectMode = (mode: BackendMode) => {
    setActiveMode(mode)
    clearMessages()
  }

  // When model pill clicked — switch to persona mode + start fresh chat
  const selectModel = (modelId: string) => {
    const model = MODELS.find(m => m.id === modelId)
    if (!model) return
    setActiveModel(model)
    const personaModeId = MODEL_TO_PERSONA[modelId]
    if (personaModeId && backendModes.length > 0) {
      const personaMode = backendModes.find(m => m.id === personaModeId)
      if (personaMode) {
        skipHistoryRef.current = true  // skip history load on mode change
        setActiveMode(personaMode)
        clearMessages()
      }
    }
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>{activeMode.icon_emoji} {activeMode.title}</div>
          <div className={styles.hdrSub}>{activeMode.description}</div>
        </div>
        <div className={styles.hdrActions}>
          <button className={styles.iconBtn} onClick={() => clearMessages()} title="Новый чат">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Model pills (visual only) */}
      <div className={`${styles.selectorBar} ${styles.modelPills}`}>
        {MODELS.map(m => (
          <button
            key={m.id}
            className={`${styles.selPill} ${m.id === activeModel.id ? styles.active : ''}`}
            onClick={() => selectModel(m.id)}
          >
            <ModelLogo modelId={m.id} size={16} />
            <span className={styles.pillLabel}>{m.name}</span>
          </button>
        ))}
      </div>

      {/* Mode selector — all backend modes grouped by category */}
      <div className={styles.modeSection}>
        {modesLoading ? (
          <div className={styles.modesLoading}>Загрузка режимов...</div>
        ) : (
          Object.entries(modesByCategory).map(([cat, modes]) => (
            <div key={cat} className={styles.modeGroup}>
              <div className={styles.modeGroupLabel}>{CATEGORY_LABELS[cat] ?? cat}</div>
              <div className={styles.modeChips}>
                {modes.map(m => (
                  <button
                    key={m.id}
                    className={`${styles.modeChip} ${m.id === activeMode.id ? styles.active : ''} ${m.is_locked ? styles.locked : ''}`}
                    onClick={() => !m.is_locked && selectMode(m)}
                    title={m.description}
                  >
                    <span className={styles.modeEmoji}>{m.icon_emoji}</span>
                    <span className={styles.chipLabel}>{m.title}</span>
                    {m.is_locked && <span className={styles.lockIcon}>🔒</span>}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Messages */}
      <div className={styles.msgList}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : ''}`}>
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar}>
                <ModelLogo modelId={activeModel.id} size={22} />
              </div>
            )}
            <div className={styles.msgBubble}>
              {msg.content || (typing && msg.id.startsWith('a') ? (
                <div className={styles.typingDots}><span /><span /><span /></div>
              ) : '')}
            </div>
            {msg.content && <div className={styles.msgTime}>{msg.time}</div>}
          </div>
        ))}
        {typing && !messages.some(m => m.id.startsWith('a') && !m.content) && (
          <div className={styles.msgRow}>
            <div className={styles.msgAvatar}><ModelLogo modelId={activeModel.id} size={22} /></div>
            <div className={styles.msgBubble}>
              <div className={styles.typingDots}><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className={styles.inputBar}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={styles.msgInput}
            rows={1}
            placeholder={`${activeMode.icon_emoji} ${activeMode.title}...`}
            value={input}
            onChange={e => { setInput(e.target.value); autoGrow() }}
            onKeyDown={handleKey}
          />
          <button className={styles.sendBtn} onClick={send} disabled={typing}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
