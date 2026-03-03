import { useState } from 'react'
import type { Mode } from '@/types'
import styles from './Sidebar.module.scss'

const CATEGORIES: Record<string, string> = {
  chat: '💬 Чат',
  code: '💻 Код',
  content: '✍️ Контент',
  image: '🎨 Изображения',
  voice: '🎤 Голос',
  docs: '📄 Документы',
  business: '📊 Бизнес',
  education: '📐 Обучение',
  creative: '🖊️ Творчество',
  productivity: '⚡ Продуктивность',
}

interface Props {
  modes: Mode[]
  activeMode: string | null
  onSelect: (modeId: string) => void
}

export default function Sidebar({ modes, activeMode, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = modes.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || m.category === activeCategory
    return matchSearch && matchCat
  })

  const categories = [...new Set(modes.map((m) => m.category))]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.search}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          placeholder="Поиск режимов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.cats}>
        <button
          className={`${styles.cat} ${!activeCategory ? styles.catActive : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`${styles.cat} ${activeCategory === cat ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            {CATEGORIES[cat]?.split(' ')[0] || '🤖'} {cat}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((mode) => (
          <button
            key={mode.id}
            className={`${styles.item} ${activeMode === mode.id ? styles.active : ''} ${mode.is_locked ? styles.locked : ''}`}
            onClick={() => !mode.is_locked && onSelect(mode.id)}
            title={mode.is_locked ? `Требуется план ${mode.min_plan}` : mode.description}
          >
            <span className={styles.itemIcon}>{mode.icon_emoji || '🤖'}</span>
            <div className={styles.itemBody}>
              <span className={styles.itemTitle}>{mode.title}</span>
              <span className={styles.itemCat}>{CATEGORIES[mode.category] || mode.category}</span>
            </div>
            {mode.is_locked && <span className={styles.lock}>🔒</span>}
          </button>
        ))}
      </div>
    </aside>
  )
}
