import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useChatStore, MODELS } from '../../store/chatStore'
import styles from './ProfilePage.module.scss'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { activeModel, setActiveModel } = useChatStore()
  const [notifications, setNotifications] = useState(true)
  const [saveHistory, setSaveHistory] = useState(true)

  return (
    <div className={styles.screen}>
      {/* Header */}
      <div className={styles.hdr}>
        <div>
          <div className={styles.hdrTitle}>Профиль</div>
          <div className={styles.hdrSub}>Настройки аккаунта</div>
        </div>
      </div>

      <div className={styles.content}>

        {/* Avatar section */}
        <div className={styles.avatarSection}>
          <div className={styles.bigAvatar}>👻</div>
          <div className={styles.avName}>{user?.username || 'Ghost User'}</div>
          <div className={styles.avPlan}>
            <span className={styles.avPlanDot} />
            PRO план активен
          </div>
        </div>

        {/* Plan card */}
        <div className={styles.planCard}>
          <div className={styles.planRow}>
            <div className={styles.planName}>SPECTER PRO</div>
            <div className={styles.planBadge}>990 ₽/мес</div>
          </div>

          <div className={styles.tokenBarWrap}>
            <div className={styles.tokenBarLabel}>
              <span>Токены использованы</span>
              <span>487k / 600k</span>
            </div>
            <div className={styles.tokenBar}>
              <div className={styles.tokenBarFill} style={{ width: '81%' }} />
            </div>
          </div>

          <div className={styles.tokenBarWrap} style={{ marginTop: '.5rem' }}>
            <div className={styles.tokenBarLabel}>
              <span>Изображения</span>
              <span>12 / 120</span>
            </div>
            <div className={styles.tokenBar}>
              <div
                className={styles.tokenBarFill}
                style={{ width: '10%', background: 'linear-gradient(90deg,#5B21B6,#A78BFA)' }}
              />
            </div>
          </div>
        </div>

        {/* Account settings */}
        <div className={styles.sectionTitle}>Аккаунт</div>
        <div className={styles.settingsGroup}>
          <div className={styles.settingsItem}>
            <div className={styles.siIcon} style={{ background: 'rgba(124,58,237,.2)' }}>👤</div>
            <div className={styles.siLabel}>{user?.username || 'Ghost User'}</div>
            <div className={styles.siArrow}>›</div>
          </div>
          <div className={styles.settingsItem}>
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
            <div className={styles.siArrowLabel}>{activeModel.name} ›</div>
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
