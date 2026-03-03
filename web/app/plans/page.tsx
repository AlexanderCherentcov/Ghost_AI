'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['15 кредитов (разово)', '15 базовых режимов', 'Чат Economy LLM', 'История 5 сообщений'],
  starter: ['800 кредитов/мес', '40 режимов', 'STT (голос → текст)', 'История 10 сообщений', 'Файлы до 10 МБ'],
  pro: ['2 500 кредитов/мес', '75 режимов', 'Изображения 512px', 'STT + TTS', 'RAG 3 документа', 'История 20 сообщений'],
  creator: ['8 000 кредитов/мес', 'Все 90 режимов', 'HD изображения 1024px', 'STT + TTS приоритет', 'RAG 20 документов', 'История 40 сообщений'],
  elite: ['40 000 кредитов/мес', 'Видео генерация', 'API доступ', 'Макс. приоритет', 'RAG 100 документов', 'История 100 сообщений', 'Всё включено'],
}

const PLAN_COLOR: Record<string, string> = {
  free: 'border-gray-500/40',
  starter: 'border-blue-500/40',
  pro: 'border-purple-500/40',
  creator: 'border-yellow-400/50',
  elite: 'border-cyan-400/60',
}

const PLAN_BADGE: Record<string, string> = {
  pro: 'Популярный',
  creator: 'Для создателей',
  elite: '👑 Всё включено',
}

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState('free')
  const [token, setToken] = useState('')

  useEffect(() => {
    const tok = document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1] || ''
    setToken(tok)

    fetch('/api/plans').then(r => r.json()).then(setPlans)

    if (tok) {
      fetch('/api/user/balance', { headers: { Authorization: `Bearer ${tok}` } })
        .then(r => r.json())
        .then(b => setCurrentPlan(b.plan_id || 'free'))
    }
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!token) { window.location.href = '/login'; return }
    if (planId === 'free') return

    const resp = await fetch('/api/plans/subscribe', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(null),
    })
    // workaround: pass planId as query param
    const resp2 = await fetch(`/api/plans/subscribe?plan_id=${planId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await resp2.json()
    if (data.payment_url) window.open(data.payment_url, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0A0014] text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-bold text-yellow-400">👻 Ghost AI</Link>
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">← Назад</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">💳 Тарифные планы</h1>
          <p className="text-gray-400">Выберите подходящий план. Отмена в любое время.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col border ${PLAN_COLOR[plan.id] || 'border-white/10'} rounded-2xl p-5 bg-white/3 ${
                  isCurrent ? 'ring-2 ring-yellow-400/50' : ''
                }`}
              >
                {PLAN_BADGE[plan.id] && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded-full whitespace-nowrap">
                    {PLAN_BADGE[plan.id]}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-3 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Текущий</div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <div className="text-2xl font-bold text-yellow-400 mt-1">
                    {plan.price_rub_month === 0 ? 'Бесплатно' : `${plan.price_rub_month} ₽`}
                  </div>
                  {plan.price_rub_month > 0 && <div className="text-xs text-gray-500">в месяц</div>}
                </div>

                <div className="flex-1 space-y-2 mb-5">
                  {(PLAN_FEATURES[plan.id] || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                {plan.id !== 'free' && !isCurrent && (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold rounded-xl transition-colors"
                  >
                    Выбрать
                  </button>
                )}
                {isCurrent && (
                  <div className="w-full py-2 text-center text-xs text-green-400 border border-green-400/30 rounded-xl">
                    ✓ Активный план
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-10 bg-white/3 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">💡 Система кредитов</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Economy LLM', value: '1 кред / 1k токенов' },
              { label: 'Premium LLM', value: '8 кред / 1k токенов' },
              { label: 'Изображение 512px', value: '6 кредитов' },
              { label: 'Изображение 1024px', value: '12 кредитов' },
              { label: 'STT Whisper', value: '2 кред / мин' },
              { label: 'TTS синтез', value: '3 кред / 1k символов' },
              { label: 'RAG индексация', value: '5 кред / документ' },
              { label: 'RAG запрос', value: '4 кред / запрос' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                <div className="text-yellow-400 font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
