import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.scss'

// ─────────────────────────────────────────────
// SVG Icon components (all SVG, no emoji)
// ─────────────────────────────────────────────

const IcoOpenAI = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.7L3.8 7.3v9.4l8.2 4.6 8.2-4.6V7.3L12 2.7z"/>
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".35"/>
    <line x1="12" y1="9" x2="12" y2="2.7" strokeWidth="1" opacity=".4"/>
    <line x1="12" y1="15" x2="12" y2="21.3" strokeWidth="1" opacity=".4"/>
    <line x1="9.3" y1="10.5" x2="3.8" y2="7.3" strokeWidth="1" opacity=".4"/>
    <line x1="14.7" y1="13.5" x2="20.2" y2="16.7" strokeWidth="1" opacity=".4"/>
    <line x1="9.3" y1="13.5" x2="3.8" y2="16.7" strokeWidth="1" opacity=".4"/>
    <line x1="14.7" y1="10.5" x2="20.2" y2="7.3" strokeWidth="1" opacity=".4"/>
  </svg>
)

const IcoAnthropic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L22 21H2L12 3z"/>
    <circle cx="12" cy="15" r="2.5" fill="currentColor" opacity=".45" stroke="none"/>
    <line x1="12" y1="9" x2="12" y2="12.5" strokeWidth="1.5"/>
  </svg>
)

const IcoGemini = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C12 2 12.4 9.2 12 12C11.6 14.8 2 12 2 12C2 12 11.6 11.2 12 12C12.4 12.8 12 22 12 22C12 22 11.6 14.8 12 12C12.4 9.2 22 12 22 12C22 12 12.4 12.8 12 12C11.6 11.2 12 2 12 2Z" opacity=".9"/>
  </svg>
)

const IcoFLUX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M5 4h10M5 12h7M5 20h5"/>
    <path d="M19 7l3 4-3 4" strokeLinejoin="round"/>
  </svg>
)

const IcoDALLE = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <circle cx="8.5" cy="8.5" r="1.8" fill="currentColor" stroke="none" opacity=".5"/>
    <path d="M21 15l-5-5.5L11 17H3"/>
  </svg>
)

const IcoSuno = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
)

const IcoKling = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/>
    <path d="M2 9h20M10 4v5M14 4v5"/>
    <path d="M10.5 14.5l5-2.5-5-2.5v5z" fill="currentColor" stroke="none" opacity=".6"/>
  </svg>
)

const IcoRunway = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M15 7l5 5-5 5"/>
    <path d="M5 7v10" strokeWidth="1" opacity=".4"/>
    <path d="M2 7v10" strokeWidth=".8" opacity=".25"/>
  </svg>
)

const IcoLlama = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12C9.2 7.5 5 7 5 7C5 15 8.5 19 12 19C15.5 19 19 15 19 7C19 7 14.8 7.5 12 12z"/>
    <path d="M12 12C12 12 12 7 12 4" strokeWidth="1" opacity=".5"/>
  </svg>
)

const IcoEleven = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="3"  y="5"  width="3" height="14" rx="1.5" opacity=".9"/>
    <rect x="7.5" y="8"  width="3" height="11" rx="1.5" opacity=".75"/>
    <rect x="12" y="3"  width="3" height="18" rx="1.5"/>
    <rect x="16.5" y="7" width="2.5" height="12" rx="1.25" opacity=".7"/>
  </svg>
)

const IcoWhisper = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const IcoDeepSeek = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/>
    <path d="M20 20l-3.5-3.5"/>
    <circle cx="11" cy="11" r="2.5" fill="currentColor" stroke="none" opacity=".4"/>
    <path d="M8.5 10.5C9 8.8 11 8.5 12.5 9.5" strokeWidth="1.2"/>
  </svg>
)

// Bento icons
const IcoChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="9" y1="10" x2="15" y2="10"/>
    <line x1="9" y1="14" x2="13" y2="14"/>
  </svg>
)

const IcoMedia = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="14" rx="3"/>
    <circle cx="8.5" cy="8.5" r="1.8" fill="currentColor" stroke="none" opacity=".5"/>
    <path d="M21 13l-5-5L9 17H3"/>
    <path d="M7 21h10M12 17v4" strokeWidth="1.3"/>
  </svg>
)

const IcoDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="13" y2="17"/>
    <line x1="8" y1="9" x2="10" y2="9"/>
  </svg>
)

const IcoMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
    <path d="M6 8c-.5 1-.8 2.5 0 4" strokeWidth="1" opacity=".5"/>
    <path d="M18 8c.5 1 .8 2.5 0 4" strokeWidth="1" opacity=".5"/>
  </svg>
)

const IcoAPI = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
    <line x1="14" y1="4" x2="10" y2="20" strokeWidth="1.3"/>
  </svg>
)

// Social icons
const IcoTelegram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IcoVK = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 7.5v9h2V13l3.5 3.5H13l-4-4.5L12.5 7.5H10l-3.5 4V7.5H4.5zM14 7.5v9h2v-3.5l3.5 3.5H22l-4-4.5L21.5 7.5H19l-3 3.5V7.5H14z"/>
  </svg>
)

const IcoOK = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8.5" r="3.5"/>
    <path d="M12 14c-3.5 0-6 1.5-6 3.5V20h12v-2.5c0-2-2.5-3.5-6-3.5z"/>
  </svg>
)

const IcoMax = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 18V6l4 6 4-6v12"/>
    <path d="M16 7l6 5-6 5"/>
  </svg>
)

// ─────────────────────────────────────────────
// Media Data
// ─────────────────────────────────────────────

const IMG_ITEMS = [
  { src: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Генеративный «город из света»' },
  { src: 'https://images.unsplash.com/photo-1674027215016-0a4abfdbf1cc?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Визуализация «AI-мозга»' },
  { src: 'https://images.unsplash.com/photo-1750096319146-6310519b5af2?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Кибер-сущность: взгляд в будущее' },
  { src: 'https://images.unsplash.com/photo-1737644467636-6b0053476bb2?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Андроид: точность и стиль' },
  { src: 'https://images.unsplash.com/photo-1752070485313-71ac5e594ad0?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Неон, дождь, киношная атмосфера' },
  { src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Цифровой двойник — ИИ-рука' },
  { src: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Голографический интерфейс' },
  { src: 'https://images.unsplash.com/photo-1686191128892-3b37add4c844?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Нейросеть: сигналы в пространстве' },
  { src: 'https://images.unsplash.com/photo-1685714426893-4c069e1d8c25?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'ИИ-город будущего' },
  { src: 'https://images.unsplash.com/photo-1680158563814-3fc2c12e3e21?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Синтетический портрет' },
  { src: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Киберпанк: неоновый закат' },
  { src: 'https://images.unsplash.com/photo-1669571535792-31c96b3fa617?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Нейронная сеть живёт' },
  { src: 'https://images.unsplash.com/photo-1655720031554-a929595ffad7?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Цифровая реальность' },
  { src: 'https://images.unsplash.com/photo-1647427017067-8f06da02a3a3?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Абстрактный ИИ-арт' },
  { src: 'https://images.unsplash.com/photo-1635107510862-53886e926b74?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Киберпространство — матрица' },
  { src: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Растровый цифровой арт' },
  { src: 'https://images.unsplash.com/photo-1625014618427-fbc980b974f5?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Робот-художник будущего' },
  { src: 'https://images.unsplash.com/photo-1614853316476-de00d14cb1fc?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Неоновые абстракции' },
  { src: 'https://images.unsplash.com/photo-1679082307865-8a8cba5be0dd?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Генеративный ландшафт' },
  { src: 'https://images.unsplash.com/photo-1716920722671-c20dba26b3c1?auto=format&fit=crop&fm=jpg&q=80&w=1600', caption: 'Сигналы будущего' },
]

const VID_ITEMS = [
  { src: 'https://cdn.pixabay.com/video/2023/11/13/188933-884185295_large.mp4', poster: 'https://cdn.pixabay.com/video/2023/11/13/188933-884185295_tiny.jpg', caption: 'Абстрактная «энергия» (AI loop)' },
  { src: 'https://cdn.pixabay.com/video/2023/03/22/155718-810722623_large.mp4', poster: 'https://cdn.pixabay.com/video/2023/03/22/155718-810722623_tiny.jpg', caption: 'Частицы, форма, «AI-ритм»' },
  { src: 'https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4', poster: '', caption: 'Неоновые абстракции' },
  { src: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4', poster: '', caption: 'Магия частиц — генеративное' },
  { src: 'https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_25fps.mp4', poster: '', caption: 'Световые следы в темноте' },
  { src: 'https://videos.pexels.com/video-files/3796572/3796572-hd_1920_1080_25fps.mp4', poster: '', caption: 'Цветной ИИ-поток' },
  { src: 'https://videos.pexels.com/video-files/2899685/2899685-hd_1920_1080_25fps.mp4', poster: '', caption: 'Голографический мир' },
  { src: 'https://cdn.pixabay.com/video/2022/04/29/116064-705244087_large.mp4', poster: '', caption: 'Волны энергии — синтез' },
  { src: 'https://cdn.pixabay.com/video/2021/08/17/84657-585718698_large.mp4', poster: '', caption: 'Нейронный пульс' },
  { src: 'https://videos.pexels.com/video-files/7134032/7134032-hd_1920_1080_30fps.mp4', poster: '', caption: 'Цифровой горизонт' },
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
  { icon: <IcoOpenAI   />, name: 'GPT-4o',         desc: 'Флагман OpenAI. Текст и код.' },
  { icon: <IcoAnthropic/>, name: 'Claude 3.5',     desc: '200k контекст, анализ.' },
  { icon: <IcoGemini   />, name: 'Gemini 1.5 Pro', desc: 'Мультимодальный Google.' },
  { icon: <IcoFLUX     />, name: 'FLUX.1 Pro',     desc: 'Лучшая генерация фото.' },
  { icon: <IcoDALLE    />, name: 'DALL·E 3',       desc: 'Точные иллюстрации.' },
  { icon: <IcoSuno     />, name: 'Suno v4',        desc: 'Музыка любого жанра.' },
  { icon: <IcoKling    />, name: 'Kling 1.6',      desc: 'Видео до 30 сек.' },
  { icon: <IcoRunway   />, name: 'Runway Gen-3',   desc: 'Кинематографическое видео.' },
  { icon: <IcoLlama    />, name: 'Llama 3',        desc: 'Быстрый Open Source.' },
  { icon: <IcoEleven   />, name: 'ElevenLabs',     desc: 'Синтез голоса.' },
  { icon: <IcoWhisper  />, name: 'Whisper v3',     desc: 'Распознавание речи.' },
  { icon: <IcoDeepSeek />, name: 'DeepSeek Coder', desc: 'Профессиональный код.' },
]

const BENTO = [
  { icon: <IcoChat  />, title: 'Умный чат',           desc: '50+ текстовых режимов: копирайтер, юрист, бизнес-аналитик, программист и ещё десятки специализаций.', wide: false },
  { icon: <IcoMedia />, title: 'Изображения & Видео', desc: 'FLUX, DALL·E 3, Stable Diffusion, Kling, Runway — фотореализм и кино из одного интерфейса.',           wide: true  },
  { icon: <IcoDoc   />, title: 'RAG — документы',     desc: 'Загрузите PDF и задавайте вопросы. ИИ найдёт нужное со ссылкой на источник.',                           wide: false },
  { icon: <IcoMic   />, title: 'Голос: STT + TTS',    desc: 'Whisper + ElevenLabs. Голосовой ввод прямо в Telegram-боте.',                                            wide: false },
  { icon: <IcoAPI   />, title: 'REST API & Webhooks', desc: 'Интегрируйте 90 моделей в свои продукты через единый API с документацией.',                              wide: true  },
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
  { icon: <IcoMic     />, title: 'Голосовой ввод',    desc: 'Говорите — бот транскрибирует и отвечает' },
  { icon: <IcoDoc     />, title: 'Файлы и документы', desc: 'Анализ PDF, изображений прямо в чате' },
  { icon: <IcoRunway  />, title: 'Мгновенный ответ',  desc: 'Стриминг ответа без задержек' },
]

const TG_MESSAGES = [
  { side: 'bot',  text: 'Привет! Я Ghost AI. Чем помочь?' },
  { side: 'user', text: 'Сделай логотип для моего стартапа' },
  { side: 'bot',  text: '🎨 Генерирую в FLUX.1 Pro...' },
  { side: 'bot',  text: '✅ Готово! Выберите стиль:' },
]

const FOOTER_COLS = [
  { title: 'Продукт',  links: ['Возможности', 'Тарифы', 'API', 'Roadmap'] },
  { title: 'Ресурсы',  links: ['Документация', 'Блог', 'Поддержка', 'Сообщество'] },
  { title: 'Компания', links: ['О нас', 'Партнёры', 'Контакты', 'Политика'] },
]

const SOCIALS = [
  { label: 'Telegram', href: 'https://t.me/ghost_ai_official', icon: <IcoTelegram /> },
  { label: 'VK',       href: '#',                              icon: <IcoVK       /> },
  { label: 'OK',       href: '#',                              icon: <IcoOK       /> },
  { label: 'MAX',      href: '#',                              icon: <IcoMax      /> },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function Landing() {
  const observerRef  = useRef<IntersectionObserver | null>(null)
  const imgTrackRef  = useRef<HTMLDivElement>(null)
  const vidTrackRef  = useRef<HTMLDivElement>(null)
  const imgIdxRef    = useRef(0)
  const vidIdxRef    = useRef(0)

  // Scroll reveal
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

  // Carousel auto-loop
  useEffect(() => {
    const advance = (
      trackRef: React.RefObject<HTMLDivElement>,
      idxRef: React.MutableRefObject<number>,
      count: number,
    ) => {
      const t = trackRef.current
      if (!t) return
      const items = t.querySelectorAll('figure')
      if (!items.length) return
      idxRef.current = (idxRef.current + 1) % count
      const w = (items[0] as HTMLElement).offsetWidth + 14
      if (idxRef.current === 0) {
        t.scrollTo({ left: 0, behavior: 'auto' })
      } else {
        t.scrollTo({ left: idxRef.current * w, behavior: 'smooth' })
      }
    }

    const i1 = setInterval(() => advance(imgTrackRef, imgIdxRef, IMG_ITEMS.length), 3500)
    const i2 = setInterval(() => advance(vidTrackRef, vidIdxRef, VID_ITEMS.length), 5500)
    return () => { clearInterval(i1); clearInterval(i2) }
  }, [])

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, dir: -1 | 1) => {
    const t = ref.current
    if (!t) return
    const w = (t.querySelector('figure') as HTMLElement | null)?.offsetWidth ?? 420
    t.scrollBy({ left: dir * (w + 14), behavior: 'smooth' })
  }

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
              <video className={styles.heroVid} src="/hero.mp4" autoPlay loop muted playsInline />
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
                <div className={styles.bentoIconWrap}>{b.icon}</div>
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
                <button className={styles.showBtn} onClick={() => scrollCarousel(imgTrackRef, -1)} aria-label="Назад">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={styles.showBtn} onClick={() => scrollCarousel(imgTrackRef, 1)} aria-label="Вперёд">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div className={styles.carousel}>
              <div className={styles.carTrack} ref={imgTrackRef}>
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
                <button className={styles.showBtn} onClick={() => scrollCarousel(vidTrackRef, -1)} aria-label="Назад">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className={styles.showBtn} onClick={() => scrollCarousel(vidTrackRef, 1)} aria-label="Вперёд">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div className={styles.carousel}>
              <div className={styles.carTrack} ref={vidTrackRef}>
                {VID_ITEMS.map((v, i) => (
                  <figure key={i} className={`${styles.carItem} ${styles.carVideo}`}>
                    <video playsInline muted loop controls preload="metadata" poster={v.poster || undefined}>
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
                  <div className={styles.msgAv}>
                    {m.role === 'ai'
                      ? <svg width="14" height="14" viewBox="0 0 22 28" fill="none"><path d="M11 1C5.48 1 1 5.48 1 11v15l2.75-2.5 2.75 2.5 2.75-2.5L11 26l2.75-2.5 2.75 2.5 2.75-2.5L21 26V11C21 5.48 16.52 1 11 1z" fill="rgba(124,58,237,.5)" stroke="rgba(167,139,250,.7)" strokeWidth="1.2"/><circle cx="7.5" cy="10.5" r="2" fill="rgba(0,229,200,.9)"/><circle cx="14.5" cy="10.5" r="2" fill="rgba(0,229,200,.9)"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </div>
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
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} className={styles.socialBtn} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                    {s.icon}
                  </a>
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
