import { useEffect, useRef, useCallback } from 'react'
import { userApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

// Fetch and sync balance
export function useBalance() {
  const { token, setBalance } = useAuthStore()

  const fetch = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await userApi.balance()
      setBalance(data)
    } catch {
      // silent
    }
  }, [token, setBalance])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { refetch: fetch }
}

// Auto-resizing textarea
export function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  return ref
}

// Click outside
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [callback])

  return ref
}

// Copy to clipboard
export function useCopy() {
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [])
  return copy
}
