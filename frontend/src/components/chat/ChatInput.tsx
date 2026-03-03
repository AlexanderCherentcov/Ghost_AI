import { useState, KeyboardEvent } from 'react'
import { useAutoResize } from '@/hooks'
import styles from './ChatInput.module.scss'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useAutoResize(value)

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || 'Напишите сообщение... (Enter — отправить)'}
          disabled={disabled}
          rows={1}
        />
        <button
          className={`${styles.send} ${disabled || !value.trim() ? styles.sendDisabled : ''}`}
          onClick={submit}
          disabled={disabled || !value.trim()}
        >
          {disabled ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      <div className={styles.hint}>Enter — отправить &nbsp;·&nbsp; Shift+Enter — новая строка</div>
    </div>
  )
}
