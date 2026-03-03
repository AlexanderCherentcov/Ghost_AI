import { useState } from 'react'
import { useCopy } from '@/hooks'
import type { Message } from '@/types'
import styles from './MessageBubble.module.scss'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await copy(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${styles.wrap} ${isUser ? styles.user : styles.ai}`}>
      {!isUser && (
        <div className={styles.avatar}>👻</div>
      )}

      <div className={styles.bubble}>
        <div className={styles.content}>
          {message.content}
          {message.streaming && (
            <span className={styles.cursor}>▌</span>
          )}
        </div>

        {!isUser && !message.streaming && message.content && (
          <div className={styles.actions}>
            <button className={styles.action} onClick={handleCopy}>
              {copied ? '✓ Скопировано' : '⎘ Копировать'}
            </button>
            {message.credits_charged > 0 && (
              <span className={styles.credits}>-{message.credits_charged} кред.</span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className={styles.avatar}>👤</div>
      )}
    </div>
  )
}
