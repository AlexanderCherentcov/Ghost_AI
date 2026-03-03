import { useUIStore } from '@/store/uiStore'
import styles from './Toast.module.scss'

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>
            {t.type === 'success' && '✓'}
            {t.type === 'error' && '✕'}
            {t.type === 'info' && 'ℹ'}
            {t.type === 'warning' && '⚠'}
          </span>
          <span className={styles.message}>{t.message}</span>
          <button className={styles.close} onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
