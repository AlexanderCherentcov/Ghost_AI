import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, streamChat, plansApi } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useBalance } from '@/hooks'
import Sidebar from '@/components/layout/Sidebar'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import type { Mode, Message, Plan } from '@/types'
import styles from './Dashboard.module.scss'

type Tab = 'chat' | 'account'

export default function Dashboard() {
  const { token, user, balance, logout } = useAuthStore()
  const { addToast } = useUIStore()
  const navigate = useNavigate()
  const { refetch: refetchBalance } = useBalance()

  const [tab, setTab] = useState<Tab>('chat')
  const [modes, setModes] = useState<Mode[]>([])
  const [activeMode, setActiveMode] = useState<Mode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    chatApi.modes()
      .then(({ data }) => {
        setModes(data)
        // Автовыбор general_chat при первой загрузке
        if (data.length > 0 && !activeMode) {
          const def = data.find((m: Mode) => m.id === 'general_chat') ?? data[0]
          if (!def.is_locked) selectMode(def.id)
        }
      })
      .catch(() => addToast('error', 'Не удалось загрузить режимы'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate, addToast])

  useEffect(() => {
    if (tab === 'account' && plans.length === 0) {
      setLoadingPlans(true)
      plansApi.list()
        .then(({ data }) => setPlans(data))
        .catch(() => {})
        .finally(() => setLoadingPlans(false))
    }
  }, [tab, plans.length])

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const selectMode = useCallback(async (modeId: string) => {
    const mode = modes.find((m) => m.id === modeId)
    if (!mode) return
    setActiveMode(mode)
    setMessages([])
    setTab('chat')
    setLoadingHistory(true)
    try {
      const { data } = await chatApi.history(modeId)
      setMessages(Array.isArray(data) ? data : (data.messages ?? []))
    } catch {
      // no history
    } finally {
      setLoadingHistory(false)
      scrollBottom()
    }
  }, [modes, scrollBottom])

  const sendMessage = useCallback(async (content: string) => {
    if (!activeMode || streaming) return
    const userMsg: Message = {
      id: `u-${Date.now()}`, role: 'user', content,
      content_type: 'text', credits_charged: 0, created_at: new Date().toISOString(),
    }
    const aiMsg: Message = {
      id: `a-${Date.now()}`, role: 'assistant', content: '',
      content_type: 'text', credits_charged: 0, created_at: new Date().toISOString(),
      streaming: true,
    }
    setMessages((prev) => [...prev, userMsg, aiMsg])
    setStreaming(true)
    scrollBottom()
    try {
      const requestId = crypto.randomUUID()
      for await (const chunk of streamChat(activeMode.id, content, requestId)) {
        if (chunk.error) {
          addToast('error', chunk.error)
          setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
          break
        }
        if (chunk.delta) {
          setMessages((prev) => prev.map((m) =>
            m.id === aiMsg.id ? { ...m, content: m.content + chunk.delta } : m))
          scrollBottom()
        }
        if (chunk.done) {
          setMessages((prev) => prev.map((m) =>
            m.id === aiMsg.id ? { ...m, streaming: false, credits_charged: chunk.credits_used ?? 0 } : m))
          refetchBalance()
        }
      }
    } catch {
      addToast('error', 'Ошибка соединения')
      setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
    } finally {
      setStreaming(false)
    }
  }, [activeMode, streaming, addToast, scrollBottom, refetchBalance])

  const handleLogout = () => { logout(); navigate('/') }

  const PLAN_LABELS: Record<string, string> = { free: 'Free', starter: 'Starter', pro: 'Pro', creator: 'Creator' }
  const PLAN_COLORS: Record<string, string> = { free: '#6B7280', starter: '#A78BFA', pro: '#7C3AED', creator: '#00E5C8' }
  const dailyPct  = balance?.daily_limit ? Math.min(100, (balance.daily_used / balance.daily_limit) * 100) : 0
  const monthlyPct = balance?.monthly_quota ? Math.min(100, ((balance.monthly_quota_used ?? 0) / balance.monthly_quota) * 100) : 0

  return (
    <div className={styles.layout}>
      <Sidebar modes={modes} activeMode={activeMode?.id ?? null} onSelect={selectMode} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={styles.main}>
        {/* ── Top bar ── */}
        <div className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'chat' ? styles.tabActive : ''}`} onClick={() => setTab('chat')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Чат
            </button>
            <button className={`${styles.tab} ${tab === 'account' ? styles.tabActive : ''}`} onClick={() => setTab('account')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Аккаунт
            </button>
          </div>

          {tab === 'chat' && activeMode && (
            <div className={styles.modeLabel}>
              <span>{activeMode.icon_emoji}</span>
              <span className={styles.modeLabelName}>{activeMode.title}</span>
            </div>
          )}

          {balance && (
            <div className={styles.balancePill}>
              <span className={styles.balanceIcon}>◆</span>
              <span className={styles.balanceNum}>{balance.total}</span>
              <span className={styles.balanceHint}>кр.</span>
            </div>
          )}
        </div>

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          <>
            {!activeMode ? (
              <div className={styles.empty}>
                <div className={styles.emptyGhost}>👻</div>
                <h2 className={styles.emptyTitle}>Выберите режим</h2>
                <p className={styles.emptySub}>
                  {modes.length > 0 ? `${modes.filter(m => !m.is_locked).length} режимов доступно` : 'Загрузка...'}
                </p>
                <button className={styles.openSidebarBtn} onClick={() => setSidebarOpen(true)}>
                  Открыть режимы
                </button>
              </div>
            ) : (
              <>
                <div className={styles.chatSubHeader}>
                  <span className={styles.chatIcon}>{activeMode.icon_emoji}</span>
                  <div className={styles.chatInfo}>
                    <div className={styles.chatTitle}>{activeMode.title}</div>
                    <div className={styles.chatDesc}>{activeMode.description}</div>
                  </div>
                  <button className={styles.switchModeBtn} onClick={() => setSidebarOpen(true)} title="Сменить режим">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Режим</span>
                  </button>
                  <button className={styles.clearBtn} onClick={() => { chatApi.clearHistory(activeMode.id); setMessages([]) }} title="Очистить историю">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className={styles.messages}>
                  {loadingHistory ? (
                    <div className={styles.loadingHistory}>Загрузка истории...</div>
                  ) : messages.length === 0 ? (
                    <div className={styles.startHint}>
                      <span className={styles.startIcon}>{activeMode.icon_emoji}</span>
                      <p>Начните разговор с <strong>{activeMode.title}</strong></p>
                    </div>
                  ) : (
                    messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
                  )}
                  <div ref={bottomRef} />
                </div>

                <ChatInput onSend={sendMessage} disabled={streaming} placeholder={`Спросите ${activeMode.title}...`} />
              </>
            )}
          </>
        )}

        {/* ── ACCOUNT TAB ── */}
        {tab === 'account' && (
          <div className={styles.accountPage}>

            {/* Profile */}
            <div className={styles.accProfile}>
              <div className={styles.accAvatar}>
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="avatar" />
                  : <span>{(user?.username || user?.email || 'U')[0].toUpperCase()}</span>
                }
              </div>
              <div className={styles.accInfo}>
                <div className={styles.accName}>{user?.username || user?.email || 'Пользователь'}</div>
                {user?.email && user?.username && <div className={styles.accEmail}>{user.email}</div>}
                <div className={styles.accPlanBadge} style={{ background: `${PLAN_COLORS[user?.plan_id ?? 'free']}22`, color: PLAN_COLORS[user?.plan_id ?? 'free'], borderColor: `${PLAN_COLORS[user?.plan_id ?? 'free']}44` }}>
                  {PLAN_LABELS[user?.plan_id ?? 'free'] || user?.plan_id || 'Free'}
                </div>
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Выйти
              </button>
            </div>

            {/* Balance stats */}
            {balance && (
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Баланс</div>
                  <div className={styles.statNum} style={{ color: '#00E5C8' }}>{balance.total}</div>
                  <div className={styles.statSub}>кредитов</div>
                  {balance.bonus_balance > 0 && <div className={styles.statBonus}>+ {balance.bonus_balance} бонус</div>}
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabel}>День</div>
                  <div className={styles.statNum}>{balance.daily_used} <span style={{ fontSize: '.7em', color: 'rgba(226,217,255,.4)' }}>/ {balance.daily_limit ?? '∞'}</span></div>
                  {balance.daily_limit && (
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${dailyPct}%`, background: dailyPct > 80 ? '#EF4444' : 'linear-gradient(90deg,#7C3AED,#00E5C8)' }} />
                    </div>
                  )}
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Месяц</div>
                  <div className={styles.statNum}>{balance.monthly_quota_used ?? 0} <span style={{ fontSize: '.7em', color: 'rgba(226,217,255,.4)' }}>/ {balance.monthly_quota}</span></div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${monthlyPct}%`, background: monthlyPct > 80 ? '#EF4444' : 'linear-gradient(90deg,#7C3AED,#00E5C8)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Plans */}
            <div className={styles.accSection}>
              <div className={styles.accSectionTitle}>Тарифные планы</div>
              {loadingPlans ? (
                <div className={styles.loadingHistory}>Загрузка...</div>
              ) : (
                <div className={styles.plansGrid}>
                  {plans.map((p) => (
                    <div key={p.id} className={`${styles.planCard} ${p.id === user?.plan_id ? styles.planActive : ''}`}>
                      {p.id === user?.plan_id && <div className={styles.planCurrentTag}>Текущий</div>}
                      <div className={styles.planName}>{p.name}</div>
                      <div className={styles.planPrice}>
                        {p.price_rub_month === 0
                          ? <span style={{ color: '#00E5C8', fontWeight: 700 }}>Бесплатно</span>
                          : <><span className={styles.planNum}>{p.price_rub_month}</span><span className={styles.planPer}>₽/мес</span></>
                        }
                      </div>
                      <div className={styles.planCredits}>{p.credits_monthly.toLocaleString()} кр./мес</div>
                      {p.id !== user?.plan_id && (
                        <button className={styles.planBtn} onClick={() =>
                          plansApi.subscribe(p.id).then(({ data }) => {
                            if (data.payment_url) window.open(data.payment_url, '_blank')
                            else { refetchBalance(); addToast('success', 'Тариф изменён!') }
                          }).catch(() => addToast('error', 'Ошибка при смене тарифа'))
                        }>
                          {p.price_rub_month === 0 ? 'Использовать' : 'Подключить'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick mode access */}
            {modes.length > 0 && (
              <div className={styles.accSection}>
                <div className={styles.accSectionTitle}>Быстрый запуск чата</div>
                <div className={styles.quickGrid}>
                  {modes.filter(m => !m.is_locked).slice(0, 8).map(m => (
                    <button key={m.id} className={styles.quickCard} onClick={() => selectMode(m.id)}>
                      <span className={styles.quickIcon}>{m.icon_emoji}</span>
                      <span className={styles.quickName}>{m.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
