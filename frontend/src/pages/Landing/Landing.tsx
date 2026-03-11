import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from './Landing.module.scss'

// ─────────────────────────────────────────────
// SVG Icon components (all SVG, no emoji)
// ─────────────────────────────────────────────

// OpenAI — официальная форма "розетки" (6 лепестков)
const IcoOpenAI = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.28 9.76a5.84 5.84 0 00-.5-4.8 6 6 0 00-6.44-2.88A5.84 5.84 0 0011.1 0a6 6 0 00-5.72 4.14 5.84 5.84 0 00-3.9 2.84 6 6 0 00.74 7.02 5.84 5.84 0 00.5 4.8 6 6 0 006.44 2.88A5.84 5.84 0 0012.9 24a6 6 0 005.72-4.14 5.84 5.84 0 003.9-2.84 6 6 0 00-.74-7.26zM12.9 22.5a4.5 4.5 0 01-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 00.4-.68v-6.74l2.02 1.16a.07.07 0 01.04.06v5.58A4.52 4.52 0 0112.9 22.5zM3.6 18.42a4.5 4.5 0 01-.54-3.02l.14.08 4.78 2.76a.78.78 0 00.78 0l5.84-3.38v2.32a.08.08 0 01-.03.06L9.7 20.04a4.52 4.52 0 01-6.1-1.62zm-.92-9.9A4.5 4.5 0 015.06 6.4v5.66a.78.78 0 00.4.68l5.84 3.36-2.02 1.16a.08.08 0 01-.08 0L4.48 14.5a4.52 4.52 0 01-.8-5.98zm16.6 3.86l-5.84-3.38 2.02-1.16a.08.08 0 01.08 0l4.72 2.72a4.5 4.5 0 01-.7 8.12V13.1a.78.78 0 00-.28-.72zm2-3.04l-.14-.08-4.78-2.74a.78.78 0 00-.78 0L9.74 9.9V7.58a.08.08 0 01.03-.06l4.72-2.72a4.52 4.52 0 016.69 4.64zM8.66 12.84l-2.02-1.16a.08.08 0 01-.04-.06V6.04a4.52 4.52 0 017.4-3.46l-.14.08-4.78 2.76a.78.78 0 00-.4.68l-.02 6.74zm1.1-2.36L12 9.18l2.24 1.28v2.58L12 14.32l-2.24-1.28v-2.56z"/>
  </svg>
)

// Anthropic — буква A из официального логотипа
const IcoAnthropic = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.83 3h-3.66L4 21h3.5l1.3-3.5h6.4l1.3 3.5H20L13.83 3zm-3.8 11.5L12 7.6l1.97 6.9h-3.94z"/>
  </svg>
)

// Google Gemini — четырёхлучевая звезда (официальный знак)
const IcoGemini = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="lgGem" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285f4"/>
        <stop offset="50%" stopColor="#9c27b0"/>
        <stop offset="100%" stopColor="#34a853"/>
      </linearGradient>
    </defs>
    <path fill="url(#lgGem)" d="M12 2C12 2 12 9.5 5 12C12 14.5 12 22 12 22C12 22 12 14.5 19 12C12 9.5 12 2 12 2Z"/>
  </svg>
)

// FLUX.1 — стилизованная буква F (Black Forest Labs)
const IcoFLUX = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#7c3aed"/>
    <text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial,sans-serif">F</text>
  </svg>
)

// DALL·E 3 — OpenAI логотип в зелёной рамке
const IcoDALLE = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#10a37f"/>
    <path fill="white" d="M12 5.5C8.96 5.5 6.5 7.96 6.5 11c0 1.57.66 2.98 1.7 3.99L6.5 17.5h3.1l.4-1.1c.64.2 1.31.1 1.31.1h.69c3.04 0 5.5-2.46 5.5-5.5S15.04 5.5 12 5.5zm0 9c-1.93 0-3.5-1.57-3.5-3.5S10.07 7.5 12 7.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    <circle cx="12" cy="11" r="1.5" fill="white"/>
  </svg>
)

// Suno — концентрические дуги (звуковые волны)
const IcoSuno = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#e63946"/>
    <circle cx="12" cy="12" r="4" fill="white" opacity=".95"/>
    <circle cx="12" cy="12" r="1.8" fill="#e63946"/>
    <path stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round"
      d="M7.5 8.5a6.5 6.5 0 000 7M16.5 8.5a6.5 6.5 0 010 7"/>
  </svg>
)

// Kling — буква K (Kuaishou)
const IcoKling = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#f59e0b"/>
    <path fill="white" d="M8 7h2v10H8V7zm3 5l4.5-5H18L13.5 12 18 17h-2.5L11 12z"/>
  </svg>
)

// Runway — буква R с горизонтальными полосами «взлётной полосы»
const IcoRunway = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="#1a1a2e"/>
    <path fill="white" d="M7 7h4.5a3 3 0 010 6H9.5l3.5 4H11L7.5 13H9v-2h2.5a1 1 0 000-2H7V7zm8.5 0H17v10h-1.5V7z"/>
  </svg>
)

// Meta Llama — огонь (официальный знак Meta AI)
const IcoLlama = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9 5.5 7 8 7 12a5 5 0 0010 0c0-1.5-.5-2.9-1.3-4C14.5 10 13 11.5 12 14c-1-2.5-1-5 0-7-.3 1.2-.3 2.5 0 3.5C13 8.5 13.5 5 12 2z" opacity=".9"/>
    <path d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.4 0 .7.1 1 .3" opacity=".6"/>
  </svg>
)

// ElevenLabs — звуковые полосы разной высоты
const IcoEleven = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="2"   y="5"  width="3"   height="14" rx="1.5"/>
    <rect x="7"   y="8"  width="3"   height="10" rx="1.5" opacity=".8"/>
    <rect x="12"  y="3"  width="3"   height="18" rx="1.5"/>
    <rect x="17"  y="7"  width="3"   height="11" rx="1.5" opacity=".75"/>
  </svg>
)

// OpenAI Whisper — микрофон с волнами (OpenAI)
const IcoWhisper = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

// DeepSeek — стилизованная рыба / «глубокое море»
const IcoDeepSeek = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="lgDS" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4e6ef2"/>
        <stop offset="100%" stopColor="#00c9ff"/>
      </linearGradient>
    </defs>
    <path fill="url(#lgDS)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.8 0 3.45.62 4.76 1.65L5.65 16.76A7 7 0 0112 5zm0 14a7 7 0 01-4.76-1.65l11.11-10.11A7 7 0 0112 19z"/>
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
  { grad: 'linear-gradient(135deg,#7c3aed 0%,#00e5c8 100%)', label: '✦', caption: 'Абстрактная энергия' },
  { grad: 'linear-gradient(135deg,#e63946 0%,#7c3aed 100%)', label: '◈', caption: 'Нейронный пульс' },
  { grad: 'linear-gradient(135deg,#00e5c8 0%,#4285f4 100%)', label: '⬡', caption: 'Неоновые абстракции' },
  { grad: 'linear-gradient(135deg,#f59e0b 0%,#e63946 100%)', label: '❋', caption: 'Световые следы' },
  { grad: 'linear-gradient(135deg,#10a37f 0%,#7c3aed 100%)', label: '◉', caption: 'Голографический мир' },
  { grad: 'linear-gradient(135deg,#4285f4 0%,#00e5c8 100%)', label: '⬢', caption: 'Цифровой горизонт' },
  { grad: 'linear-gradient(135deg,#c96a2b 0%,#f59e0b 100%)', label: '✸', caption: 'Волны энергии' },
  { grad: 'linear-gradient(135deg,#7c3aed 0%,#e63946 100%)', label: '⊕', caption: 'AI-ритм' },
  { grad: 'linear-gradient(135deg,#00e5c8 0%,#10a37f 100%)', label: '❂', caption: 'Генеративный поток' },
  { grad: 'linear-gradient(135deg,#1a0030 0%,#7c3aed 50%,#00e5c8 100%)', label: '◎', caption: 'Магия частиц' },
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
                    <div className={styles.vidGradCard} style={{ background: v.grad }}>
                      <span className={styles.vidGradLabel}>{v.label}</span>
                    </div>
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
