import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import styles from './Navbar.module.scss'

export default function Navbar() {
  const { user, balance, logout } = useAuthStore()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const [visible, setVisible] = useState(!isLanding)

  useEffect(() => {
    if (!isLanding) { setVisible(true); return }

    // Show nav after intro scroll or small delay
    const timer = setTimeout(() => setVisible(true), 1200)
    const onScroll = () => { if (window.scrollY > 80) setVisible(true) }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isLanding])

  return (
    <nav className={`${styles.nav} ${isLanding ? styles.landing : styles.app} ${visible ? styles.visible : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoG}>👻</span>
          GHOST AI
        </Link>

        {isLanding ? (
          <>
            <ul className={styles.links}>
              <li><a href="#features">Возможности</a></li>
              <li><a href="#pricing">Тарифы</a></li>
              <li><a href="#telegram">Telegram</a></li>
              <li><a href="#footer">Контакты</a></li>
            </ul>
            <div className={styles.navActs}>
              <Link to="/login" className="btn btn--outline-cyan btn--sm">Войти</Link>
              <Link to="/dashboard" className="btn btn--gold btn--sm">Начать →</Link>
            </div>
          </>
        ) : (
          <div className={styles.appRight}>
            {balance && (
              <div className={styles.credits}>
                <span className={styles.creditsIcon}>💜</span>
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
