import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../api/client'

interface Mode {
  id: string
  title: string
  description?: string
  category: string
  icon_emoji?: string
  min_plan: string
  is_locked: boolean
}

const CATEGORIES = [
  { id: 'all', label: '🌟 Все' },
  { id: 'chat', label: '💬 Чат' },
  { id: 'code', label: '💻 Код' },
  { id: 'content', label: '✍️ Контент' },
  { id: 'image', label: '🎨 Изображения' },
  { id: 'voice', label: '🎤 Голос' },
  { id: 'docs', label: '📄 Документы' },
  { id: 'business', label: '📊 Бизнес' },
  { id: 'education', label: '🎓 Обучение' },
  { id: 'creative', label: '🖊️ Творчество' },
  { id: 'productivity', label: '⚡ Продуктивность' },
]

export default function HomePage() {
  const [modes, setModes] = useState<Mode[]>([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadModes()
  }, [])

  const loadModes = async () => {
    try {
      const resp = await chatApi.modes()
      setModes(resp.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = modes.filter((m) => {
    const matchCat = category === 'all' || m.category === category
    const matchSearch = !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleModeClick = (mode: Mode) => {
    if (mode.is_locked) {
      navigate('/plans')
      return
    }
    navigate(`/chat/${mode.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">👻 Ghost AI</h1>
        <input
          type="text"
          placeholder="Поиск режимов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide border-b border-white/10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              category === cat.id
                ? 'bg-yellow-400 text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Modes Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin text-3xl">⚡</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode)}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  mode.is_locked
                    ? 'border-white/5 bg-white/2 opacity-50'
                    : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8 active:scale-95'
                }`}
              >
                {mode.is_locked && (
                  <span className="absolute top-2 right-2 text-xs">🔒</span>
                )}
                <div className="text-2xl mb-1">{mode.icon_emoji || '🤖'}</div>
                <div className="text-sm font-medium text-white leading-tight">{mode.title}</div>
                {mode.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{mode.description}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">🔍</div>
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  )
}
