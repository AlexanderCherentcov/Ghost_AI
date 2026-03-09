import { useEffect, useRef, useState } from 'react'
import s from './Intro.module.scss'

const NAMES = [
  ['👻', 'ChatGPT-4o'], ['🧠', 'Claude 3.5'], ['🌟', 'Gemini Ultra'], ['🎨', 'Midjourney'],
  ['🎬', 'Sora'], ['✈️', 'Runway ML'], ['⚡', 'Grok 3'], ['🦙', 'Llama 3'],
  ['🔍', 'Perplexity'], ['🎵', 'Suno AI'], ['🗣️', 'ElevenLabs'], ['🎥', 'Pika Labs'],
  ['💎', 'Flux 1.1'], ['🌊', 'Stable Diffusion'], ['🐋', 'DeepSeek'], ['🔮', 'Mistral'],
  ['🏔️', 'Qwen Max'], ['🌌', 'Google Veo 3'], ['🤖', 'Copilot'], ['🎯', 'Adobe Firefly'],
]

export default function Intro() {
  const [hidden, setHidden] = useState(() => sessionStorage.getItem('intro_shown') === '1')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const namesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hidden) return
    const ic = canvasRef.current!
    const ictx = ic.getContext('2d')!
    ic.width = window.innerWidth
    ic.height = window.innerHeight

    // Burst particles
    const bursts: Array<{
      x: number; y: number; vx: number; vy: number
      life: number; decay: number; size: number; color: string
    }> = []

    function spawnBurst() {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      for (let i = 0; i < 3; i++) {
        const ang = Math.random() * Math.PI * 2
        const spd = Math.random() * 4 + 1
        bursts.push({
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 80,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1, decay: Math.random() * 0.015 + 0.008,
          size: Math.random() * 2.5 + 0.5,
          color: Math.random() > 0.5 ? 'rgba(124,58,237,' : 'rgba(0,229,200,',
        })
      }
    }

    const burstInt = setInterval(spawnBurst, 80)
    let raf: number
    let running = true

    function drawIntro() {
      ictx.clearRect(0, 0, ic.width, ic.height)
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i]
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.97; p.vy *= 0.97
        p.life -= p.decay
        if (p.life <= 0) { bursts.splice(i, 1); continue }
        ictx.beginPath()
        ictx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ictx.fillStyle = p.color + p.life + ')'
        ictx.fill()
      }
      if (running) raf = requestAnimationFrame(drawIntro)
    }
    drawIntro()

    // AI names burst
    const nc = namesRef.current!
    const W = window.innerWidth, H = window.innerHeight
    NAMES.forEach(([ico, name], i) => {
      const el = document.createElement('div')
      el.style.cssText = `
        position:absolute; pointer-events:none;
        font-family:'JetBrains Mono',monospace;
        font-size:.72rem; font-weight:600; letter-spacing:.1em;
        display:flex; align-items:center; gap:.45rem; white-space:nowrap;
        opacity:0;
      `
      const ang = (i / NAMES.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const sr = Math.random() * 90 + 50
      const sx = W / 2 + Math.cos(ang) * sr
      const sy = H / 2 + Math.sin(ang) * sr - 50
      const er = Math.random() * 420 + 260
      const tx = (Math.cos(ang) * er + (Math.random() - 0.5) * 160) + 'px'
      const ty = (Math.sin(ang) * er + (Math.random() - 0.5) * 160) + 'px'
      const dur = (2 + Math.random() * 1.5) + 's'
      const del = (0.5 + i * 0.115) + 's'
      el.style.left = sx + 'px'
      el.style.top = sy + 'px'
      el.style.setProperty('--tx', tx)
      el.style.setProperty('--ty', ty)
      el.style.setProperty('--dur', dur)
      el.style.setProperty('--del', del)
      el.style.animation = `gnameFly var(--dur) cubic-bezier(.25,.46,.45,.94) var(--del) forwards`
      el.innerHTML = `<span style="font-size:.9rem">${ico}</span><span style="color:rgba(196,181,253,.85);text-shadow:0 0 16px rgba(124,58,237,.7),0 0 32px rgba(0,229,200,.3)">${name}</span>`
      nc.appendChild(el)
    })

    // Dismiss after 4200ms
    const dismissTimer = setTimeout(() => {
      clearInterval(burstInt)
      running = false
      sessionStorage.setItem('intro_shown', '1')
      setHidden(true)
    }, 4200)

    return () => {
      clearInterval(burstInt)
      clearTimeout(dismissTimer)
      running = false
      cancelAnimationFrame(raf)
    }
  }, [])

  if (hidden) return null

  return (
    <div className={`${s.intro}${hidden ? ' ' + s.hidden : ''}`}>
      <canvas ref={canvasRef} className={s.burstCanvas} />
      <div className={s.fog} />
      <div className={s.portal}>
        <div className={s.portalRing} />
        <div className={s.portalRing} />
        <div className={s.portalRing} />
        <div className={s.portalRing} />
      </div>
      <div ref={namesRef} className={s.names} />
      <div className={s.brand}>
        <div className={s.logo}>GHOST AI</div>
        <div className={s.sub}>90 нейросетей · один аккаунт</div>
        <div className={s.progressWrap}>
          <div className={s.progressTrack} />
        </div>
      </div>
    </div>
  )
}
