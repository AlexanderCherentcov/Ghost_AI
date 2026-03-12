import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore, DEFAULT_MODE } from '../../store/chatStore'
import { userApi, chatApi } from '../../api/client'
import type { BackendMode } from '../../types'
import styles from './HomePage.module.scss'

const QUICK_ACTIONS = [
  { modeId: 'general_chat', icon: '💬', title: 'Чат с ИИ',    desc: 'Вопросы, идеи, анализ текста' },
  { modeId: 'code_assistant',icon: '⌨️', title: 'Код',         desc: 'Написать, отладить, объяснить' },
  { modeId: 'copywriter',   icon: '✍️', title: 'Копирайтер',   desc: 'Продающие тексты, 3 тона' },
  { modeId: 'translator',   icon: '🌐', title: 'Переводчик',   desc: 'Переводит смысл, не слова' },
  { modeId: 'brainstorm',   icon: '⚡', title: 'Брейншторм',   desc: 'Идеи и нестандартные решения' },
  { modeId: null,           icon: '🤖', title: 'Модели',       desc: '9+ нейросетей на выбор' },
]

interface Stats {
  tokensUsed: number
  tokensLimit: number
  dailyUsed: number
  plan: string
}

interface RecentChat {
  mode_id: string
  content: string
  created_at: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setActiveMode } = useChatStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentChats, setRecentChats] = useState<RecentChat[]>([])
  const [backendModes, setBackendModes] = useState<Record<string, BackendMode>>({})

  useEffect(() => {
    // Load balance/stats
    userApi.balance().then(res => {
      const d = res.data
      setStats({
        tokensUsed: d.daily_used ?? 0,
        tokensLimit: d.daily_limit ?? 0,
        dailyUsed: d.daily_used ?? 0,
        plan: d.plan_id ?? 'free',
      })
    }).catch(() => {})

    // Load recent chat history
    chatApi.history(undefined, 1).then(res => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(res.data) ? res.data : ((res.data as any)?.messages ?? [])
      setRecentChats(raw.slice(0, 5))
    }).catch(() => {})

    // Load modes map
    chatApi.modes().then(res => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any[] = Array.isArray(res.data) ? res.data : []
      const map: Record<string, BackendMode> = {}
      raw.forEach(m => { map[m.id] = m })
      setBackendModes(map)
    }).catch(() => {})
  }, [])

  const goChat = (modeId?: string | null) => {
    if (modeId === null) {
      navigate('/models')
      return
    }
    if (modeId && backendModes[modeId]) {
      setActiveMode(backendModes[modeId])
    } else {
      setActiveMode(DEFAULT_MODE)
    }
    navigate('/chat')
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      const now = new Date()
      const diff = now.getTime() - d.getTime()
      if (diff < 86400000) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
      if (diff < 172800000) return 'вчера'
      return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>Ghost AI</div>
          <div className={styles.hdrSub}>● онлайн · {stats?.plan?.toUpperCase() ?? 'FREE'} план</div>
        </div>
        <div className={styles.hdrActions}>
          <button className={styles.iconBtn} onClick={() => goChat('general_chat')} aria-label="Новый чат">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.content}>

        {/* Welcome card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeGhost}>👻</div>
          <div className={styles.welcomeText}>
            <h2>Привет, {user?.username || 'Ghost User'}!</h2>
            <p>Ваш ИИ-ассистент готов к работе. Текст, код, изображения и многое другое.</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className={styles.sectionTitle}>Сегодня</div>
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{stats.dailyUsed}</div>
                <div className={styles.statLbl}>запросов</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{stats.plan.toUpperCase()}</div>
                <div className={styles.statLbl}>тариф</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{recentChats.length}</div>
                <div className={styles.statLbl}>сообщений</div>
              </div>
            </div>
          </>
        )}

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
        {recentChats.length > 0 && (
          <>
            <div className={styles.sectionTitle}>Недавние сообщения</div>
            <div className={styles.chatList}>
              {recentChats.map((c, i) => {
                const mode = backendModes[c.mode_id]
                return (
                  <button key={i} className={styles.chatItem} onClick={() => goChat(c.mode_id)}>
                    <div className={styles.ciIcon}>{mode?.icon_emoji ?? '💬'}</div>
                    <div className={styles.ciBody}>
                      <div className={styles.ciTitle}>{mode?.title ?? c.mode_id}</div>
                      <div className={styles.ciPreview}>{c.content?.slice(0, 60)}…</div>
                    </div>
                    <div className={styles.ciTime}>{formatTime(c.created_at)}</div>
                  </button>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
