export interface User {
  id: string
  username: string
  avatar_url?: string
  plan_id: string
  balance?: number
}

export interface AIModel {
  id: string
  name: string
  icon: string
  iconBg: string
  badge: string
  badgeColor: string
  desc: string
  tags: string[]
  speed: string
  ctx: string
}

export interface ChatMode {
  id: string
  label: string
  icon: string
  placeholder: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

export interface RecentChat {
  title: string
  preview: string
  time: string
  icon: string
}
