import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/client'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import BalancePage from './pages/BalancePage'
import PlansPage from './pages/PlansPage'
import HistoryPage from './pages/HistoryPage'
import DocsPage from './pages/DocsPage'
import BottomNav from './components/ui/BottomNav'
import LoadingScreen from './components/ui/LoadingScreen'

export default function App() {
  const [loading, setLoading] = useState(true)
  const { setAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()

        const initData = tg.initData
        if (initData) {
          const resp = await authApi.telegramMiniApp(initData)
          setAuth(resp.data.access_token, resp.data.user)
        }
      }
    } catch (err) {
      console.error('Auth failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen />

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Ghost AI</h1>
          <p className="text-gray-400">Откройте через Telegram бот</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter basename="/app">
      <div className="flex flex-col h-screen bg-[#0A0014] text-white overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat/:modeId" element={<ChatPage />} />
            <Route path="/balance" element={<BalancePage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
