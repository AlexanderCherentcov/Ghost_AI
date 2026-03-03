'use client'
import { useEffect } from 'react'
import Link from 'next/link'

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void
    Telegram: any
  }
}

export default function LoginPage() {
  useEffect(() => {
    // Telegram Login Widget callback
    window.onTelegramAuth = async (user: any) => {
      try {
        const resp = await fetch('/api/auth/telegram/web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        const data = await resp.json()
        if (data.access_token) {
          document.cookie = `token=${data.access_token}; path=/; max-age=2592000`
          window.location.href = '/dashboard'
        }
      } catch (e) {
        console.error('Telegram auth failed', e)
      }
    }

    // Check for OAuth callback token
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=2592000`
      window.location.href = '/dashboard'
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0014] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="text-3xl font-bold text-yellow-400">Ghost AI</h1>
          <p className="text-gray-400 mt-2">Войдите для доступа</p>
        </div>

        <div className="space-y-3">
          {/* Telegram Login Widget */}
          <div className="flex justify-center">
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login="ghost_ai_bot"
              data-size="large"
              data-onauth="onTelegramAuth(user)"
              data-request-access="write"
            />
          </div>

          {/* Google OAuth */}
          <a
            href="/api/auth/google/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/20 rounded-xl hover:border-white/40 transition-colors text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </a>

          {/* Yandex OAuth */}
          <a
            href="/api/auth/yandex/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 border border-white/20 rounded-xl hover:border-white/40 transition-colors text-white"
          >
            <span className="text-red-500 font-bold text-lg">Я</span>
            Войти через Яндекс
          </a>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Нажимая «Войти», вы соглашаетесь с{' '}
          <Link href="/terms" className="text-gray-400 hover:text-white">условиями</Link>
        </p>
      </div>
    </main>
  )
}
