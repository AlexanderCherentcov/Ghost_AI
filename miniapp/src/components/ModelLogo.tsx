import type { CSSProperties } from 'react'

interface Props {
  modelId: string
  size?: number
  style?: CSSProperties
  className?: string
}

// ─── Brand SVG logos ──────────────────────────────────────────────────────────

const OpenAILogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      fill="#10a37f"
      d="M22.28 9.76a5.84 5.84 0 00-.5-4.8 6 6 0 00-6.44-2.88A5.84 5.84 0 0011.1 0a6 6 0 00-5.72 4.14 5.84 5.84 0 00-3.9 2.84 6 6 0 00.74 7.02 5.84 5.84 0 00.5 4.8 6 6 0 006.44 2.88A5.84 5.84 0 0012.9 24a6 6 0 005.72-4.14 5.84 5.84 0 003.9-2.84 6 6 0 00-.74-7.26zM12.9 22.5a4.5 4.5 0 01-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 00.4-.68v-6.74l2.02 1.16a.07.07 0 01.04.06v5.58A4.52 4.52 0 0112.9 22.5zM3.6 18.42a4.5 4.5 0 01-.54-3.02l.14.08 4.78 2.76a.78.78 0 00.78 0l5.84-3.38v2.32a.08.08 0 01-.03.06L9.7 20.04a4.52 4.52 0 01-6.1-1.62zm-.92-9.9A4.5 4.5 0 015.06 6.4v5.66a.78.78 0 00.4.68l5.84 3.36-2.02 1.16a.08.08 0 01-.08 0L4.48 14.5a4.52 4.52 0 01-.8-5.98zm16.6 3.86l-5.84-3.38 2.02-1.16a.08.08 0 01.08 0l4.72 2.72a4.5 4.5 0 01-.7 8.12V13.1a.78.78 0 00-.28-.72zm2-3.04l-.14-.08-4.78-2.74a.78.78 0 00-.78 0L9.74 9.9V7.58a.08.08 0 01.03-.06l4.72-2.72a4.52 4.52 0 016.69 4.64zM8.66 12.84l-2.02-1.16a.08.08 0 01-.04-.06V6.04a4.52 4.52 0 017.4-3.46l-.14.08-4.78 2.76a.78.78 0 00-.4.68l-.02 6.74zm1.1-2.36L12 9.18l2.24 1.28v2.58L12 14.32l-2.24-1.28v-2.56z"
    />
  </svg>
)

const AnthropicLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      fill="#c96a2b"
      d="M13.83 3h-3.66L4 21h3.5l1.3-3.5h6.4l1.3 3.5H20L13.83 3zm-3.8 11.5L12 7.6l1.97 6.9h-3.94z"
    />
  </svg>
)

const GeminiLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285f4" />
        <stop offset="50%" stopColor="#9c27b0" />
        <stop offset="100%" stopColor="#34a853" />
      </linearGradient>
    </defs>
    <path
      fill="url(#gemGrad)"
      d="M12 2C12 2 12 9.5 5 12C12 14.5 12 22 12 22C12 22 12 14.5 19 12C12 9.5 12 2 12 2Z"
    />
  </svg>
)

const FluxLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#7c3aed" />
    <text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif">F</text>
  </svg>
)

const DalleLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#10a37f" />
    <path fill="white" d="M8 8h3.5a2.5 2.5 0 010 5H10v3H8V8zm2 1.5v2h1.5a1 1 0 000-2H10zm5-1.5h2v8h-2V8z" />
  </svg>
)

const SunoLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#e63946" />
    <path
      fill="white"
      d="M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5zm0 2a3 3 0 100 6 3 3 0 000-6z"
    />
    <circle cx="12" cy="12" r="1.5" fill="white" />
  </svg>
)

const KlingLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#f59e0b" />
    <path fill="white" d="M8 7h2v10H8V7zm3.5 5l4.5-5h2.5L14 12l4.5 5H16L11.5 12z" />
  </svg>
)

const RunwayLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#1a1a2e" />
    <path fill="white" d="M7 7h4a3 3 0 010 6h-1.5l3.5 4H11L7.5 13H9v-2h2a1 1 0 000-2H7V7zm8 0h2v10h-2V7z" />
  </svg>
)

const GhostLogo = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#00e5c8" />
      </linearGradient>
    </defs>
    <path
      fill="url(#ghostGrad)"
      d="M12 2C7.58 2 4 5.58 4 10v10l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2V10c0-4.42-3.58-8-8-8z"
    />
    <circle cx="9.5" cy="10" r="1.5" fill="white" />
    <circle cx="14.5" cy="10" r="1.5" fill="white" />
    <circle cx="10" cy="9.5" r="0.6" fill="#1a0030" />
    <circle cx="15" cy="9.5" r="0.6" fill="#1a0030" />
  </svg>
)

// ─── Map ──────────────────────────────────────────────────────────────────────

const LOGO_MAP: Record<string, (size: number) => JSX.Element> = {
  gpt4o:   (s) => <OpenAILogo size={s} />,
  gpt4m:   (s) => <OpenAILogo size={s} />,
  claude:  (s) => <AnthropicLogo size={s} />,
  gemini:  (s) => <GeminiLogo size={s} />,
  flux:    (s) => <FluxLogo size={s} />,
  dalle:   (s) => <DalleLogo size={s} />,
  suno:    (s) => <SunoLogo size={s} />,
  kling:   (s) => <KlingLogo size={s} />,
  runway:  (s) => <RunwayLogo size={s} />,
  ghost:   (s) => <GhostLogo size={s} />,
}

export default function ModelLogo({ modelId, size = 20, style, className }: Props) {
  const render = LOGO_MAP[modelId] ?? LOGO_MAP['ghost']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }} className={className}>
      {render(size)}
    </span>
  )
}
