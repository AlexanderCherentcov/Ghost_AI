import { useState, useEffect } from 'react'
import { userApi } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import styles from './AccountPage.module.scss'

interface Balance {
  total: number
  monthly_quota: number
  monthly_quota_used: number
  daily_limit: number
  daily_used: number
}

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const [balance, setBalance] = useState<Balance | null>(null)

  useEffect(() => {
    userApi.balance().then(r => setBalance(r.data)).catch(() => {})
  }, [])

  const monthlyPct = balance
    ? Math.min(100, Math.round((balance.monthly_quota_used / (balance.monthly_quota || 1)) * 100))
    : 0

  const dailyPct = balance
    ? Math.min(100, Math.round((balance.daily_used / (balance.daily_limit || 1)) * 100))
    : 0

  const avatar = user?.username?.[0]?.toUpperCase() ?? 'G'

  return (
    <div className={styles.page}>
      {/* Profile */}
      <div className={styles.profile}>
        <div className={styles.avatar}>{avatar}</div>
        <div className={styles.info}>
          <h2 className={styles.username}>{user?.username ?? 'Пользователь'}</h2>
          <span className={styles.planBadge}>{user?.plan_id ?? 'free'}</span>
        </div>
      </div>

      {/* Balance card */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>Баланс токенов</p>
        <p className={styles.balanceNum}>{(balance?.total ?? 0).toLocaleString()}</p>

        {balance && (
          <div className={styles.bars}>
            <div className={styles.barRow}>
              <span>Месячная квота</span>
              <span>{balance.monthly_quota_used.toLocaleString()} / {balance.monthly_quota.toLocaleString()}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${monthlyPct}%`, background: 'linear-gradient(90deg, #FFD700, #FFE55C)' }} />
            </div>

            <div className={styles.barRow} style={{ marginTop: 12 }}>
              <span>Дневной лимит</span>
              <span>{balance.daily_used.toLocaleString()} / {balance.daily_limit.toLocaleString()}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${dailyPct}%`, background: 'linear-gradient(90deg, #00F5FF, #E5E4E2)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.logoutBtn} onClick={logout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
