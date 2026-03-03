import { useEffect, useState } from 'react'
import { plansApi } from '../api/client'

const PLAN_COLORS: Record<string, string> = {
  free: 'border-gray-500/30',
  starter: 'border-blue-500/30',
  pro: 'border-purple-500/30',
  creator: 'border-yellow-500/30',
  elite: 'border-cyan-400/50',
}

const PLAN_BG: Record<string, string> = {
  free: 'from-gray-900/50',
  starter: 'from-blue-900/30',
  pro: 'from-purple-900/30',
  creator: 'from-yellow-900/20',
  elite: 'from-cyan-900/30',
}

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    plansApi.list().then((r) => setPlans(r.data))
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return
    try {
      const resp = await plansApi.subscribe(planId)
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.openLink(resp.data.payment_url)
      } else {
        window.open(resp.data.payment_url, '_blank')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const FEATURES: Record<string, string[]> = {
    free: ['15 кредитов (разово)', '15 базовых режимов', 'Только текст'],
    starter: ['800 кредитов/мес', '40 режимов', 'STT голос', 'Дневной лимит 100'],
    pro: ['2500 кредитов/мес', '75 режимов', 'Изображения 512px', 'RAG 3 документа', 'STT + TTS'],
    creator: ['8000 кредитов/мес', 'Все 90 режимов', 'HD изображения', 'RAG 20 документов', 'Приоритет'],
    elite: ['40000 кредитов/мес', 'Видео генерация', 'API доступ', 'Макс. приоритет', 'Безлимитный контекст'],
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-yellow-400">💳 Тарифы</h1>
        <p className="text-xs text-gray-500 mt-1">Выберите подходящий план</p>
      </div>

      <div className="p-4 space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gradient-to-r ${PLAN_BG[plan.id] || 'from-gray-900/50'} to-transparent border ${PLAN_COLORS[plan.id] || 'border-white/10'} rounded-2xl p-4`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <div className="text-yellow-400 font-semibold">
                  {plan.price_rub_month === 0 ? 'Бесплатно' : `${plan.price_rub_month} ₽/мес`}
                </div>
              </div>
              {plan.id !== 'free' && (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold rounded-xl transition-colors"
                >
                  Выбрать
                </button>
              )}
            </div>

            <div className="space-y-1">
              {(FEATURES[plan.id] || []).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-green-400 text-xs">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
