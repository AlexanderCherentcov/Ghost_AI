import { useState, useEffect } from 'react'
import { plansApi } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import styles from './PlansPage.module.scss'

interface Plan {
  id: string
  name: string
  price_rub_month: number
  credits_monthly: number
  credits_daily_limit: number
  features: string[]
}

const PLAN_COLORS: Record<string, { from: string; to: string }> = {
  free:    { from: '#2D1B69', to: '#1A0033' },
  starter: { from: '#1a3a4a', to: '#0d2030' },
  pro:     { from: '#2a1a4a', to: '#1a0a30' },
  creator: { from: '#3a1a20', to: '#200a10' },
  elite:   { from: '#3a2a00', to: '#1a1200' },
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    plansApi.list().then(r => setPlans(r.data)).catch(() => {})
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (loading) return
    setLoading(planId)
    try {
      const r = await plansApi.subscribe(planId)
      const url = r.data.payment_url
      if (url) {
        const tg = (window as any).Telegram?.WebApp
        if (tg) tg.openLink(url)
        else window.open(url, '_blank')
      }
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Тарифы</h1>
        <p className={styles.sub}>Выберите план для расширенного доступа</p>
      </div>

      <div className={styles.list}>
        {plans.map((plan, i) => {
          const colors = PLAN_COLORS[plan.id] ?? PLAN_COLORS.pro
          const isCurrent = user?.plan_id === plan.id
          const isFree = plan.price_rub_month === 0

          return (
            <div
              key={plan.id}
              className={`${styles.card} ${isCurrent ? styles.current : ''}`}
              style={{
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                animationDelay: `${i * 0.07}s`,
              }}
            >
              {isCurrent && <div className={styles.badge}>Текущий</div>}

              <div className={styles.cardHeader}>
                <h2 className={styles.planName}>{plan.name}</h2>
                <div className={styles.price}>
                  {isFree ? (
                    <span className={styles.free}>Бесплатно</span>
                  ) : (
                    <>
                      <span className={styles.amount}>{plan.price_rub_month} ₽</span>
                      <span className={styles.period}>/мес</span>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.credits}>
                <span className={styles.creditsNum}>{plan.credits_monthly.toLocaleString()}</span>
                <span className={styles.creditsLabel}>токенов/мес</span>
              </div>

              {Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className={styles.features}>
                  {plan.features.slice(0, 4).map((f, j) => (
                    <li key={j} className={styles.feature}>
                      <span className={styles.check}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {!isFree && !isCurrent && (
                <button
                  className={styles.btn}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!loading}
                >
                  {loading === plan.id ? 'Загрузка...' : 'Подключить'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
