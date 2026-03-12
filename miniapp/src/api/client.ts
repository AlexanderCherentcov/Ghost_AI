import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['X-Source'] = 'miniapp'
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Streaming SSE chat
export async function* streamChat(
  modeId: string,
  content: string,
  requestId: string,
  token: string
): AsyncGenerator<{ delta?: string; done?: boolean; credits_used?: number; error?: string }> {
  const response = await fetch(`${API_BASE}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Source': 'miniapp',
    },
    body: JSON.stringify({ mode_id: modeId, content, request_id: requestId }),
  })

  if (!response.ok) {
    const err = await response.json()
    yield { error: err.detail?.error || 'Request failed' }
    return
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value)
    const lines = text.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6))
          yield data
        } catch {}
      }
    }
  }
}

export const authApi = {
  telegramMiniApp: (initData: string) =>
    api.post('/api/auth/telegram/miniapp', { init_data: initData }),
}

export const userApi = {
  me: () => api.get('/api/user/me'),
  balance: () => api.get('/api/user/balance'),
  usage: (page = 1) => api.get(`/api/user/usage?page=${page}`),
}

export const plansApi = {
  list: () => api.get('/api/plans'),
  subscribe: (planId: string) => api.post('/api/plans/subscribe', null, { params: { plan_id: planId } }),
}

export const chatApi = {
  modes: (category?: string) => api.get('/api/chat/modes', { params: { category } }),
  history: (modeId?: string, page = 1) =>
    api.get('/api/chat/history', { params: { mode_id: modeId, page } }),
  clearHistory: (modeId: string) => api.delete(`/api/chat/history/${modeId}`),

  stream: async (
    payload: { mode_id: string; content: string; request_id?: string },
    onChunk: (chunk: string) => void
  ) => {
    const token = useAuthStore.getState().token
    const response = await fetch(`${API_BASE}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Source': 'miniapp',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Error' }))
      throw { response: { data: err } }
    }
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const text = decoder.decode(value)
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          onChunk(line.slice(6).trim())
        }
      }
    }
  },
}

export const imageApi = {
  generate: (data: object) => api.post('/api/image/generate', data),
  status: (taskId: string) => api.get(`/api/image/status/${taskId}`),
}

export const docsApi = {
  list: () => api.get('/api/docs'),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/docs/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  status: (docId: string) => api.get(`/api/docs/${docId}/status`),
  delete: (docId: string) => api.delete(`/api/docs/${docId}`),
}

export const voiceApi = {
  stt: (audio: Blob) => {
    const form = new FormData()
    form.append('audio', audio, 'voice.ogg')
    return api.post('/api/voice/stt', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  tts: (text: string, voiceId?: string) =>
    api.post('/api/voice/tts', { text, voice_id: voiceId }),
}
