import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { streamChat } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  credits?: number
  streaming?: boolean
}

export default function ChatPage() {
  const { modeId } = useParams<{ modeId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !token) return

    const userMsg: Message = { id: uuidv4(), role: 'user', content: input.trim() }
    const assistantMsg: Message = { id: uuidv4(), role: 'assistant', content: '', streaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    try {
      for await (const chunk of streamChat(modeId!, userMsg.content, uuidv4(), token)) {
        if (chunk.error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `❌ ${chunk.error}`, streaming: false }
                : m
            )
          )
          break
        }

        if (chunk.delta) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: m.content + chunk.delta }
                : m
            )
          )
        }

        if (chunk.done) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, streaming: false, credits: chunk.credits_used }
                : m
            )
          )
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: '❌ Ошибка. Попробуйте ещё раз.', streaming: false }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
          ←
        </button>
        <h2 className="font-semibold text-white">{modeId?.replace(/_/g, ' ')}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Начните разговор</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white/10 text-white border border-white/10'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
                {msg.streaming && <span className="animate-pulse">▌</span>}
              </div>
              {msg.role === 'assistant' && msg.credits !== undefined && !msg.streaming && (
                <div className="text-xs text-gray-400 mt-1">-{msg.credits} кредитов</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none max-h-24 disabled:opacity-50"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 96) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="p-2 bg-yellow-400 hover:bg-yellow-300 rounded-xl text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isStreaming ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}
