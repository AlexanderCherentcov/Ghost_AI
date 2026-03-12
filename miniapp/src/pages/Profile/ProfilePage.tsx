import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore, MODELS } from '../../store/chatStore'
import { userApi } from '../../api/client'
import styles from './ProfilePage.module.scss'

interface Balance {
  balance: number
  bonus_balance: number
  total: number
  plan_id: string
  daily_used: number
  daily_limit: number | null
}

const PLAN_LABELS: Record<string, string> = {
  free:    'FREE',
  starter: 'STARTER',
  pro:     'PRO',
  creator: 'CREATOR',
  elite:   'ELITE',
}

const PLAN_PRICES: Record<string, string> = {
  free:    'Бесплатно',
  starter: '490 ₽/мес',
  pro:     '890 ₽/мес',
  creator: '1 690 ₽/мес',
  elite:   '5 990 ₽/мес',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeModel, setActiveModel } = useChatStore()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)

  useEffect(() => {
    userApi.balance().then(res => setBalance(res.data)).catch(() => {})
  }, [])

  const planLabel = PLAN_LABELS[balance?.plan_id ?? 'free'] ?? 'FREE'
  const planPrice = PLAN_PRICES[balance?.plan_id ?? 'free'] ?? 'Бесплатно'
  const dailyPct = balance?.daily_limit
    ? Math.min(100, Math.round((balance.daily_used / balance.daily_limit) * 100))
    : 0

  return (
    <div className={styles.screen}>
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>Профиль</div>
          <div className={styles.hdrSub}>Настройки аккаунта</div>
        </div>
      </div>

      <div className={styles.content}>

        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.bigAvatar}>👻</div>
          <div className={styles.avName}>{user?.username || 'Ghost User'}</div>
          <div className={styles.avPlan}>
            <span className={styles.avPlanDot} />
            {planLabel} план активен
          </div>
        </div>

        {/* Plan card */}
        {balance && (
          <div className={styles.planCard}>
            <div className={styles.planRow}>
              <div className={styles.planName}>{planLabel}</div>
              <div className={styles.planBadge}>{planPrice}</div>
            </div>

            <div className={styles.tokenBarWrap}>
              <div className={styles.tokenBarLabel}>
                <span>Кредиты</span>
                <span>{balance.total} кредитов</span>
              </div>
              <div className={styles.tokenBar}>
                <div className={styles.tokenBarFill} style={{ width: '100%' }} />
              </div>
            </div>

            {balance.daily_limit && (
              <div className={styles.tokenBarWrap} style={{ marginTop: '.5rem' }}>
                <div className={styles.tokenBarLabel}>
                  <span>Сегодня использовано</span>
                  <span>{balance.daily_used} / {balance.daily_limit}</span>
                </div>
                <div className={styles.tokenBar}>
                  <div
                    className={styles.tokenBarFill}
                    style={{
                      width: `${dailyPct}%`,
                      background: dailyPct > 80
                        ? 'linear-gradient(90deg,#ef4444,#f97316)'
                        : 'linear-gradient(90deg,#5B21B6,#A78BFA)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account settings */}
        <div className={styles.sectionTitle}>Аккаунт</div>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <div className={styles.siIcon} style={{ background: 'rgba(124,58,237,.2)' }}>👤</div>
            <div className={styles.siLabel}>{user?.username || 'Ghost User'}</div>
            <div className={styles.siArrow}>›</div>
          </div>
          <div className={styles.settingsItem} onClick={() => navigate('/plans')}>
            <div className={styles.siIcon} style={{ background: 'rgba(0,191,163,.15)' }}>💳</div>
            <div className={styles.siLabel}>Управление подпиской</div>
            <div className={styles.siArrow}>›</div>
          </div>
          <div className={styles.settingsItem}>
            <div className={styles.siIcon} style={{ background: 'rgba(245,158,11,.15)' }}>📊</div>
            <div className={styles.siLabel}>История использования</div>
            <div className={styles.siArrow}>›</div>
          </div>
        </div>

        {/* App settings */}
        <div className={styles.sectionTitle}>Настройки</div>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <div className={styles.siIcon} style={{ background: 'rgba(124,58,237,.2)' }}>🤖</div>
            <div className={styles.siLabel}>Модель по умолчанию</div>
            <select
              className={styles.siSelect}
              value={activeModel.id}
              onChange={e => {
                const m = MODELS.find(m => m.id === e.target.value)
                if (m) setActiveModel(m)
              }}
            >
              {MODELS.slice(0, 4).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.settingsItem} onClick={() => setNotifications(v => !v)}>
            <div className={styles.siIcon} style={{ background: 'rgba(239,68,68,.15)' }}>🔔</div>
            <div className={styles.siLabel}>Уведомления</div>
            <div className={`${styles.siToggle} ${notifications ? '' : styles.off}`} />
          </div>
          <div className={styles.settingsItem} onClick={() => setSaveHistory(v => !v)}>
            <div className={styles.siIcon} style={{ background: 'rgba(59,130,246,.15)' }}>💾</div>
            <div className={styles.siLabel}>Сохранять историю</div>
            <div className={`${styles.siToggle} ${saveHistory ? '' : styles.off}`} />
          </div>
          <div className={styles.settingsItem} onClick={() => navigate('/support')}>
            <div className={styles.siIcon} style={{ background: 'rgba(0,229,200,.1)' }}>🆘</div>
            <div className={styles.siLabel}>Поддержка</div>
            <div className={styles.siArrow}>›</div>
          </div>
        </div>

        {/* Logout */}
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem} onClick={logout}>
            <div className={styles.siIcon} style={{ background: 'rgba(239,68,68,.15)' }}>🚪</div>
            <div className={`${styles.siLabel} ${styles.danger}`}>Выйти из аккаунта</div>
            <div className={styles.siArrow}>›</div>
          </div>
        </div>

      </div>
    </div>
  )
}
