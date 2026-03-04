import { useLocation, useNavigate } from 'react-router-dom'
import { IconChat, IconModes, IconPlans, IconAccount, IconSupport } from '../../ui/Icons/Icons'
import styles from './BottomNav.module.scss'

const TABS = [
  { path: '/chat',    label: 'Чат',       Icon: IconChat    },
  { path: '/modes',   label: 'Режимы',    Icon: IconModes   },
  { path: '/plans',   label: 'Тарифы',    Icon: IconPlans   },
  { path: '/account', label: 'Аккаунт',   Icon: IconAccount },
  { path: '/support', label: 'Поддержка', Icon: IconSupport },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className={styles.nav}>
      {TABS.map(({ path, label, Icon }) => {
        const active = location.pathname === path ||
          (path === '/chat' && location.pathname.startsWith('/chat'))
        return (
          <button
            key={path}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => navigate(path)}
          >
            <span className={styles.iconWrap}>
              {active && <span className={styles.ring} />}
              <Icon size={22} active={active} />
            </span>
            <span className={styles.label}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
