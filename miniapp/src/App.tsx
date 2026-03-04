import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authApi } from './api/client'
import { useAuthStore } from './store/authStore'
import Splash from './components/ui/Splash/Splash'
import Particles from './components/ui/Particles/Particles'
import BottomNav from './components/layout/BottomNav/BottomNav'
import ChatPage from './pages/Chat/ChatPage'
import ModesPage from './pages/Modes/ModesPage'
import PlansPage from './pages/Plans/PlansPage'
import AccountPage from './pages/Account/AccountPage'
import SupportPage from './pages/Support/SupportPage'
import styles from './App.module.scss'

export default function App() {
  const { setAuth } = useAuthStore()
  const [showSplash, setShowSplash] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp
        if (tg) {
          tg.ready()
          tg.expand()
          const initData = tg.initData
          if (initData) {
            const r = await authApi.telegramMiniApp(initData)
            setAuth(r.data.access_token, r.data.user)
          }
        }
      } catch (e) {
        console.warn('Auth failed', e)
      } finally {
        setAuthChecked(true)
      }
    }
    init()
  }, [setAuth])

  const onSplashDone = useCallback(() => setShowSplash(false), [])

  return (
    <BrowserRouter basename="/app">
      <div className={styles.app}>
        <Particles />

        {showSplash && <Splash onDone={onSplashDone} />}

        {!showSplash && authChecked && (
          <div className={styles.layout}>
            <main className={styles.main}>
              <Routes>
                <Route path="/"        element={<Navigate to="/chat" replace />} />
                <Route path="/chat"    element={<ChatPage />} />
                <Route path="/modes"   element={<ModesPage />} />
                <Route path="/plans"   element={<PlansPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="*"        element={<Navigate to="/chat" replace />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        )}
      </div>
    </BrowserRouter>
  )
}
