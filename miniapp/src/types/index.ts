export interface User {
  id: string
  username: string
  avatar_url?: string
  plan_id: string
  balance?: number
}

export interface ActiveMode {
  id: string
  name: string
  emoji: string
  cost: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  cost?: number
}
