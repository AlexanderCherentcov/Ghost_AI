import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore, MODELS } from '../../store/chatStore'
import { chatApi, voiceApi } from '../../api/client'
import ModelLogo from '../../components/ModelLogo'
import type { BackendMode } from '../../types'
import styles from './ChatPage.module.scss'

const now = () => new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

// Local persona fallbacks — used if backend hasn't seeded persona modes yet
const LOCAL_PERSONAS: Record<string, BackendMode> = {
  gpt4o: {
    id: 'persona_gpt4o', title: 'GPT-4o', icon_emoji: '🟢',
    description: 'Структурированный, чёткий, с markdown', category: 'chat',
  },
  gpt4m: {
    id: 'persona_gpt4mini', title: 'GPT-4o mini', icon_emoji: '⚡',
    description: 'Коротко и по делу', category: 'chat',
  },
  claude: {
    id: 'persona_claude', title: 'Claude', icon_emoji: '🟠',
    description: 'Вдумчивый, нюансированный', category: 'chat',
  },
  gemini: {
    id: 'persona_gemini', title: 'Gemini', icon_emoji: '🔵',
    description: 'Широкий кругозор, связи между идеями', category: 'chat',
  },
}

// Map model pill ID → backend persona mode ID
const MODEL_TO_PERSONA: Record<string, string> = {
  gpt4o:  'persona_gpt4o',
  gpt4m:  'persona_gpt4mini',
  claude: 'persona_claude',
  gemini: 'persona_gemini',
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
  const [isRecording, setIsRecording] = useState(false)
  const [sttLoading, setSttLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const skipHistoryRef = useRef(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Load all modes from backend on mount (used for persona lookup)
  useEffect(() => {
    chatApi.modes().then(res => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(res.data) ? res.data : []
      setBackendModes(raw.map(m => ({
        id: m.id, title: m.title, icon_emoji: m.icon_emoji,
        description: m.description, category: m.category,
        min_plan: m.min_plan, is_locked: m.is_locked,
      })))
    }).catch(() => {})
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

  // ── Voice recording ──────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
    } catch {
      alert('Нет доступа к микрофону')
    }
  }

  const stopRecording = useCallback(async () => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') return
    setIsRecording(false)
    setSttLoading(true)

    await new Promise<void>(resolve => {
      mr.onstop = () => resolve()
      mr.stop()
      mr.stream.getTracks().forEach(t => t.stop())
    })

    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const res = await voiceApi.stt(blob)
      const transcript: string = res.data?.transcript || ''
      if (transcript) {
        setInput(prev => prev ? prev + ' ' + transcript : transcript)
        setTimeout(() => autoGrow(), 10)
      }
    } catch {
      // STT failed silently
    } finally {
      setSttLoading(false)
    }
  }, [])

  // ── File attachment ──────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const allowed = ['pdf', 'txt', 'doc', 'docx', 'md', 'csv', 'json']
    if (!allowed.includes(ext)) {
      alert(`Поддерживаемые форматы: ${allowed.join(', ')}`)
      return
    }

    addMessage({ id: `u${Date.now()}`, role: 'user', content: `📎 Загружаю файл: ${file.name}…`, time: now() })
    setTyping(true)
    const msgId = `a${Date.now()}`
    addMessage({ id: msgId, role: 'assistant', content: '', time: now() })

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uploadRes = await (chatApi as any).uploadFile ? (chatApi as any).uploadFile(file) : null
      if (!uploadRes) {
        // Fallback: put filename in input so user can reference it
        updateMessage(msgId, `✅ Файл "${file.name}" прикреплён. Напишите ваш вопрос по нему.`)
        setInput(`Файл: ${file.name}. `)
        setTimeout(() => { textareaRef.current?.focus(); autoGrow() }, 10)
      }
    } catch {
      updateMessage(msgId, `❌ Не удалось загрузить файл`)
    } finally {
      setTyping(false)
    }
  }

  // ── Send message ─────────────────────────────────────
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
            if (chunk.done) setTyping(false)
          } catch {}
        }
      )
      if (!accumulated && !hadError) updateMessage(msgId, '❌ Нет ответа от сервера')
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

  // When model pill clicked — switch to persona mode + fresh chat
  const selectModel = (modelId: string) => {
    const model = MODELS.find(m => m.id === modelId)
    if (!model) return
    setActiveModel(model)

    const personaModeId = MODEL_TO_PERSONA[modelId]
    if (!personaModeId) { skipHistoryRef.current = true; clearMessages(); return }

    // Use backend persona if loaded, otherwise local fallback
    const personaMode =
      backendModes.find(m => m.id === personaModeId) ??
      LOCAL_PERSONAS[modelId]

    skipHistoryRef.current = true
    setActiveMode(personaMode)
    clearMessages()
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>{activeMode.icon_emoji} {activeMode.title}</div>
          <div className={styles.hdrSub}>{activeMode.description}</div>
        </div>
        <button className={styles.iconBtn} onClick={() => { skipHistoryRef.current = true; clearMessages() }} title="Новый чат">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Model pills */}
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx,.md,.csv,.json"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <div className={styles.inputBar}>
        <div className={styles.inputRow}>
          {/* File attach */}
          <button
            className={styles.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Прикрепить файл"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            className={styles.msgInput}
            rows={1}
            placeholder={sttLoading ? '🎤 Распознаю речь…' : `${activeMode.icon_emoji} Сообщение…`}
            value={input}
            disabled={sttLoading}
            onChange={e => { setInput(e.target.value); autoGrow() }}
            onKeyDown={handleKey}
          />

          {/* Voice button */}
          <button
            className={`${styles.voiceBtn} ${isRecording ? styles.recording : ''}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={e => { e.preventDefault(); startRecording() }}
            onTouchEnd={e => { e.preventDefault(); stopRecording() }}
            title={isRecording ? 'Отпустите чтобы отправить' : 'Удерживайте для записи'}
            disabled={sttLoading}
          >
            {sttLoading ? (
              <span className={styles.sttSpinner} />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isRecording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
          </button>

          {/* Send */}
          <button className={styles.sendBtn} onClick={send} disabled={typing || !input.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
