import styles from './MessageBubble.module.scss'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  cost?: number
  streaming?: boolean
}

export default function MessageBubble({ role, content, cost, streaming }: MessageBubbleProps) {
  return (
    <div className={`${styles.wrap} ${styles[role]}`}>
      <div className={styles.bubble}>
        <p className={styles.text}>{content}</p>
        {streaming && <span className={styles.cursor} />}
      </div>
      {role === 'assistant' && cost !== undefined && cost > 0 && (
        <div className={styles.cost}>−{cost} токенов</div>
      )}
    </div>
  )
}
