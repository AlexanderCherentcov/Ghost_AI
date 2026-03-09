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
          <span className={styles.logoG}>
            <svg width="22" height="28" viewBox="0 0 22 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 1C5.48 1 1 5.48 1 11v15l2.75-2.5 2.75 2.5 2.75-2.5L11 26l2.75-2.5 2.75 2.5 2.75-2.5L21 26V11C21 5.48 16.52 1 11 1z" fill="rgba(124,58,237,.35)" stroke="rgba(167,139,250,.75)" strokeWidth="1"/>
              <circle cx="7.5" cy="10.5" r="2.2" fill="rgba(0,229,200,.95)"/>
              <circle cx="8.4" cy="9.6"  r="0.8" fill="white" opacity=".9"/>
              <circle cx="14.5" cy="10.5" r="2.2" fill="rgba(0,229,200,.95)"/>
              <circle cx="15.4" cy="9.6"  r="0.8" fill="white" opacity=".9"/>
              <path d="M7.5 16.5Q11 20 14.5 16.5" stroke="rgba(0,229,200,.9)" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            </svg>
          </span>
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
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
