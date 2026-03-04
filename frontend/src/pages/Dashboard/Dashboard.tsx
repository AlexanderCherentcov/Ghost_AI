import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, streamChat } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useBalance } from '@/hooks'
import Sidebar from '@/components/layout/Sidebar'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import type { Mode, Message } from '@/types'
import styles from './Dashboard.module.scss'

export default function Dashboard() {
  const { token } = useAuthStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()
  const { refetch: refetchBalance } = useBalance()

  const [modes, setModes] = useState<Mode[]>([])
  const [activeMode, setActiveMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    chatApi.modes()
      .then(({ data }) => setModes(data))
      .catch(() => addToast('error', 'Не удалось загрузить режимы'))
  }, [token, navigate, addToast])

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const selectMode = useCallback(async (modeId: string) => {
    const mode = modes.find((m) => m.id === modeId)
    if (!mode) return
    setActiveMode(mode)
    setMessages([])
    setLoadingHistory(true)
    try {
      const { data } = await chatApi.history(modeId)
      setMessages(data)
    } catch {
      // no history
    } finally {
      setLoadingHistory(false)
      scrollBottom()
    }
  }, [modes, scrollBottom])

  const sendMessage = useCallback(async (content: string) => {
    if (!activeMode || streaming) return

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      content_type: 'text',
      credits_charged: 0,
      created_at: new Date().toISOString(),
    }
    const aiMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      content_type: 'text',
      credits_charged: 0,
      created_at: new Date().toISOString(),
      streaming: true,
    }

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setStreaming(true)
    scrollBottom()

    try {
      const requestId = crypto.randomUUID()
      for await (const chunk of streamChat(activeMode.id, content, requestId)) {
        if (chunk.error) {
          addToast('error', chunk.error)
          setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
          break
        }
        if (chunk.delta) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id ? { ...m, content: m.content + chunk.delta } : m,
            ),
          )
          scrollBottom()
        }
        if (chunk.done) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id
                ? { ...m, streaming: false, credits_charged: chunk.credits_used ?? 0 }
                : m,
            ),
          )
          refetchBalance()
        }
      }
    } catch {
      addToast('error', 'Ошибка соединения')
      setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
    } finally {
      setStreaming(false)
    }
  }, [activeMode, streaming, addToast, scrollBottom, refetchBalance])

  return (
    <div className={styles.layout}>
      <Sidebar
        modes={modes}
        activeMode={activeMode?.id ?? null}
        onSelect={selectMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={styles.main}>
        {!activeMode ? (
          <div className={styles.empty}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              ☰ Режимы
            </button>
            <div className={styles.emptyGhost}>👻</div>
            <h2 className={styles.emptyTitle}>Выберите режим</h2>
            <p className={styles.emptySub}>
              {modes.length > 0
                ? `${modes.filter(m => !m.is_locked).length} режимов доступно`
                : 'Загрузка...'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                ☰
              </button>
              <span className={styles.chatIcon}>{activeMode.icon_emoji}</span>
              <div className={styles.chatInfo}>
                <div className={styles.chatTitle}>{activeMode.title}</div>
                <div className={styles.chatDesc}>{activeMode.description}</div>
              </div>
              <button
                className={styles.clearBtn}
                onClick={() => {
                  chatApi.clearHistory(activeMode.id)
                  setMessages([])
                }}
                title="Очистить историю"
              >
                🗑
              </button>
            </div>

            <div className={styles.messages}>
              {loadingHistory ? (
                <div className={styles.loadingHistory}>Загрузка истории...</div>
              ) : messages.length === 0 ? (
                <div className={styles.startHint}>
                  <span className={styles.startIcon}>{activeMode.icon_emoji}</span>
                  <p>Начните разговор с <strong>{activeMode.title}</strong></p>
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
              <div ref={bottomRef} />
            </div>

            <ChatInput
              onSend={sendMessage}
              disabled={streaming}
              placeholder={`Спросите ${activeMode.title}...`}
            />
          </>
        )}
      </div>

      {/* Right panel */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Информация</div>
        {activeMode && (
          <div className={styles.modeInfo}>
            <div className={styles.modeInfoIcon}>{activeMode.icon_emoji}</div>
            <div className={styles.modeInfoName}>{activeMode.title}</div>
            <div className={styles.modeInfoDesc}>{activeMode.description}</div>
            <div className={styles.modeInfoMeta}>
              <span>Модель: <strong>{activeMode.model_policy?.tier || 'economy'}</strong></span>
              <span>Мин. план: <strong>{activeMode.min_plan}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
