import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import styles from './Navbar.module.scss'

export default function Navbar() {
  const { user, balance, logout } = useAuthStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <nav className={`${styles.nav} ${isLanding ? styles.landing : styles.app}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          GHOST <span className={styles.sparkle}>✦</span> AI
        </Link>

        {isLanding ? (
          <>
            <ul className={styles.links}>
              <li><a href="#features">Возможности</a></li>
              <li><a href="#pricing">Тарифы</a></li>
              <li><a href="#footer">Контакты</a></li>
            </ul>
            <Link to="/login" className="btn btn--gold btn--sm">Войти →</Link>
          </>
        ) : (
          <div className={styles.appRight}>
            {balance && (
              <div className={styles.credits}>
                <span className={styles.creditsIcon}>💰</span>
                <span className={styles.creditsNum}>{balance.total}</span>
                <span className={styles.creditsLabel}>кредитов</span>
                <span className={styles.planBadge}>{balance.plan_id}</span>
              </div>
            )}
            <div className={styles.user}>
              <span className={styles.username}>{user?.username || 'Пользователь'}</span>
              <button className={styles.logout} onClick={logout}>Выйти</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
