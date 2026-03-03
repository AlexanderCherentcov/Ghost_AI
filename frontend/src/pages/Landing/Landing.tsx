import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.scss'

const FEATURES = [
  {
    icon: '💬', title: 'Умный чат',
    desc: '50+ текстовых режимов: копирайтер, юрист, бизнес-аналитик, программист и другие.',
    models: ['GPT-4o', 'Claude 3.5', 'Llama 3', 'Gemini'],
  },
  {
    icon: '🎨', title: 'Генерация изображений',
    desc: 'Создавайте фотореализм, иллюстрации, логотипы. Разрешение до 1024px.',
    models: ['Stable Diffusion XL', 'DALL-E 3', 'Flux'],
  },
  {
    icon: '🎤', title: 'Голос: STT + TTS',
    desc: 'Распознавание речи и синтез голоса. Голосовой ввод в Telegram.',
    models: ['Whisper v3', 'OpenAI TTS', 'ElevenLabs'],
  },
  {
    icon: '📄', title: 'Анализ документов',
    desc: 'Загрузите PDF и задавайте вопросы. ИИ найдёт нужное со ссылкой на источник.',
    models: ['GPT-4o', 'pgvector', 'Claude'],
  },
  {
    icon: '💻', title: 'Код и разработка',
    desc: '12 режимов для разработчиков: написание, ревью, отладка, архитектура.',
    models: ['GPT-4o', 'Claude 3.5', 'DeepSeek Coder'],
  },
  {
    icon: '⚡', title: 'API & Telegram Bot',
    desc: 'REST API для интеграций. Telegram Bot с Mini App и голосовым вводом.',
    models: ['REST API', 'Telegram Bot', 'Webhooks'],
  },
]

const STATS = [
  { icon: '🧠', number: '90+', label: 'AI-режимов' },
  { icon: '🚀', number: '<3с', label: 'Среднее время ответа' },
  { icon: '🎨', number: '∞', label: 'Генераций' },
  { icon: '🌍', number: '3', label: 'Платформы' },
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: '0', period: '',
    credits: '15 кредитов разово',
    features: ['15 базовых режимов', 'Только текстовый чат', 'История 5 сообщений'],
    featured: false,
  },
  {
    id: 'starter', name: 'Starter', price: '490', period: '₽/мес',
    credits: '800 кредитов/мес',
    features: ['40 режимов', 'STT — голос → текст', 'Файлы до 10 МБ'],
    featured: false,
  },
  {
    id: 'pro', name: 'Pro', price: '890', period: '₽/мес',
    credits: '2 500 кредитов/мес',
    features: ['75 режимов', 'Изображения 512px', 'STT + TTS', 'RAG 3 документа'],
    featured: true,
  },
  {
    id: 'creator', name: 'Creator', price: '1 690', period: '₽/мес',
    credits: '8 000 кредитов/мес',
    features: ['Все 90 режимов', 'HD 1024px', 'RAG 20 документов', 'Приоритет'],
    featured: false,
  },
  {
    id: 'elite', name: 'Elite 👑', price: '5 990', period: '₽/мес',
    credits: '40 000 кредитов/мес',
    features: ['Видео генерация', 'API доступ', 'RAG 100 документов', 'Макс. приоритет'],
    featured: false,
  },
]

const GALLERY = [
  { img: 'photo-1686904423955-b928225c6488', cat: 'ИЗОБРАЖЕНИЯ', title: 'Портрет-футуризм', model: 'Stable Diffusion XL' },
  { img: 'photo-1677442136019-21780ecad995', cat: 'НЕЙРОАРТ', title: 'Цифровая абстракция', model: 'DALL-E 3' },
  { img: 'photo-1707343843437-caacff5cfa74', cat: 'КОНЦЕПТ-АРТ', title: '3D персонаж', model: 'Midjourney v6' },
  { img: 'photo-1709884735626-63e92727d8b6', cat: 'ФОТОРЕАЛИЗМ', title: 'Архитектура', model: 'SDXL Realistic' },
  { img: 'photo-1675557009779-80f3e358f35f', cat: 'ИЛЛЮСТРАЦИИ', title: 'Фэнтези пейзаж', model: 'Stable Diffusion' },
  { img: 'photo-1676277791608-ac5a8a3bc3e8', cat: 'АНИМАЦИЯ', title: 'Киберпанк сцена', model: 'AnimateDiff' },
]

export default function Landing() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(styles.revealed)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    )
    document.querySelectorAll(`.${styles.reveal}`).forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroPulse} />
        <div className={styles.floatImgs}>
          {['photo-1677442136019-21780ecad995', 'photo-1686904423955-b928225c6488',
            'photo-1707343843437-caacff5cfa74', 'photo-1709884735626-63e92727d8b6'].map((img, i) => (
            <div key={i} className={`${styles.floatImg} ${styles[`floatImg${i + 1}`]}`}>
              <img src={`https://images.unsplash.com/${img}?w=300&h=300&fit=crop`} alt="" loading="lazy" />
            </div>
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✦ ПРЕМИУМ AI ПЛАТФОРМА ✦</div>
          <h1 className={styles.heroTitle}>
            90 Режимов<br />Одна Подписка
          </h1>
          <p className={styles.heroSub}>
            ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion, Whisper и ещё 85+ AI-инструментов.
            Тексты, изображения, голос, документы — без ограничений.
          </p>
          <div className={styles.heroBtns}>
            <Link to="/dashboard" className="btn btn--gold btn--lg">Начать бесплатно</Link>
            <a href="#features" className="btn btn--outline-cyan btn--lg">Возможности</a>
          </div>
        </div>

        <div className={styles.scrollIndicator} ref={scrollRef}>
          <svg viewBox="0 0 30 50">
            <rect x="5" y="5" width="20" height="40" rx="10" />
            <circle cx="15" cy="10" r="3" className={styles.scrollDot} />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {STATS.map((s, i) => (
            <div key={i} className={`${styles.statCard} ${styles.reveal}`}>
              <span className={styles.statIcon}>{s.icon}</span>
              <div className={styles.statNum}>{s.number}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className={styles.section} id="showcase">
        <div className="section-header">
          <div className="section-header__tag">✦ Галерея</div>
          <h2 className="section-header__title">Созданное с Ghost AI</h2>
          <p className="section-header__subtitle">Примеры работ из разных режимов</p>
        </div>
        <div className={styles.gallery}>
          {GALLERY.map((item, i) => (
            <div key={i} className={`${styles.galleryItem} ${styles.reveal}`}>
              <img
                className={styles.galleryImg}
                src={`https://images.unsplash.com/${item.img}?w=600&h=400&fit=crop`}
                alt={item.title}
                loading="lazy"
              />
              <div className={styles.galleryOverlay}>
                <div className={styles.galleryCat}>{item.cat}</div>
                <div className={styles.galleryTitle}>{item.title}</div>
                <div className={styles.galleryModel}>{item.model}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.section} id="features">
        <div className="section-header">
          <div className="section-header__tag">✦ Возможности</div>
          <h2 className="section-header__title">Всё в одном месте</h2>
          <p className="section-header__subtitle">От текста до изображений и голоса</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`${styles.featureCard} ${styles.reveal}`}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
              <div className={styles.featureModels}>
                {f.models.map((m) => <span key={m} className="badge badge--gold">{m}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className="section-header">
          <div className="section-header__tag">✦ Тарифы</div>
          <h2 className="section-header__title">Тарифные планы</h2>
          <p className="section-header__subtitle">Начни бесплатно, расти без ограничений</p>
        </div>
        <div className={styles.pricingGrid}>
          {PLANS.map((p) => (
            <div key={p.id} className={`${styles.priceCard} ${p.featured ? styles.featured : ''} ${styles.reveal}`}>
              {p.featured && <div className={styles.popularBadge}>ПОПУЛЯРНЫЙ</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planPrice}>
                {p.price}<span>{p.period}</span>
              </div>
              <div className={styles.planCredits}>{p.credits}</div>
              <ul className={styles.planFeatures}>
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link
                to="/login"
                className={`btn ${p.featured ? 'btn--gold' : 'btn--outline-cyan'} ${styles.planBtn}`}
              >
                {p.id === 'free' ? 'Начать бесплатно' : `Выбрать ${p.name.split(' ')[0]}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} id="footer">
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>GHOST ✦ AI</div>
            <p>Премиум платформа для доступа к 90+ AI-инструментам. Telegram Bot, Mini App и веб-интерфейс.</p>
            <div className={styles.socials}>
              {['TG', 'X', 'YT', 'VK'].map((s) => (
                <a key={s} href="#" className={styles.socialLink}>{s}</a>
              ))}
            </div>
          </div>
          {[
            { title: 'Продукт', links: ['Возможности', 'Тарифы', 'API', 'Roadmap'] },
            { title: 'Ресурсы', links: ['Документация', 'Блог', 'Поддержка', 'Сообщество'] },
            { title: 'Компания', links: ['О нас', 'Партнёры', 'Контакты', 'Политика'] },
          ].map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          © 2026 Ghost AI. Premium AI Platform. Все права защищены.
        </div>
      </footer>
    </div>
  )
}
