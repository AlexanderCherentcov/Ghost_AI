import { useLocation, useNavigate } from 'react-router-dom'
import styles from './BottomNav.module.scss'

const TABS = [
  {
    path: '/home',
    label: 'Главная',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5C8' : 'rgba(226,217,255,.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    path: '/chat',
    label: 'Чат',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5C8' : 'rgba(226,217,255,.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    path: '/models',
    label: 'Модели',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5C8' : 'rgba(226,217,255,.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="9" height="9" rx="2"/>
        <rect x="13" y="2" width="9" height="9" rx="2"/>
        <rect x="2" y="13" width="9" height="9" rx="2"/>
        <rect x="13" y="13" width="9" height="9" rx="2"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Профиль',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5C8' : 'rgba(226,217,255,.35)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {TABS.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`${styles.btn} ${active ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className={styles.iconWrap}>{tab.icon(active)}</span>
            <span className={styles.label}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
