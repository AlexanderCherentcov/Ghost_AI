import { IconToken } from '../Icons/Icons'
import styles from './TokenBadge.module.scss'

interface TokenBadgeProps {
  balance: number
  className?: string
}

export default function TokenBadge({ balance, className }: TokenBadgeProps) {
  return (
    <div className={`${styles.badge} ${className ?? ''}`}>
      <IconToken size={14} />
      <span className={styles.value}>{balance.toLocaleString()}</span>
    </div>
  )
}
