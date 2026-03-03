import { useEffect, useState } from 'react'
import { userApi } from '../api/client'

interface Balance {
  balance: number
  bonus_balance: number
  total: number
  plan_id: string
  daily_used: number
  daily_limit?: number
  monthly_quota_used: number
  monthly_quota: number
}

export default function BalancePage() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [usage, setUsage] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      userApi.balance().then((r) => setBalance(r.data)),
      userApi.usage().then((r) => setUsage(r.data.items || [])),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin text-3xl">⚡</div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">💰 Баланс</h1>
      </div>

      {balance && (
        <div className="p-4 space-y-4">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-yellow-400/20 to-cyan-400/20 border border-yellow-400/30 rounded-2xl p-4">
            <div className="text-3xl font-bold text-yellow-400">{balance.total}</div>
            <div className="text-sm text-gray-400">кредитов доступно</div>
            <div className="mt-2 text-xs text-gray-500">
              Основной: {balance.balance} · Бонусный: {balance.bonus_balance}
            </div>
          </div>

          {/* Plan */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Тариф</span>
              <span className="font-bold text-white uppercase">{balance.plan_id}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-sm">Использовано сегодня</span>
              <span className="text-sm text-white">
                {balance.daily_used}{balance.daily_limit ? ` / ${balance.daily_limit}` : ''}
              </span>
            </div>
            {balance.monthly_quota > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Месячная квота</span>
                  <span>{balance.monthly_quota_used} / {balance.monthly_quota}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (balance.monthly_quota_used / balance.monthly_quota) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Usage History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">История расходов</h3>
            <div className="space-y-2">
              {usage.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Нет данных</p>
              ) : (
                usage.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/3 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-xs text-white">{item.description || item.operation}</div>
                      <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString('ru')}</div>
                    </div>
                    <span className="text-red-400 text-sm font-medium">{item.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
