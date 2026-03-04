import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '../../api/client'
import MessageBubble from '../../components/ui/MessageBubble/MessageBubble'
import TokenBadge from '../../components/ui/TokenBadge/TokenBadge'
import { IconSend, IconBack, IconModes } from '../../components/ui/Icons/Icons'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import styles from './ChatPage.module.scss'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  cost?: number
}

export default function ChatPage() {
  const { user } = useAuthStore()
  const { activeMode } = useChatStore()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [balance, setBalance] = useState(user?.balance ?? 0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const conversationId = useRef(uuidv4())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg: Message = { id: uuidv4(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    const assistantId = uuidv4()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', cost: 0 }])
    setStreaming(true)

    let accumulated = ''
    let cost = 0

    try {
      await chatApi.stream(
        {
          message: text,
          mode_id: activeMode?.id ?? 'general',
          conversation_id: conversationId.current,
        },
        (chunk: string) => {
          try {
            const data = JSON.parse(chunk)
            if (data.content) {
              accumulated += data.content
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
              )
            }
            if (data.credits_used) {
              cost = data.credits_used
              setBalance(prev => Math.max(0, prev - data.credits_used))
            }
          } catch {
            accumulated += chunk
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
            )
          }
        }
      )
    } catch (e: any) {
      const errMsg = e?.response?.data?.detail ?? 'Ошибка. Попробуйте ещё раз.'
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: errMsg } : m)
      )
    } finally {
      setStreaming(false)
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, cost } : m)
      )
    }
  }, [input, streaming, activeMode])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const modeLabel = activeMode?.name ?? 'Универсальный'
  const modeEmoji = activeMode?.emoji ?? '🤖'
  const modeCost  = activeMode?.cost ?? 1

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={() => navigate('/modes')}>
          <IconBack size={20} />
        </button>

        <div className={styles.modeInfo} onClick={() => navigate('/modes')}>
          <span className={styles.modeEmoji}>{modeEmoji}</span>
          <span className={styles.modeName}>{modeLabel}</span>
        </div>

        <TokenBadge balance={balance} />
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyEmoji}>{modeEmoji}</span>
            <p className={styles.emptyTitle}>{modeLabel}</p>
            <p className={styles.emptyHint}>Напишите сообщение, чтобы начать</p>
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            cost={m.cost}
            streaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        <div className={styles.costHint}>
          <span>~{modeCost} {modeCost === 1 ? 'токен' : 'токенов'} за запрос</span>
        </div>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={styles.input}
            placeholder="Сообщение..."
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            className={`${styles.sendBtn} ${(!input.trim() || streaming) ? styles.disabled : ''}`}
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
          >
            <IconSend size={18} />
          </button>
        </div>
        <button className={styles.modeSwitch} onClick={() => navigate('/modes')}>
          <IconModes size={14} active={false} />
          <span>Сменить режим</span>
        </button>
      </div>
    </div>
  )
}
