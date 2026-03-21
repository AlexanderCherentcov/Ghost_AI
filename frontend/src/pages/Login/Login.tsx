import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import type { User } from '@/types'
import styles from './Login.module.scss'

export default function Login() {
  const { setAuth, token } = useAuthStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()

  const [tgState, setTgState] = useState<'idle' | 'waiting'>('idle')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cancelRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  // Handle OAuth redirect with ?token= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthToken = params.get('token')
    if (!oauthToken) return
    window.history.replaceState({}, '', window.location.pathname)
    localStorage.setItem('token', oauthToken)
    authApi.me().then(({ data: user }) => {
      setAuth(oauthToken, user as User)
      navigate('/dashboard')
    }).catch(() => {
      localStorage.removeItem('token')
      addToast('error', 'Ошибка авторизации. Попробуйте снова.')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup polling on unmount
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (cancelRef.current) clearTimeout(cancelRef.current)
  }, [])

  const handleTelegram = async () => {
    try {
      const { data } = await authApi.telegramLoginRequest()
      setTgState('waiting')
      window.open(data.bot_url, '_blank')

      pollRef.current = setInterval(async () => {
        try {
          const { data: result } = await authApi.telegramLoginCheck(data.token)
          if (result.status === 'confirmed' && result.access_token && result.user) {
            clearInterval(pollRef.current!)
            clearTimeout(cancelRef.current!)
            setAuth(result.access_token, result.user as User)
            navigate('/dashboard')
          }
        } catch (e: any) {
          if (e.response?.status === 404) {
            clearInterval(pollRef.current!)
            setTgState('idle')
            addToast('error', 'Ссылка устарела. Попробуйте ещё раз.')
          }
        }
      }, 2000)

      // Auto-cancel after 5 min
      cancelRef.current = setTimeout(() => {
        clearInterval(pollRef.current!)
        setTgState('idle')
      }, 300_000)
    } catch {
      addToast('error', 'Не удалось запустить авторизацию')
    }
  }

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
          <button
            className={`${styles.oauthBtn} ${styles.telegram}`}
            onClick={handleTelegram}
            disabled={tgState === 'waiting'}
          >
            <span className={styles.oauthIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </span>
            {tgState === 'waiting' ? 'Ожидаем подтверждения...' : 'Войти через Telegram'}
          </button>

          {tgState === 'waiting' && (
            <p className={styles.tgHint}>
              Откройте бот в Telegram и нажмите <b>Start</b>
            </p>
          )}

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
