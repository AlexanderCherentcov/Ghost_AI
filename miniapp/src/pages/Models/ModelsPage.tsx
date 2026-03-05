import { useNavigate } from 'react-router-dom'
import { useChatStore, MODELS, MODES } from '../../store/chatStore'
import styles from './ModelsPage.module.scss'

const CATEGORIES = [
  { label: 'Текст и код', tags: ['text', 'code'] },
  { label: 'Изображения',  tags: ['image'] },
  { label: 'Видео',        tags: ['video'] },
  { label: 'Аудио',        tags: ['audio'] },
]

export default function ModelsPage() {
  const navigate = useNavigate()
  const { activeModel, setActiveModel, setActiveMode } = useChatStore()

  const selectModel = (id: string) => {
    const model = MODELS.find(m => m.id === id)
    if (!model) return
    setActiveModel(model)
    const compat = MODES.find(m => model.tags.includes(m.id))
    if (compat) setActiveMode(compat)
    navigate('/chat')
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>Модели ИИ</div>
          <div className={styles.hdrSub}>Выберите нейросеть</div>
        </div>
        <div className={styles.hdrActions}>
          <button className={styles.iconBtn} onClick={() => navigate('/chat')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Models list */}
      <div className={styles.content}>
        {CATEGORIES.map(cat => {
          const catModels = MODELS.filter(m => cat.tags.some(t => m.tags.includes(t)))
          if (!catModels.length) return null
          return (
            <div key={cat.label} className={styles.category}>
              <div className={styles.catLabel}>{cat.label}</div>
              {catModels.map(model => (
                <button
                  key={model.id}
                  className={`${styles.modelCard} ${model.id === activeModel.id ? styles.selected : ''}`}
                  onClick={() => selectModel(model.id)}
                >
                  <div className={styles.mcIcon} style={{ background: model.iconBg }}>
                    {model.icon}
                  </div>
                  <div className={styles.mcBody}>
                    <div className={styles.mcName}>{model.name}</div>
                    <div className={styles.mcDesc}>{model.desc}</div>
                    <div className={styles.mcBadges}>
                      <span
                        className={styles.badgeTag}
                        style={{ background: `${model.badgeColor}22`, color: model.badgeColor }}
                      >
                        {model.badge}
                      </span>
                      <span className={`${styles.badgeTag} ${styles.speed}`}>{model.speed}</span>
                      {model.ctx !== '—' && (
                        <span className={`${styles.badgeTag} ${styles.ctx}`}>{model.ctx}</span>
                      )}
                    </div>
                  </div>
                  <div className={`${styles.mcCheck} ${model.id === activeModel.id ? styles.checked : ''}`}>
                    {model.id === activeModel.id && '✓'}
                  </div>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
