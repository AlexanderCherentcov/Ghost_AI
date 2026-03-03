import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/layout/Navbar'
import Landing from '@/pages/Landing/Landing'
import Login from '@/pages/Login/Login'
import Dashboard from '@/pages/Dashboard/Dashboard'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
