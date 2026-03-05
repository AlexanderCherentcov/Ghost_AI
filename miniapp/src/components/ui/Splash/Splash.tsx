import { useEffect, useState } from 'react'
import styles from './Splash.module.scss'

const AI_NAMES = [
  'GPT-4o', 'Claude', 'Gemini', 'Llama', 'Midjourney',
  'DALL·E', 'Sora', 'Whisper', 'Stable Diffusion', 'Runway',
  'Mistral', 'Grok',
]

interface SplashProps {
  onDone: () => void
}

export default function Splash({ onDone }: SplashProps) {
  const [nameIdx, setNameIdx] = useState(0)
  const [phase, setPhase] = useState<'enter' | 'names' | 'exit'>('enter')

  useEffect(() => {
    // Phase 1: header animates in (0-400ms)
    const t1 = setTimeout(() => setPhase('names'), 400)

    // Phase 2: cycle AI names every 130ms (400ms – 2000ms = ~12 names)
    let i = 0
    const interval = setInterval(() => {
      i++
      setNameIdx(i % AI_NAMES.length)
      if (i >= AI_NAMES.length + 3) {
        clearInterval(interval)
        setPhase('exit')
      }
    }, 130)

    // Phase 3: fade out and call onDone
    const t2 = setTimeout(() => onDone(), 2600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearInterval(interval)
    }
  }, [onDone])

  return (
    <div className={`${styles.splash} ${phase === 'exit' ? styles.exit : ''}`}>
      <div className="ghost-bg" />

      <div className={styles.content}>
        <div className={`${styles.badge} ${phase !== 'enter' ? styles.visible : ''}`}>
          90 в 1
        </div>

        <div className={styles.nameWrap}>
          {phase === 'names' && (
            <span key={nameIdx} className={styles.aiName}>
              {AI_NAMES[nameIdx]}
            </span>
          )}
        </div>

        <div className={`${styles.logo} ${phase !== 'enter' ? styles.visible : ''}`}>
          <span className={styles.logoText}>Ghost</span>
          <span className={styles.logoGold}>AI</span>
        </div>

        <p className={`${styles.sub} ${phase !== 'enter' ? styles.visible : ''}`}>
          Искусственный интеллект нового поколения
        </p>
      </div>
    </div>
  )
}
