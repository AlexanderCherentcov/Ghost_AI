import { create } from 'zustand'

interface User {
  id: string
  username?: string
  avatar_url?: string
  plan_id: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

  logout: () => set({ token: null, user: null, isAuthenticated: false }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}))
