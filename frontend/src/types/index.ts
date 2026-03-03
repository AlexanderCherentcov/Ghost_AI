// ========================
// API & Domain Types
// ========================

export interface User {
  id: string
  username: string | null
  email: string | null
  avatar_url: string | null
  is_admin: boolean
  plan_id: string
  created_at: string
}

export interface Balance {
  balance: number
  bonus_balance: number
  total: number
  plan_id: string
  daily_used: number
  daily_limit: number | null
  monthly_quota: number
  monthly_quota_used: number
}

export interface Plan {
  id: string
  name: string
  price_rub_month: number
  credits_monthly: number
  credits_daily_limit: number | null
  features: Record<string, unknown>
}

export interface Mode {
  id: string
  title: string
  description: string
  category: string
  icon_emoji: string
  min_plan: string
  is_locked: boolean
  model_policy: { tier: string; model: string }
  price_policy: { type: string; base_credits?: number }
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  content_type: string
  credits_charged: number
  created_at: string
  streaming?: boolean
}

export interface Document {
  id: string
  filename: string
  file_type: string
  size_bytes: number
  status: 'pending' | 'indexing' | 'ready' | 'failed'
  chunk_count: number
  created_at: string
}

export interface ApiError {
  detail: string
  status?: number
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    username: string
    plan_id: string
  }
}

// UI state
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
}
