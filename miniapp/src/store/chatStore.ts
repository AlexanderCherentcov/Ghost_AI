import { create } from 'zustand'
import type { AIModel, ChatMode, Message } from '../types'

export const MODELS: AIModel[] = [
  { id:'gpt4o',  name:'GPT-4o',        icon:'🤖', iconBg:'linear-gradient(135deg,#10a37f,#0a7a5f)', badge:'OpenAI',    badgeColor:'#10a37f', desc:'Флагман OpenAI. Текст, код, изображения.', tags:['text','code','image'], speed:'Быстрая', ctx:'128k' },
  { id:'gpt4m',  name:'GPT-4o mini',   icon:'⚡', iconBg:'linear-gradient(135deg,#0d8060,#10a37f)', badge:'OpenAI',    badgeColor:'#10a37f', desc:'Быстрая и экономичная модель для чата.', tags:['text','code'], speed:'Очень быстрая', ctx:'128k' },
  { id:'claude', name:'Claude 3.5',    icon:'🌊', iconBg:'linear-gradient(135deg,#c96a2b,#e07c3a)', badge:'Anthropic', badgeColor:'#c96a2b', desc:'Длинный контекст, точный анализ, код.', tags:['text','code'], speed:'Быстрая', ctx:'200k' },
  { id:'gemini', name:'Gemini 1.5 Pro',icon:'💎', iconBg:'linear-gradient(135deg,#4285f4,#34a853)', badge:'Google',    badgeColor:'#4285f4', desc:'Мультимодальный: текст, изображения, видео.', tags:['text','image','video','code'], speed:'Быстрая', ctx:'1M' },
  { id:'flux',   name:'FLUX.1 Pro',    icon:'🎨', iconBg:'linear-gradient(135deg,#7c3aed,#5b21b6)', badge:'Image',     badgeColor:'#7c3aed', desc:'Лучшие детали и реализм в генерации изображений.', tags:['image'], speed:'20 сек', ctx:'—' },
  { id:'dalle',  name:'DALL-E 3',      icon:'🖼️', iconBg:'linear-gradient(135deg,#10a37f,#2d7a4f)', badge:'Image',     badgeColor:'#10a37f', desc:'Точное следование промпту, фантазийный стиль.', tags:['image'], speed:'15 сек', ctx:'—' },
  { id:'suno',   name:'Suno v4',       icon:'🎵', iconBg:'linear-gradient(135deg,#e63946,#c1121f)', badge:'Audio',     badgeColor:'#e63946', desc:'Генерация музыки и вокала любого жанра.', tags:['audio'], speed:'30 сек', ctx:'—' },
  { id:'kling',  name:'Kling 1.6',     icon:'🎬', iconBg:'linear-gradient(135deg,#f59e0b,#d97706)', badge:'Video',     badgeColor:'#f59e0b', desc:'Реалистичное видео до 30 сек из промпта.', tags:['video'], speed:'1-2 мин', ctx:'—' },
  { id:'runway', name:'Runway Gen-3',  icon:'🎞️', iconBg:'linear-gradient(135deg,#f59e0b,#b45309)', badge:'Video',     badgeColor:'#f59e0b', desc:'Кинематографическое видео, motion brush.', tags:['video'], speed:'2-3 мин', ctx:'—' },
]

export const MODES: ChatMode[] = [
  { id:'text',  label:'Текст',    icon:'💬', placeholder:'Задайте любой вопрос...' },
  { id:'image', label:'Картинка', icon:'🖼️', placeholder:'Опишите изображение...' },
  { id:'video', label:'Видео',    icon:'🎬', placeholder:'Опишите видеосцену...' },
  { id:'audio', label:'Музыка',   icon:'🎵', placeholder:'Опишите трек или звук...' },
  { id:'code',  label:'Код',      icon:'⌨️', placeholder:'Что написать или исправить?' },
]

interface ChatStore {
  activeModel: AIModel
  activeMode: ChatMode
  messages: Message[]
  setActiveModel: (m: AIModel) => void
  setActiveMode: (m: ChatMode) => void
  addMessage: (msg: Message) => void
  clearMessages: () => void
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Привет! Я Ghost AI. Выберите модель и режим вверху, затем напишите что-нибудь. 🌙',
  time: '',
}

export const useChatStore = create<ChatStore>(set => ({
  activeModel: MODELS[0],
  activeMode: MODES[0],
  messages: [WELCOME],
  setActiveModel: (m) => set({ activeModel: m }),
  setActiveMode: (m) => set({ activeMode: m }),
  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [WELCOME] }),
}))
