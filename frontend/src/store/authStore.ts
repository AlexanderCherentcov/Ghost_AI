import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Balance } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  balance: Balance | null
  isLoading: boolean

  setAuth: (token: string, user: User) => void
  setBalance: (balance: Balance) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      balance: null,
      isLoading: false,

      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user })
      },

      setBalance: (balance) => set({ balance }),

      updateUser: (partial) =>
        set((s) => ({ user: s.user ? { ...s.user, ...partial } : null })),

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, balance: null })
      },
    }),
    {
      name: 'ghost-auth',
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
)
