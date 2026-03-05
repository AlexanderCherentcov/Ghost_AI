import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot  = dotRef.current!
    const ring = ringRef.current!

    let mx = -100, my = -100
    let rx = -100, ry = -100
    let rafId = 0
    let visible = false

    // Dot: move instantly on mousemove — no rAF needed
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
    }

    // Ring: rAF with lerp 0.18 — fast enough to feel responsive
    const tick = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`
      rafId = requestAnimationFrame(tick)
    }

    const onEnter = () => { ring.style.width = '52px'; ring.style.height = '52px'; ring.style.opacity = '.65' }
    const onLeave = () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '1' }

    // Delegate hover detection — works for dynamic elements too
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', (e) => {
      const t = e.target as Element
      if (t.closest('a, button, [data-cursor]')) onEnter()
      else onLeave()
    })

    rafId = requestAnimationFrame(tick)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 8, height: 8,
          background: '#fff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
          opacity: 0,
          transition: 'opacity .2s',
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 36, height: 36,
          border: '1px solid rgba(167,139,250,.6)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99998,
          willChange: 'transform',
          opacity: 0,
          // Only size/opacity transition — NOT transform (transform is JS-driven)
          transition: 'width .25s ease, height .25s ease, opacity .2s, border-color .25s',
        }}
      />
    </>
  )
}
