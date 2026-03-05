import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.scss'

const IMG_ITEMS = [
  { src: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?auto=format&fit=crop&fm=jpg&q=80&w=2400', caption: 'Генеративный «город из света»' },
  { src: 'https://images.unsplash.com/photo-1674027215016-0a4abfdbf1cc?auto=format&fit=crop&fm=jpg&q=80&w=2400', caption: 'Визуализация «AI-мозга»' },
  { src: 'https://images.unsplash.com/photo-1750096319146-6310519b5af2?auto=format&fit=crop&fm=jpg&q=80&w=2400', caption: 'Кибер-сущность: взгляд в будущее' },
  { src: 'https://images.unsplash.com/photo-1737644467636-6b0053476bb2?auto=format&fit=crop&fm=jpg&q=80&w=2400', caption: 'Андроид: точность и стиль' },
  { src: 'https://images.unsplash.com/photo-1752070485313-71ac5e594ad0?auto=format&fit=crop&fm=jpg&q=80&w=2400', caption: 'Неон, дождь, киношная атмосфера' },
]
const VID_ITEMS = [
  { src: 'https://cdn.pixabay.com/video/2023/11/13/188933-884185295_large.mp4', poster: 'https://cdn.pixabay.com/video/2023/11/13/188933-884185295_tiny.jpg', caption: 'Абстрактная «энергия» (loop)' },
  { src: 'https://cdn.pixabay.com/video/2023/03/22/155718-810722623_large.mp4', poster: 'https://cdn.pixabay.com/video/2023/03/22/155718-810722623_tiny.jpg', caption: 'Частицы, форма, «AI-ритм»' },
  { src: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4', poster: '', caption: 'Неоновые абстракции (пример)' },
]

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
            <div className={styles.vidWrap}>
              <video
                className={styles.heroVid}
                src="/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
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

      {/* ── SHOWCASE (CAROUSELS) ──────────────── */}
      <section className={styles.sec} id="showcase">
        <div className={styles.secInner}>
          <div className={`${styles.rv} ${styles.d1}`}>
            <div className="section-header__tag">— ВИТРИНА</div>
            <h2 className={`section-header__title ${styles.secTitle}`}>Так выглядит магия в работе</h2>
            <p className="section-header__subtitle">Примеры «как будто ИИ сделал» — фото и видео, сгенерированные нейросетями</p>
          </div>

          {/* Image carousel */}
          <div className={`${styles.showWrap} ${styles.rv}`}>
            <div className={styles.showHead}>
              <div className={styles.showTitle}>Карусель изображений</div>
              <div className={styles.showActions}>
                <button className={styles.showBtn} onClick={() => {
                  const t = document.getElementById('imgTrack') as HTMLElement
                  const w = t.querySelector('figure')?.getBoundingClientRect().width || 420
                  t.scrollBy({ left: -(w + 14), behavior: 'smooth' })
                }} aria-label="Назад">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={styles.showBtn} onClick={() => {
                  const t = document.getElementById('imgTrack') as HTMLElement
                  const w = t.querySelector('figure')?.getBoundingClientRect().width || 420
                  t.scrollBy({ left: w + 14, behavior: 'smooth' })
                }} aria-label="Вперёд">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div className={styles.carousel}>
              <div className={styles.carTrack} id="imgTrack">
                {IMG_ITEMS.map((img, i) => (
                  <figure key={i} className={styles.carItem}>
                    <img loading="lazy" src={img.src} alt={img.caption} />
                    <figcaption>{img.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>

          {/* Video carousel */}
          <div className={`${styles.showWrap} ${styles.rv}`} style={{ marginTop: '1.5rem' }}>
            <div className={styles.showHead}>
              <div className={styles.showTitle}>Видео-примеры</div>
              <div className={styles.showActions}>
                <button className={styles.showBtn} onClick={() => {
                  const t = document.getElementById('vidTrack') as HTMLElement
                  const w = t.querySelector('figure')?.getBoundingClientRect().width || 420
                  t.scrollBy({ left: -(w + 14), behavior: 'smooth' })
                }} aria-label="Назад">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={styles.showBtn} onClick={() => {
                  const t = document.getElementById('vidTrack') as HTMLElement
                  const w = t.querySelector('figure')?.getBoundingClientRect().width || 420
                  t.scrollBy({ left: w + 14, behavior: 'smooth' })
                }} aria-label="Вперёд">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div className={styles.carousel}>
              <div className={styles.carTrack} id="vidTrack">
                {VID_ITEMS.map((v, i) => (
                  <figure key={i} className={`${styles.carItem} ${styles.carVideo}`}>
                    <video playsInline muted loop controls preload="metadata" poster={v.poster}>
                      <source src={v.src} type="video/mp4" />
                    </video>
                    <figcaption>{v.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
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
