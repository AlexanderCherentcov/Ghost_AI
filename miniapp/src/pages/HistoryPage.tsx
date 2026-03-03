import { useEffect, useState } from 'react'
import { chatApi } from '../api/client'

export default function HistoryPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chatApi.history(undefined, 1).then((r) => {
      setMessages(r.data.messages || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">📜 История</h1>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin text-3xl">⚡</div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">История пуста</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-white/5 border border-white/10'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">{msg.role === 'user' ? '👤 Вы' : '🤖 Ghost AI'}</span>
                <span className="text-xs text-gray-500">{msg.mode_id}</span>
              </div>
              <p className="text-white line-clamp-3">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
