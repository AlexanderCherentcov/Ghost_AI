import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Режимы' },
  { path: '/balance', icon: '💰', label: 'Баланс' },
  { path: '/history', icon: '📜', label: 'История' },
  { path: '/docs', icon: '📄', label: 'Доки' },
  { path: '/plans', icon: '💳', label: 'Тарифы' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex border-t border-white/10 bg-[#0A0014]">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center py-2 transition-colors ${
              active ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
