import { useEffect, useRef } from 'react'

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv  = canvasRef.current!
    const ctx = cv.getContext('2d', { alpha: true })!
    let raf: number
    let frame = 0

    const resize = () => {
      cv.width  = window.innerWidth
      cv.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Draw ghost shape ──────────────────────────────────────
    function drawGhost(x: number, y: number, s: number, a: number, t: number) {
      ctx.save()
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(x, y - s * 0.28, s * 0.5, Math.PI, 0, false)
      const bw = s * 0.5
      ctx.lineTo(x + bw, y + s * 0.42)
      const sw = (bw * 2) / 4
      for (let i = 4; i >= 0; i--)
        ctx.lineTo(x - bw + i * sw, y + s * 0.42 + Math.sin(i * Math.PI + t * 0.018) * s * 0.14)
      ctx.closePath()
      const g = ctx.createRadialGradient(x, y, 0, x, y, s)
      g.addColorStop(0,   'rgba(167,139,250,.22)')
      g.addColorStop(0.6, 'rgba(91,33,182,.09)')
      g.addColorStop(1,   'rgba(0,229,200,.02)')
      ctx.fillStyle = g; ctx.fill()
      ctx.strokeStyle = 'rgba(167,139,250,.12)'; ctx.lineWidth = 0.7; ctx.stroke()
      ctx.fillStyle = 'rgba(0,229,200,.65)'
      ctx.beginPath(); ctx.arc(x - s * 0.14, y - s * 0.22, s * 0.058, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x + s * 0.14, y - s * 0.22, s * 0.058, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    // ── Ghost ─────────────────────────────────────────────────
    class GhostEntity {
      x = 0; y = 0; s = 0; vx = 0; vy = 0; a = 0; t = 0; w = 0
      constructor() { this.reset(true) }
      reset(init: boolean) {
        this.x  = Math.random() * cv.width
        this.y  = init ? Math.random() * cv.height : cv.height + 80
        this.s  = Math.random() * 26 + 12
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = -(Math.random() * 0.3 + 0.1)
        this.a  = Math.random() * 0.14 + 0.03
        this.t  = Math.random() * 1000
        this.w  = Math.random() * 2 - 1
      }
      update() {
        this.t++
        this.x += this.vx + Math.sin(this.t * 0.009) * this.w * 0.3
        this.y += this.vy
        if (this.y < -100) this.reset(false)
      }
      draw() { drawGhost(this.x, this.y, this.s, this.a, this.t) }
    }

    // ── Wisp — use ellipse() instead of scale+arc (faster, no save/restore) ──
    class WispEntity {
      x = 0; y = 0; rx = 0; a = 0; vx = 0; ph = 0; sp = 0; c = ''
      constructor() { this.reset() }
      reset() {
        this.x  = Math.random() * cv.width
        this.y  = Math.random() * cv.height
        this.rx = Math.random() * 130 + 60
        this.a  = 0.01
        this.vx = (Math.random() - 0.5) * 0.25
        this.ph = Math.random() * Math.PI * 2
        this.sp = Math.random() * 0.002 + 0.001
        this.c  = Math.random() > 0.5 ? '91,33,182' : '0,229,200'
      }
      update() {
        this.x  += this.vx
        this.ph += this.sp
        this.a   = Math.abs(Math.sin(this.ph)) * 0.035 + 0.006
        if (this.x < -280) this.x = cv.width + 280
        if (this.x > cv.width + 280) this.x = -280
      }
      draw() {
        // ellipse() avoids ctx.scale + save/restore — compositor-friendly
        const ry = this.rx * 0.22
        const g  = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rx)
        g.addColorStop(0, `rgba(${this.c},.5)`)
        g.addColorStop(1, `rgba(${this.c},0)`)
        ctx.save()
        ctx.globalAlpha = this.a
        ctx.beginPath()
        ctx.ellipse(this.x, this.y, this.rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()
      }
    }

    // ── Reduced counts for 60fps headroom ───────────────────
    const ghosts = Array.from({ length: 8  }, () => new GhostEntity())
    const wisps  = Array.from({ length: 10 }, () => new WispEntity())
    const pts    = Array.from({ length: 32 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      s:  Math.random() * 1.5 + 0.4,
      c:  Math.random() > 0.5 ? '167,139,250' : '0,229,200',
    }))

    // ── Main loop — throttled to 30 fps ──────────────────────
    function bgLoop() {
      raf = requestAnimationFrame(bgLoop)
      frame++
      // Skip every other frame → ~30fps, halves CPU load
      if (frame % 2 !== 0) return

      ctx.clearRect(0, 0, cv.width, cv.height)

      wisps.forEach(w => { w.update(); w.draw() })

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = cv.width
        if (p.x > cv.width) p.x = 0
        if (p.y < 0) p.y = cv.height
        if (p.y > cv.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.c},.28)`
        ctx.fill()
      })

      // Line connections — only inner loop from i+1 (no repeat pairs)
      ctx.lineWidth = 0.5
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 9025) { // 95²
            ctx.strokeStyle = `rgba(91,33,182,${0.09 * (1 - Math.sqrt(d2) / 95)})`
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke()
          }
        }
      }

      ghosts.forEach(g => { g.update(); g.draw() })
    }

    raf = requestAnimationFrame(bgLoop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
