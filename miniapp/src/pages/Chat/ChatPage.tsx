import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore, MODELS, MODES } from '../../store/chatStore'
import { chatApi } from '../../api/client'
import ModelLogo from '../../components/ModelLogo'
import styles from './ChatPage.module.scss'

const now = () => new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

// Map miniapp mode IDs → backend mode IDs
const MODE_MAP: Record<string, string> = {
  text:  'general_chat',
  code:  'code_assistant',
  image: 'general_chat',
  video: 'general_chat',
  audio: 'general_chat',
}

const IMAGE_PARAMS = [
  { options: ['Реализм', 'Аниме', 'Cinematic', '3D Art', 'Sketch'] },
  { options: ['1:1', '16:9', '9:16', '3:4'] },
  { options: ['1 шт', '2 шт', '4 шт'] },
]
const VIDEO_PARAMS = [
  { options: ['5 сек', '10 сек', '15 сек', '30 сек'] },
  { options: ['720p', '1080p', '4K'] },
  { options: ['Реалистичный', 'Cinematic', 'Анимация'] },
]
const AUDIO_PARAMS = [
  { options: ['Авто жанр', 'Pop', 'Hip-hop', 'Electronic', 'Ambient', 'Rock'] },
  { options: ['30 сек', '1 мин', '2 мин', '3 мин'] },
  { options: ['Энергичное', 'Расслабляющее', 'Эпическое', 'Грустное'] },
]

export default function ChatPage() {
  const { activeModel, activeMode, messages, addMessage, updateMessage, clearMessages, setActiveModel, setActiveMode } = useChatStore()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    const backendModeId = MODE_MAP[activeMode.id] ?? 'general_chat'
    const requestId = `${Date.now()}`
    const msgId = `a${requestId}`
    let accumulated = ''
    let hadError = false

    // Add placeholder message for streaming
    addMessage({ id: msgId, role: 'assistant', content: '', time: now() })

    try {
      await chatApi.stream(
        { mode_id: backendModeId, content: txt, request_id: requestId } as any,
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

  const selectModel = (id: string) => {
    const model = MODELS.find(m => m.id === id)
    if (!model) return
    setActiveModel(model)
    if (!model.tags.includes(activeMode.id)) {
      const compat = MODES.find(m => model.tags.includes(m.id))
      if (compat) setActiveMode(compat)
    }
  }

  const selectMode = (id: string) => {
    const mode = MODES.find(m => m.id === id)
    if (!mode) return
    setActiveMode(mode)
    if (!activeModel.tags.includes(id)) {
      const compat = MODELS.find(m => m.tags.includes(id))
      if (compat) setActiveModel(compat)
    }
  }

  const genParams =
    activeMode.id === 'image' ? IMAGE_PARAMS :
    activeMode.id === 'video' ? VIDEO_PARAMS :
    activeMode.id === 'audio' ? AUDIO_PARAMS : null

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>{activeModel.name}</div>
          <div className={styles.hdrSub}>{activeMode.icon} {activeMode.label}</div>
        </div>
        <div className={styles.hdrActions}>
          <button className={styles.iconBtn} onClick={() => { clearMessages() }} title="Новый чат">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button className={styles.iconBtn} onClick={() => { clearMessages() }} title="Домой">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </button>
        </div>
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

      {/* Mode chips */}
      <div className={styles.selectorBar}>
        {MODES.map(m => (
          <button
            key={m.id}
            className={`${styles.modeChip} ${m.id === activeMode.id ? styles.active : ''}`}
            onClick={() => selectMode(m.id)}
          >
            <span>{m.icon}</span>
            <span className={styles.chipLabel}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Gen params */}
      {genParams && (
        <div className={styles.genParams}>
          {genParams.map((p, i) => (
            <select key={i} className={styles.gpSelect}>
              {p.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
      )}

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
          <button className={styles.attachBtn}>📎</button>
          <textarea
            ref={textareaRef}
            className={styles.msgInput}
            rows={1}
            placeholder={activeMode.placeholder}
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
