import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.scss'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const BELT_ITEMS = [
  { color: '#7C3AED', label: 'ChatGPT' },
  { color: '#00E5C8', label: 'Claude' },
  { color: '#4285F4', label: 'Gemini' },
  { color: '#E63946', label: 'Midjourney' },
  { color: '#A78BFA', label: 'DALL·E 3' },
  { color: '#F59E0B', label: 'Sora' },
  { color: '#10B981', label: 'Llama 3' },
  { color: '#EC4899', label: 'Stable Diffusion' },
  { color: '#3B82F6', label: 'Whisper' },
  { color: '#F97316', label: 'Runway Gen-3' },
  { color: '#8B5CF6', label: 'FLUX.1 Pro' },
  { color: '#06B6D4', label: 'Suno v4' },
  { color: '#7C3AED', label: 'DeepSeek' },
  { color: '#00E5C8', label: 'ElevenLabs' },
  { color: '#F43F5E', label: 'Kling 1.6' },
]

const STATS = [
  { num: '90+',   label: 'AI-режимов' },
  { num: '3 сек', label: 'Среднее время ответа' },
  { num: '∞',     label: 'Генераций в месяц' },
  { num: '3',     label: 'Платформы' },
]

const TOOLS = [
  { icon: '🤖', name: 'GPT-4o',         desc: 'Флагман OpenAI. Текст и код.' },
  { icon: '🌊', name: 'Claude 3.5',     desc: '200k контекст, анализ.' },
  { icon: '💎', name: 'Gemini 1.5 Pro', desc: 'Мультимодальный Google.' },
  { icon: '🎨', name: 'FLUX.1 Pro',     desc: 'Лучшая генерация фото.' },
  { icon: '🖼️', name: 'DALL·E 3',       desc: 'Точные иллюстрации.' },
  { icon: '🎵', name: 'Suno v4',        desc: 'Музыка любого жанра.' },
  { icon: '🎬', name: 'Kling 1.6',      desc: 'Видео до 30 сек.' },
  { icon: '🎞️', name: 'Runway Gen-3',   desc: 'Кинематографическое видео.' },
  { icon: '⚡', name: 'Llama 3',        desc: 'Быстрый Open Source.' },
  { icon: '🔊', name: 'ElevenLabs',     desc: 'Синтез голоса.' },
  { icon: '📝', name: 'Whisper v3',     desc: 'Распознавание речи.' },
  { icon: '💻', name: 'DeepSeek Coder', desc: 'Профессиональный код.' },
]

const BENTO = [
  { icon: '💬', title: 'Умный чат',            desc: '50+ текстовых режимов: копирайтер, юрист, бизнес-аналитик, программист и ещё десятки специализаций.',         wide: false },
  { icon: '🎨', title: 'Изображения & Видео',  desc: 'FLUX, DALL·E 3, Stable Diffusion, Kling, Runway — фотореализм и кино из одного интерфейса.',                  wide: true  },
  { icon: '📄', title: 'RAG — документы',       desc: 'Загрузите PDF и задавайте вопросы. ИИ найдёт нужное со ссылкой на источник.',                                  wide: false },
  { icon: '🎤', title: 'Голос: STT + TTS',     desc: 'Whisper + ElevenLabs. Голосовой ввод прямо в Telegram-боте.',                                                  wide: false },
  { icon: '🔌', title: 'REST API & Webhooks',  desc: 'Интегрируйте 90 моделей в свои продукты через единый API с документацией.',                                     wide: true  },
]

const CHAT_MESSAGES = [
  { role: 'user', text: 'Напиши продающий текст для курса по Python за 30 слов' },
  { role: 'ai',  text: 'Python за 60 дней — с нуля до джуна. Живые проекты, код-ревью, поддержка ментора. Старт каждый понедельник. Осталось 3 места.' },
  { role: 'user', text: 'Теперь сгенерируй обложку для этого курса' },
  { role: 'ai',  text: '🎨 Генерирую изображение с помощью FLUX.1 Pro...' },
]

const PLANS = [
  { id: 'free',    name: 'Free',    price: '0',     per: '',       hot: false, badge: '', features: ['15 базовых режимов', 'Текстовый чат', 'История 5 сообщений'] },
  { id: 'starter', name: 'Starter', price: '490',   per: '₽/мес', hot: false, badge: '', features: ['40 режимов', 'STT — голос', 'Файлы до 10 МБ'] },
  { id: 'pro',     name: 'Pro',     price: '890',   per: '₽/мес', hot: true,  badge: 'ХИТ', features: ['75 режимов', 'Изображения 512px', 'STT + TTS', 'RAG 3 документа'] },
  { id: 'creator', name: 'Creator', price: '1 690', per: '₽/мес', hot: false, badge: '', features: ['Все 90 режимов', 'HD 1024px', 'RAG 20 документов', 'API доступ'] },
]

const TG_FEATURES = [
  { icon: '🤖', title: 'Голосовой ввод',      desc: 'Говорите — бот транскрибирует и отвечает' },
  { icon: '📎', title: 'Файлы и документы',   desc: 'Анализ PDF, изображений прямо в чате' },
  { icon: '⚡', title: 'Мгновенный ответ',    desc: 'Стриминг ответа без задержек' },
]

const TG_MESSAGES = [
  { side: 'bot',  text: 'Привет! Я Ghost AI. Чем помочь? 👻' },
  { side: 'user', text: 'Сделай логотип для моего стартапа' },
  { side: 'bot',  text: '🎨 Генерирую в FLUX.1 Pro...' },
  { side: 'bot',  text: '✅ Готово! Выберите стиль:' },
]

const FOOTER_COLS = [
  { title: 'Продукт',  links: ['Возможности', 'Тарифы', 'API', 'Roadmap'] },
  { title: 'Ресурсы',  links: ['Документация', 'Блог', 'Поддержка', 'Сообщество'] },
  { title: 'Компания', links: ['О нас', 'Партнёры', 'Контакты', 'Политика'] },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function Landing() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.inView)
            observerRef.current?.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' },
    )
    document.querySelectorAll(`.${styles.rv}`).forEach((el) => observerRef.current!.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className={styles.page}>

      {/* ── HERO ──────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.eyebrow}>— GHOST AI PLATFORM</div>

          <h1 className={styles.heroTitle}>
            <span className={styles.t1}>Все нейросети.</span>
            <span className={styles.t2}>Один интерфейс.</span>
            <span className={styles.t3}>90</span>
          </h1>

          <p className={styles.heroDesc}>
            ChatGPT, Claude, Gemini, Midjourney, DALL·E, Suno, Kling и ещё 83 AI-инструмента.
            Тексты, изображения, видео, музыка — без ограничений.
          </p>

          <div className={styles.heroActs}>
            <Link to="/dashboard" className="btn btn--gold btn--lg">
              Начать бесплатно
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#pricing" className="btn btn--outline-cyan">Тарифы</a>
          </div>

          <div className={styles.heroTrust}>
            <div className={styles.avs}>
              {[0, 1, 2, 3].map((i) => <div key={i} className={`${styles.av} ${styles[`av${i}`]}`} />)}
            </div>
            <div className={styles.trustSep} />
            <span className={styles.trustText}>Уже 12 000+ пользователей</span>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroVisual}>
            <svg className={styles.ghostSvg} viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="grd1" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#C4B5FD" stopOpacity=".9"/>
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity=".7"/>
                  <stop offset="100%" stopColor="#030008" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="grd2" cx="50%" cy="35%" r="55%">
                  <stop offset="0%" stopColor="#00E5C8" stopOpacity=".35"/>
                  <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                </radialGradient>
                <filter id="ghostGlow">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <path d="M200 55C132 55 82 113 82 188L82 382L117 358L152 382L187 358L200 372L213 358L248 382L283 358L318 382L318 188C318 113 268 55 200 55Z"
                fill="url(#grd1)" filter="url(#ghostGlow)"/>
              <path d="M200 55C132 55 82 113 82 188L82 382L117 358L152 382L187 358L200 372L213 358L248 382L283 358L318 382L318 188C318 113 268 55 200 55Z"
                fill="none" stroke="rgba(167,139,250,.35)" strokeWidth="1.5"/>
              <ellipse cx="165" cy="202" rx="22" ry="26" fill="#00E5C8" opacity=".9"/>
              <ellipse cx="235" cy="202" rx="22" ry="26" fill="#00E5C8" opacity=".9"/>
              <ellipse cx="168" cy="204" rx="10" ry="13" fill="#030008"/>
              <ellipse cx="238" cy="204" rx="10" ry="13" fill="#030008"/>
              <circle cx="172" cy="198" r="4" fill="#fff" opacity=".85"/>
              <circle cx="242" cy="198" r="4" fill="#fff" opacity=".85"/>
              <ellipse cx="200" cy="310" rx="78" ry="18" fill="url(#grd2)"/>
            </svg>
            <div className={styles.visualAura} />
          </div>
        </div>
      </section>

      {/* ── MARQUEE BELT ──────────────────────── */}
      <div className={styles.belt}>
        <div className={styles.beltTrack}>
          {[...BELT_ITEMS, ...BELT_ITEMS].map((item, i) => (
            <div key={i} className={styles.beltItem}>
              <div className={styles.beltDot} style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────── */}
      <div className={styles.stats}>
        <div className={styles.statsInner}>
          {STATS.map((s, i) => (
            <div key={i} className={`${styles.statCard} ${styles.rv}`}>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOLS GRID ────────────────────────── */}
      <section className={styles.sec} id="features">
        <div className={styles.secInner}>
          <div className={`${styles.rv} ${styles.d1}`}>
            <div className="section-header__tag">— ИНСТРУМЕНТЫ</div>
            <h2 className={`section-header__title ${styles.secTitle}`}>90 нейросетей внутри</h2>
            <p className="section-header__subtitle">Топовые модели для текста, кода, изображений, видео, голоса и музыки</p>
          </div>
          <div className={styles.toolsGrid}>
            {TOOLS.map((t, i) => (
              <div key={i} className={`${styles.toolCard} ${styles.rv}`}>
                <div className={styles.toolIcon}>{t.icon}</div>
                <div className={styles.toolName}>{t.name}</div>
                <div className={styles.toolDesc}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ────────────────────── */}
      <section className={styles.sec}>
        <div className={styles.secInner}>
          <div className={`${styles.rv} ${styles.d1}`}>
            <div className="section-header__tag">— ВОЗМОЖНОСТИ</div>
            <h2 className={`section-header__title ${styles.secTitle}`}>Всё в одном месте</h2>
            <p className="section-header__subtitle">От текста до полноценного медиапроизводства</p>
          </div>
          <div className={styles.bento}>
            {BENTO.map((b, i) => (
              <div key={i} className={`${styles.bentoCard} ${b.wide ? styles.wide : ''} ${styles.rv}`}>
                <div className={styles.bentoIcon}>{b.icon}</div>
                <h3 className={styles.bentoTitle}>{b.title}</h3>
                <p className={styles.bentoDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAT DEMO ─────────────────────────── */}
      <section className={styles.sec}>
        <div className={styles.secInner}>
          <div className={`${styles.rv} ${styles.d1}`}>
            <div className="section-header__tag">— ЧАТ ИНТЕРФЕЙС</div>
            <h2 className={`section-header__title ${styles.secTitle}`}>Попробуйте прямо сейчас</h2>
            <p className="section-header__subtitle">Выберите модель, задайте вопрос — мгновенный ответ</p>
          </div>
          <div className={`${styles.chatBox} ${styles.rv}`}>
            <div className={styles.chatHeader}>
              <div className={styles.chatDot} />
              <span className={styles.chatName}>Ghost AI</span>
              <div className={styles.chatBadge}>GPT-4o</div>
            </div>
            <div className={styles.chatModes}>
              {['Текст', 'Изображения', 'Код', 'Голос', 'Видео', 'Документы'].map((m, i) => (
                <div key={m} className={`${styles.modePill} ${i === 0 ? styles.activeMode : ''}`}>{m}</div>
              ))}
            </div>
            <div className={styles.chatMsgs}>
              {CHAT_MESSAGES.map((m, i) => (
                <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : ''}`}>
                  <div className={styles.msgAv}>{m.role === 'ai' ? '👻' : '👤'}</div>
                  <div className={`${styles.msgBubble} ${m.role === 'ai' ? styles.bubbleAI : styles.bubbleUser}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input className={styles.chatField} placeholder="Введите сообщение..." readOnly />
              <button className={styles.chatSend} aria-label="Отправить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────── */}
      <section className={styles.sec} id="pricing">
        <div className={styles.secInner}>
          <div className={`${styles.rv} ${styles.d1}`}>
            <div className="section-header__tag">— ТАРИФЫ</div>
            <h2 className={`section-header__title ${styles.secTitle}`}>Тарифные планы</h2>
            <p className="section-header__subtitle">Начни бесплатно, расти без ограничений</p>
          </div>
          <div className={styles.priceGrid}>
            {PLANS.map((p) => (
              <div key={p.id} className={`${styles.priceCard} ${p.hot ? styles.hotCard : ''} ${styles.rv}`}>
                {p.hot && <div className={styles.hotBadge}>{p.badge}</div>}
                <div className={styles.planName}>{p.name}</div>
                <div className={styles.planPrice}>
                  {p.price}
                  {p.per && <span className={styles.planPer}> {p.per}</span>}
                </div>
                <div className={styles.planDivider} />
                <ul className={styles.planFeatures}>
                  {p.features.map((f) => (
                    <li key={f}>
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3.5" stroke="#00E5C8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`btn ${p.hot ? 'btn--gold' : 'btn--outline-cyan'} ${styles.planBtn}`}>
                  {p.id === 'free' ? 'Начать бесплатно' : `Выбрать ${p.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TELEGRAM ──────────────────────────── */}
      <section className={styles.sec} id="telegram">
        <div className={styles.secInner}>
          <div className={styles.tgGrid}>
            <div className={styles.phone}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>
                <div className={styles.phoneTgBar}>
                  <div className={styles.phoneTgAvatar} />
                  <div>
                    <div className={styles.phoneTgName}>Ghost AI Bot</div>
                    <div className={styles.phoneTgStatus}>online</div>
                  </div>
                </div>
                <div className={styles.phoneMsgs}>
                  {TG_MESSAGES.map((m, i) => (
                    <div key={i} className={`${styles.phonePm} ${m.side === 'user' ? styles.phonePmUser : ''}`}>
                      {m.text}
                    </div>
                  ))}
                  <div className={styles.phoneBtns}>
                    {['Минималист', 'Яркий', 'Градиент', '3D стиль'].map((b) => (
                      <div key={b} className={styles.phoneBtn}>{b}</div>
                    ))}
                  </div>
                </div>
                <div className={styles.phoneInput}>
                  <div className={styles.phoneInputField} />
                  <div className={styles.phoneSendBtn}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.tgInfo}>
              <div className={`section-header__tag ${styles.rv}`}>— TELEGRAM</div>
              <h2 className={`${styles.tgTitle} ${styles.rv} ${styles.d1}`}>Весь Ghost AI прямо в Telegram</h2>
              <p className={`${styles.tgDesc} ${styles.rv} ${styles.d2}`}>
                Полноценный Mini App с голосовым вводом, анализом документов и всеми 90 режимами — без браузера.
              </p>
              <div className={styles.tgPoints}>
                {TG_FEATURES.map((f, i) => (
                  <div key={i} className={`${styles.tgPoint} ${styles.rv}`}>
                    <div className={styles.tgPointIcon}>{f.icon}</div>
                    <div>
                      <div className={styles.tgPointTitle}>{f.title}</div>
                      <div className={styles.tgPointDesc}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a href="https://t.me/ghost_ai_bot" target="_blank" rel="noopener noreferrer"
                className={`btn btn--gold ${styles.rv} ${styles.d3}`}>
                Открыть в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className={styles.footer} id="footer">
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>GHOST <span>AI</span></div>
              <p>Премиум платформа для доступа к 90+ AI-инструментам.</p>
              <div className={styles.socials}>
                {['TG', 'X', 'YT'].map((s) => (
                  <a key={s} href="#" className={styles.socialBtn}>{s}</a>
                ))}
              </div>
            </div>
            {FOOTER_COLS.map((col) => (
              <div key={col.title} className={styles.footerCol}>
                <h4>{col.title}</h4>
                <ul>{col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
              </div>
            ))}
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 Ghost AI. Premium AI Platform.</span>
            <span>Все права защищены.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
