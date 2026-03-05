import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore, MODES, MODELS } from '../../store/chatStore'
import styles from './HomePage.module.scss'

const QUICK_ACTIONS = [
  { modeId: 'text',  icon: '💬', title: 'Чат с ИИ',    desc: 'Вопросы, идеи, анализ текстов' },
  { modeId: 'image', icon: '🖼️', title: 'Изображение', desc: 'FLUX.1 · DALL-E 3 · SD' },
  { modeId: 'code',  icon: '⌨️', title: 'Код',          desc: 'Написать, отладить, объяснить' },
  { modeId: 'video', icon: '🎬', title: 'Видео',        desc: 'Kling 1.6 · Runway Gen-3' },
  { modeId: 'audio', icon: '🎵', title: 'Музыка',       desc: 'Suno v4 · любой жанр' },
  { modeId: null,    icon: '🤖', title: 'Модели',       desc: '9+ нейросетей на выбор' },
]

const RECENT_CHATS = [
  { title: 'SEO-статья про ИИ',      preview: 'Напиши статью на 2000 слов...', time: '12:34', icon: '📝' },
  { title: 'Landing Page React',     preview: 'Создай компонент hero-секции...', time: 'вчера', icon: '💻' },
  { title: 'Логотип для бренда',     preview: 'Минималистичный логотип...', time: 'пн', icon: '🎨' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setActiveMode, setActiveModel } = useChatStore()

  const goChat = (modeId?: string | null) => {
    if (modeId) {
      const mode = MODES.find(m => m.id === modeId)
      if (mode) {
        setActiveMode(mode)
        // pick compatible model
        const model = MODELS.find(m => m.tags.includes(modeId))
        if (model) setActiveModel(model)
      }
    }
    if (modeId === null) {
      navigate('/models')
    } else {
      navigate('/chat')
    }
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>Ghost AI</div>
          <div className={styles.hdrSub}>● онлайн · PRO план</div>
        </div>
        <div className={styles.hdrActions}>
          <button className={styles.iconBtn} onClick={() => goChat('text')} aria-label="Новый чат">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button className={styles.iconBtn} aria-label="Уведомления">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.content}>

        {/* Welcome card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeGhost}>👻</div>
          <div className={styles.welcomeText}>
            <h2>Привет, {user?.username || 'Ghost User'}!</h2>
            <p>Ваш ИИ-ассистент готов к работе. Текст, код, изображения, видео и музыка.</p>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.sectionTitle}>Этот месяц</div>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>487k</div>
            <div className={styles.statLbl}>токенов</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>34</div>
            <div className={styles.statLbl}>чатов</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statVal}>12</div>
            <div className={styles.statLbl}>картинок</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className={styles.sectionTitle}>Быстрый запуск</div>
        <div className={styles.quickGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <button key={i} className={styles.qcard} onClick={() => goChat(a.modeId)}>
              <div className={styles.qcardIcon}>{a.icon}</div>
              <div className={styles.qcardTitle}>{a.title}</div>
              <div className={styles.qcardDesc}>{a.desc}</div>
            </button>
          ))}
        </div>

        {/* Recent chats */}
        <div className={styles.sectionTitle}>Недавние чаты</div>
        <div className={styles.chatList}>
          {RECENT_CHATS.map((c, i) => (
            <button key={i} className={styles.chatItem} onClick={() => navigate('/chat')}>
              <div className={styles.ciIcon}>{c.icon}</div>
              <div className={styles.ciBody}>
                <div className={styles.ciTitle}>{c.title}</div>
                <div className={styles.ciPreview}>{c.preview}</div>
              </div>
              <div className={styles.ciTime}>{c.time}</div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
