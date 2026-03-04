import { create } from 'zustand'
import type { ActiveMode } from '../types'

interface ChatStore {
  activeMode: ActiveMode | null
  setActiveMode: (mode: ActiveMode | null) => void
}

export const useChatStore = create<ChatStore>(set => ({
  activeMode: null,
  setActiveMode: (mode) => set({ activeMode: mode }),
}))
