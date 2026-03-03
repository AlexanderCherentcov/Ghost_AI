'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [modes, setModes] = useState<any[]>([])
  const [activeMode, setActiveMode] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    // DEMO MODE — убрать когда настроишь авторизацию
    const DEMO_MODE = true

    if (DEMO_MODE) {
      setUser({ id: 'demo', username: 'demo_user', plan_id: 'pro', is_admin: false })
      setBalance({ balance: 2500, bonus_balance: 0, total: 2500, plan_id: 'pro', daily_used: 42, daily_limit: 300, monthly_quota: 2500, monthly_quota_used: 42 })
      setModes([
        { id: 'general_chat', title: 'Общий чат', icon_emoji: '💬', category: 'chat', is_locked: false },
        { id: 'code_assistant', title: 'Помощник по коду', icon_emoji: '💻', category: 'code', is_locked: false },
        { id: 'code_review', title: 'Код-ревью', icon_emoji: '🔍', category: 'code', is_locked: false },
        { id: 'code_debug', title: 'Отладка кода', icon_emoji: '🐛', category: 'code', is_locked: false },
        { id: 'gpt4_smart', title: 'GPT-4 Умный', icon_emoji: '🧠', category: 'chat', is_locked: false },
        { id: 'copywriter_ru', title: 'Копирайтер RU', icon_emoji: '✍️', category: 'content', is_locked: false },
        { id: 'translator_pro', title: 'Переводчик Pro', icon_emoji: '🌐', category: 'content', is_locked: false },
        { id: 'summarizer', title: 'Краткий пересказ', icon_emoji: '📝', category: 'content', is_locked: false },
        { id: 'email_writer', title: 'Деловые письма', icon_emoji: '📧', category: 'business', is_locked: false },
        { id: 'business_analyst', title: 'Бизнес-аналитик', icon_emoji: '📊', category: 'business', is_locked: false },
        { id: 'legal_helper_ru', title: 'Юрист RU', icon_emoji: '⚖️', category: 'business', is_locked: false },
        { id: 'math_tutor', title: 'Репетитор', icon_emoji: '📐', category: 'education', is_locked: false },
        { id: 'social_media_ru', title: 'SMM соцсети', icon_emoji: '📱', category: 'content', is_locked: false },
        { id: 'creative_writer', title: 'Творческий писатель', icon_emoji: '🖊️', category: 'creative', is_locked: false },
        { id: 'brainstorm', title: 'Брейншторм', icon_emoji: '⚡', category: 'productivity', is_locked: false },
        { id: 'image_prompt_gen', title: 'Генератор промптов', icon_emoji: '🎨', category: 'image', is_locked: false },
        { id: 'image_realistic', title: 'Фотореализм', icon_emoji: '📷', category: 'image', is_locked: false },
        { id: 'voice_assistant', title: 'Голосовой ассистент', icon_emoji: '🎤', category: 'voice', is_locked: false },
        { id: 'doc_qa', title: 'Анализ документов', icon_emoji: '📄', category: 'docs', is_locked: false },
        { id: 'seo_writer', title: 'SEO-копирайтер', icon_emoji: '🔎', category: 'content', is_locked: false },
      ])
      return
    }
    // КОНЕЦ DEMO MODE

    const tok = document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1]
    if (!tok) { window.location.href = '/login'; return }
    setToken(tok)

    const headers = { 'Authorization': `Bearer ${tok}`, 'X-Source': 'web' }

    Promise.all([
      fetch('/api/user/me', { headers }).then(r => r.json()),
      fetch('/api/user/balance', { headers }).then(r => r.json()),
      fetch('/api/chat/modes', { headers }).then(r => r.json()),
    ]).then(([u, b, m]) => {
      setUser(u)
      setBalance(b)
      setModes(Array.isArray(m) ? m : [])
    }).catch(() => { window.location.href = '/login' })
  }, [])

  const logout = () => {
    document.cookie = 'token=; max-age=0; path=/'
    window.location.href = '/login'
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !activeMode) return

    const userMsg = { id: Date.now(), role: 'user', content: input.trim() }
    const aiMsg = { id: Date.now() + 1, role: 'assistant', content: '', streaming: true }
    setMessages(prev => [...prev, userMsg, aiMsg])

    // DEMO MODE — имитация ответа без бэкенда
    if (!token) {
      setInput('')
      setStreaming(true)
      const demoReply = `👻 Это демо-режим! Бэкенд не подключён.\n\nВаш запрос: «${userMsg.content}»\n\nЧтобы включить реальный AI — запустите бэкенд и установи DEMO_MODE = false в dashboard/page.tsx`
      let i = 0
      const interval = setInterval(() => {
        i += 4
        setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, content: demoReply.slice(0, i) } : m))
        if (i >= demoReply.length) {
          clearInterval(interval)
          setMessages(prev => prev.map(m => m.id === aiMsg.id ? { ...m, streaming: false, credits: 0 } : m))
          setStreaming(false)
        }
      }, 20)
      return
    }
    // КОНЕЦ DEMO MODE
    const sentInput = input.trim()
    setInput('')
    setStreaming(true)

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Source': 'web',
        },
        body: JSON.stringify({ mode_id: activeMode, content: sentInput, request_id: crypto.randomUUID() }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        for (const line of text.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.delta) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsg.id ? { ...m, content: m.content + data.delta } : m
              ))
            }
            if (data.done) {
              setMessages(prev => prev.map(m =>
                m.id === aiMsg.id ? { ...m, streaming: false, credits: data.credits_used } : m
              ))
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aiMsg.id ? { ...m, content: '❌ Ошибка. Попробуйте снова.', streaming: false } : m
      ))
    } finally {
      setStreaming(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0014]">
        <div className="text-4xl animate-pulse">👻</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0014] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-xl font-bold text-yellow-400">👻 Ghost AI</div>
        <div className="flex items-center gap-4">
          {balance && (
            <div className="text-sm text-gray-300">
              💰 <span className="text-yellow-400 font-bold">{balance.total}</span> кредитов
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full uppercase">{balance.plan_id}</span>
            </div>
          )}
          <span className="text-sm text-gray-400">{user.username || 'Пользователь'}</span>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Выйти</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - modes */}
        <div className="w-64 flex-shrink-0 border-r border-white/10 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2 px-1">Режимы</p>
            <div className="space-y-1">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (mode.is_locked) return
                    setActiveMode(mode.id)
                    setMessages([])
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    mode.is_locked
                      ? 'text-gray-600 cursor-not-allowed'
                      : activeMode === mode.id
                      ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{mode.icon_emoji || '🤖'}</span>
                  {mode.title}
                  {mode.is_locked && <span className="ml-1 text-xs">🔒</span>}
                </button>
              ))}
            </div>
            <Link href="/plans" className="block mt-4 text-center text-xs text-cyan-400 hover:text-cyan-300 py-2 border border-cyan-400/20 rounded-lg">
              ⬆️ Открыть все режимы
            </Link>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!activeMode ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👻</div>
                <h2 className="text-xl font-bold text-gray-300">Выберите режим слева</h2>
                <p className="text-gray-500 text-sm mt-2">или откройте Ghost AI в Telegram</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-sm">Начните разговор</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                        {msg.streaming && <span className="animate-pulse">▌</span>}
                      </div>
                      {msg.role === 'assistant' && !msg.streaming && msg.credits !== undefined && (
                        <div className="text-xs text-gray-400 mt-1 text-right">-{msg.credits} кредитов</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3 max-w-4xl mx-auto">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — перенос)"
                    disabled={streaming}
                    rows={2}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || streaming}
                    className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                  >
                    {streaming ? '⏳' : 'Отправить'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right panel - balance info */}
        <div className="w-56 flex-shrink-0 border-l border-white/10 p-4 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Аккаунт</p>
          {balance && (
            <div className="space-y-3">
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{balance.total}</div>
                <div className="text-xs text-gray-400">кредитов</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Тариф</span>
                  <span className="text-white font-medium uppercase">{balance.plan_id}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Сегодня</span>
                  <span className="text-white">{balance.daily_used}{balance.daily_limit ? `/${balance.daily_limit}` : ''}</span>
                </div>
              </div>
              <Link
                href="/plans"
                className="block w-full text-center py-2 bg-gradient-to-r from-yellow-400/20 to-cyan-400/20 border border-yellow-400/30 rounded-xl text-xs text-yellow-400 hover:border-yellow-400/50 transition-colors"
              >
                ⬆️ Улучшить тариф
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
