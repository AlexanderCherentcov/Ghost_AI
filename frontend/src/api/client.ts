import axios, { AxiosError } from 'axios'
import type { AuthResponse, Balance, Mode, Message, Document, Plan, User } from '@/types'

// ========================
// Axios instance
// ========================
const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Source'] = 'web'
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api

// ========================
// Auth
// ========================
export const authApi = {
  telegramWeb: (data: { id: number; first_name: string; username?: string; hash: string; auth_date: number }) =>
    api.post<AuthResponse>('/auth/telegram/web', data),

  googleAuthorize: () =>
    api.get<{ url: string }>('/auth/google/authorize'),

  yandexAuthorize: () =>
    api.get<{ url: string }>('/auth/yandex/authorize'),

  logout: () =>
    api.post('/auth/logout'),
}

// ========================
// User
// ========================
export const userApi = {
  me: () => api.get<User>('/user/me'),
  balance: () => api.get<Balance>('/user/balance'),
  usage: () => api.get<{ daily: unknown[]; monthly: unknown[] }>('/user/usage'),
}

// ========================
// Chat (SSE streaming)
// ========================
export const chatApi = {
  modes: () => api.get<Mode[]>('/chat/modes'),
  history: (modeId: string, limit = 20) =>
    api.get<Message[]>(`/chat/history?mode_id=${modeId}&limit=${limit}`),
  clearHistory: (modeId: string) =>
    api.delete(`/chat/history/${modeId}`),
}

export async function* streamChat(
  modeId: string,
  content: string,
  requestId: string,
): AsyncGenerator<{ delta?: string; done?: boolean; credits_used?: number; error?: string }> {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Source': 'web',
    },
    body: JSON.stringify({ mode_id: modeId, content, request_id: requestId }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }))
    yield { error: err.detail || 'Request failed' }
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        yield JSON.parse(raw)
      } catch {
        // skip malformed
      }
    }
  }
}

// ========================
// Image
// ========================
export const imageApi = {
  generate: (prompt: string, size: '512x512' | '1024x1024' = '512x512') =>
    api.post<{ task_id: string }>('/image/generate', { prompt, size }),
  status: (taskId: string) =>
    api.get<{ status: string; image_url?: string }>(`/image/status/${taskId}`),
}

// ========================
// Documents (RAG)
// ========================
export const docsApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<Document>('/docs/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: () => api.get<Document[]>('/docs'),
  status: (id: string) => api.get<Document>(`/docs/${id}/status`),
  delete: (id: string) => api.delete(`/docs/${id}`),
}

// ========================
// Voice
// ========================
export const voiceApi = {
  stt: (file: File) => {
    const form = new FormData()
    form.append('audio', file)
    return api.post<{ text: string }>('/voice/stt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  tts: (text: string, voice?: string) =>
    api.post<{ task_id: string }>('/voice/tts', { text, voice }),
}

// ========================
// Plans
// ========================
export const plansApi = {
  list: () => api.get<Plan[]>('/plans'),
  subscribe: (planId: string) =>
    api.post<{ payment_url?: string; success?: boolean }>(`/plans/subscribe?plan_id=${planId}`),
}
