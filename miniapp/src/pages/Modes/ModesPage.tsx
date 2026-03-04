import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../../api/client'
import { IconSearch, IconLock } from '../../components/ui/Icons/Icons'
import { useChatStore } from '../../store/chatStore'
import styles from './ModesPage.module.scss'

interface Mode {
  id: string
  name: string
  description: string
  category: string
  emoji: string
  is_premium: boolean
  credits_per_message: number
}

const CATEGORIES = [
  { id: 'all',   label: 'Все' },
  { id: 'chat',  label: 'Чат' },
  { id: 'code',  label: 'Код' },
  { id: 'content', label: 'Контент' },
  { id: 'image', label: 'Изображения' },
  { id: 'video', label: 'Видео' },
  { id: 'voice', label: 'Голос' },
  { id: 'docs',  label: 'Документы' },
  { id: 'business', label: 'Бизнес' },
  { id: 'education', label: 'Обучение' },
  { id: 'creative', label: 'Творчество' },
]

export default function ModesPage() {
  const [modes, setModes] = useState<Mode[]>([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const setActiveMode = useChatStore(s => s.setActiveMode)

  useEffect(() => {
    chatApi.modes().then(r => setModes(r.data)).catch(() => {})
  }, [])

  const filtered = modes.filter(m => {
    const matchCat = category === 'all' || m.category === category
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSelect = (mode: Mode) => {
    if (mode.is_premium) {
      navigate('/plans')
      return
    }
    setActiveMode({ id: mode.id, name: mode.name, emoji: mode.emoji, cost: mode.credits_per_message })
    navigate('/chat')
  }

  return (
    <div className={styles.page}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <IconSearch size={16} />
        <input
          className={styles.search}
          placeholder="Поиск режима..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className={styles.categories}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`${styles.pill} ${category === c.id ? styles.active : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Mode grid */}
      <div className={styles.grid}>
        {filtered.map((mode, i) => (
          <button
            key={mode.id}
            className={`${styles.card} ${mode.is_premium ? styles.premium : ''}`}
            onClick={() => handleSelect(mode)}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className={styles.cardTop}>
              <span className={styles.emoji}>{mode.emoji || '🤖'}</span>
              {mode.is_premium && (
                <span className={styles.lock}><IconLock size={12} /></span>
              )}
            </div>
            <span className={styles.name}>{mode.name}</span>
            <span className={styles.cat}>{mode.category}</span>
            {mode.credits_per_message > 0 && (
              <span className={styles.cost}>{mode.credits_per_message} ток.</span>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className={styles.empty}>Ничего не найдено</div>
        )}
      </div>
    </div>
  )
}
