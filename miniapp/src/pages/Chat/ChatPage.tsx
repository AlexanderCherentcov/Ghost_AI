import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore, MODELS, MODES } from '../../store/chatStore'
import type { Message } from '../../types'
import styles from './ChatPage.module.scss'

const now = () => new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })

const DEMO_REPLIES: Record<string, string[]> = {
  text:  ['Отличный вопрос! Давайте разберём подробнее. 🌙', 'Понял задачу. Вот развёрнутый ответ — всё зависит от контекста и ваших целей.'],
  code:  ['```js\n// Ваша функция:\nfunction ghostAI(input) {\n  return input.split("").reverse().join("");\n}\n```\nКод готов — чистый и оптимизированный ✅'],
  image: ['🖼️ Генерирую изображение... FLUX.1 обрабатывает промпт. Готово! Изображение создано в выбранном стиле.'],
  video: ['🎬 Kling 1.6 генерирует видеосцену... Рендер займёт ~60 сек. Клип готов!'],
  audio: ['🎵 Suno v4 создаёт трек... Трек готов! 🎶 Продолжительность: 30 сек.'],
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
  const { activeModel, activeMode, messages, addMessage, clearMessages, setActiveModel, setActiveMode } = useChatStore()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const welcomeAdded = useRef(false)

  useEffect(() => {
    if (messages.length === 0 && !welcomeAdded.current) {
      welcomeAdded.current = true
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: 'Привет! Я Ghost AI. Выберите модель и режим вверху, затем напишите что-нибудь. 🌙',
        time: now(),
      })
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const send = useCallback(() => {
    const txt = input.trim()
    if (!txt || typing) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage({ id: `u${Date.now()}`, role: 'user', content: txt, time: now() })
    setTyping(true)

    const pool = DEMO_REPLIES[activeMode.id] ?? DEMO_REPLIES.text
    const reply = pool[Math.floor(Math.random() * pool.length)]
    setTimeout(() => {
      addMessage({ id: `a${Date.now()}`, role: 'assistant', content: reply, time: now() })
      setTyping(false)
    }, 900 + Math.random() * 700)
  }, [input, typing, activeMode, addMessage])

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
            <span>{m.icon}</span>
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
              <div className={styles.msgAvatar}>{activeModel.icon}</div>
            )}
            <div className={styles.msgBubble}>
              {msg.content}
            </div>
            <div className={styles.msgTime}>{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div className={styles.msgRow}>
            <div className={styles.msgAvatar}>{activeModel.icon}</div>
            <div className={styles.msgBubble}>
              <div className={styles.typingDots}>
                <span /><span /><span />
              </div>
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
          <button className={styles.sendBtn} onClick={send}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5,12 12,5 19,12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
