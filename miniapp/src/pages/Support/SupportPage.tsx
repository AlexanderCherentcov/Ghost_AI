import { useState } from 'react'
import styles from './SupportPage.module.scss'

const FAQS = [
  {
    q: 'Как пополнить баланс токенов?',
    a: 'Перейдите в раздел «Тарифы» и выберите подходящий план. Оплата через YooKassa.',
  },
  {
    q: 'Почему запрос не выполняется?',
    a: 'Убедитесь, что у вас достаточно токенов. Если баланс в норме — попробуйте сменить режим или обратитесь в поддержку.',
  },
  {
    q: 'Что такое токены?',
    a: 'Токены — внутренняя валюта Ghost AI. Каждый запрос к нейросети списывает определённое количество токенов в зависимости от режима.',
  },
  {
    q: 'Как сменить план?',
    a: 'В разделе «Тарифы» нажмите «Подключить» напротив нужного плана. Старый план будет деактивирован автоматически.',
  },
  {
    q: 'Есть ли реферальная программа?',
    a: 'Да! Скоро запустим реферальную систему с бонусами. Следите за обновлениями.',
  },
]

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null)

  const openTelegram = () => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) tg.openTelegramLink('https://t.me/ghostai_support')
    else window.open('https://t.me/ghostai_support', '_blank')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logoWrap}>
          <span className={styles.logoEmoji}>👻</span>
          <h1 className={styles.title}>Поддержка</h1>
        </div>
        <p className={styles.sub}>Мы всегда готовы помочь</p>
      </div>

      <button className={styles.tgBtn} onClick={openTelegram}>
        <span>✈️</span>
        Написать в поддержку
      </button>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Частые вопросы</h2>

        {FAQS.map((faq, i) => (
          <div key={i} className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}>
            <button
              className={styles.faqQ}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{faq.q}</span>
              <span className={styles.faqArrow}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <p className={styles.faqA}>{faq.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>Ghost AI © 2025 · Версия 1.0</p>
      </div>
    </div>
  )
}
