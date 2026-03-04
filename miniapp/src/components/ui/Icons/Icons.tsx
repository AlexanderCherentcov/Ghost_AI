import React from 'react'

interface IconProps {
  size?: number
  active?: boolean
  className?: string
}

const activeColor = '#FFD700'
const inactiveColor = 'rgba(229,228,226,0.4)'

// ─── Chat bubble ──────────────────────────────────────────────────────────────
export const IconChat: React.FC<IconProps> = ({ size = 24, active = false, className }) => {
  const c = active ? activeColor : inactiveColor
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,215,0,0.12)' : 'none'}
        style={{ transition: 'all 0.3s ease' }}
      />
      <circle cx="9"  cy="11" r="1" fill={c} style={{ transition: 'all 0.3s ease' }} />
      <circle cx="12" cy="11" r="1" fill={c} style={{ transition: 'all 0.3s ease' }} />
      <circle cx="15" cy="11" r="1" fill={c} style={{ transition: 'all 0.3s ease' }} />
    </svg>
  )
}

// ─── Modes grid ───────────────────────────────────────────────────────────────
export const IconModes: React.FC<IconProps> = ({ size = 24, active = false, className }) => {
  const c = active ? activeColor : inactiveColor
  const fill = active ? 'rgba(255,215,0,0.15)' : 'none'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      xmlns="http://www.w3.org/2000/svg">
      <rect x="3"  y="3"  width="7.5" height="7.5" rx="2" stroke={c} strokeWidth="1.7" fill={fill}
        style={{ transition: 'all 0.3s ease' }} />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={c} strokeWidth="1.7" fill={fill}
        style={{ transition: 'all 0.3s ease' }} />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={c} strokeWidth="1.7" fill={fill}
        style={{ transition: 'all 0.3s ease' }} />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={c} strokeWidth="1.7" fill={fill}
        style={{ transition: 'all 0.3s ease' }} />
    </svg>
  )
}

// ─── Star / Plans ─────────────────────────────────────────────────────────────
export const IconPlans: React.FC<IconProps> = ({ size = 24, active = false, className }) => {
  const c = active ? activeColor : inactiveColor
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l2.9 6.4L22 9.3l-5 5 1.2 7L12 18l-6.2 3.3L7 14.3 2 9.3l7.1-.9L12 2z"
        stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,215,0,0.18)' : 'none'}
        style={{ transition: 'all 0.3s ease' }}
      />
    </svg>
  )
}

// ─── Account / Person ─────────────────────────────────────────────────────────
export const IconAccount: React.FC<IconProps> = ({ size = 24, active = false, className }) => {
  const c = active ? activeColor : inactiveColor
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4"
        stroke={c} strokeWidth="1.7"
        fill={active ? 'rgba(255,215,0,0.12)' : 'none'}
        style={{ transition: 'all 0.3s ease' }}
      />
      <path
        d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke={c} strokeWidth="1.7" strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }}
      />
    </svg>
  )
}

// ─── Support / Shield ─────────────────────────────────────────────────────────
export const IconSupport: React.FC<IconProps> = ({ size = 24, active = false, className }) => {
  const c = active ? activeColor : inactiveColor
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L4 5.5v6.5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V5.5L12 2z"
        stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? 'rgba(255,215,0,0.10)' : 'none'}
        style={{ transition: 'all 0.3s ease' }}
      />
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'all 0.3s ease' }}
      />
    </svg>
  )
}

// ─── Send arrow ───────────────────────────────────────────────────────────────
export const IconSend: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Back arrow ───────────────────────────────────────────────────────────────
export const IconBack: React.FC<IconProps> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12H5M12 5l-7 7 7 7" stroke={inactiveColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Lock ─────────────────────────────────────────────────────────────────────
export const IconLock: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="11" width="14" height="10" rx="2" stroke={inactiveColor} strokeWidth="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke={inactiveColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─── Search ───────────────────────────────────────────────────────────────────
export const IconSearch: React.FC<IconProps> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke={inactiveColor} strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" stroke={inactiveColor} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─── Coin / token ─────────────────────────────────────────────────────────────
export const IconToken: React.FC<IconProps> = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke={activeColor} strokeWidth="2"
      fill="rgba(255,215,0,0.12)" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="700"
      fill={activeColor} fontFamily="Syne, sans-serif">G</text>
  </svg>
)
