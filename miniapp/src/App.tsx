import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authApi } from './api/client'
import { useAuthStore } from './store/authStore'
import Splash from './components/ui/Splash/Splash'
import BottomNav from './components/layout/BottomNav/BottomNav'
import HomePage from './pages/Home/HomePage'
import ChatPage from './pages/Chat/ChatPage'
import ModelsPage from './pages/Models/ModelsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import PlansPage from './pages/Plans/PlansPage'
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
          tg.setHeaderColor?.('#030008')
          tg.setBackgroundColor?.('#030008')
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
    <BrowserRouter>
      <div className={styles.app}>
        <div className="ghost-bg" />

        {showSplash && <Splash onDone={onSplashDone} />}

        {!showSplash && authChecked && (
          <div className={styles.layout}>
            <main className={styles.main}>
              <Routes>
                <Route path="/"        element={<Navigate to="/home" replace />} />
                <Route path="/home"    element={<HomePage />} />
                <Route path="/chat"    element={<ChatPage />} />
                <Route path="/models"  element={<ModelsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/plans"   element={<PlansPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="*"        element={<Navigate to="/home" replace />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        )}
      </div>
    </BrowserRouter>
  )
}
