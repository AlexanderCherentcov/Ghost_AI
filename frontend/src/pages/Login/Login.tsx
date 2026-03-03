import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/api/client'
import { userApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { User } from '@/types'
import styles from './Login.module.scss'

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void
  }
}

export default function Login() {
  const { setAuth, token } = useAuthStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  // Inject Telegram Login Widget
  useEffect(() => {
    window.onTelegramAuth = async (tgUser) => {
      try {
        const { data } = await authApi.telegramWeb(tgUser as Parameters<typeof authApi.telegramWeb>[0])
        const me = await userApi.me()
        setAuth(data.access_token, me.data as User)
        navigate('/dashboard')
      } catch {
        addToast('error', 'Ошибка авторизации через Telegram')
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', import.meta.env.VITE_BOT_USERNAME || 'GhostAiBot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    document.getElementById('tg-widget')?.appendChild(script)

    return () => {
      delete window.onTelegramAuth
    }
  }, [setAuth, navigate, addToast])

  const handleGoogle = async () => {
    try {
      const { data } = await authApi.googleAuthorize()
      window.location.href = data.url
    } catch {
      addToast('error', 'Не удалось запустить Google авторизацию')
    }
  }

  const handleYandex = async () => {
    try {
      const { data } = await authApi.yandexAuthorize()
      window.location.href = data.url
    } catch {
      addToast('error', 'Не удалось запустить Яндекс авторизацию')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          GHOST <span>✦</span> AI
        </Link>
        <h1 className={styles.title}>Войти в аккаунт</h1>
        <p className={styles.sub}>Выберите способ входа</p>

        <div className={styles.methods}>
          {/* Telegram widget */}
          <div className={styles.tgWrap}>
            <div className={styles.methodLabel}>
              <span>📱</span> Через Telegram
            </div>
            <div id="tg-widget" className={styles.tgWidget} />
          </div>

          <div className={styles.divider}><span>или</span></div>

          <button className={styles.oauthBtn} onClick={handleGoogle}>
            <span className={styles.oauthIcon}>G</span>
            Войти через Google
          </button>

          <button className={`${styles.oauthBtn} ${styles.yandex}`} onClick={handleYandex}>
            <span className={styles.oauthIcon}>Я</span>
            Войти через Яндекс
          </button>
        </div>

        <p className={styles.terms}>
          Входя, вы принимаете{' '}
          <a href="#">Условия использования</a> и{' '}
          <a href="#">Политику конфиденциальности</a>
        </p>
      </div>
    </div>
  )
}
