import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current!
    const dot    = dotRef.current!
    const ring   = ringRef.current!

    let mx = 0, my = 0, fx = 0, fy = 0
    let rafId = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      cursor.style.transform = `translate(${mx}px,${my}px)`
    }

    const animate = () => {
      fx += (mx - fx) * 0.10
      fy += (my - fy) * 0.10
      ring.style.transform = `translate(${fx}px,${fy}px) translate(-50%,-50%)`
      rafId = requestAnimationFrame(animate)
    }

    const onEnter = () => cursor.classList.add('cursor--hover')
    const onLeave = () => cursor.classList.remove('cursor--hover')

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    rafId = requestAnimationFrame(animate)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Dot — moves instantly with mouse */}
      <div ref={cursorRef} className="cursor" style={{ position: 'fixed', pointerEvents: 'none', zIndex: 99999, mixBlendMode: 'difference' }}>
        <div ref={dotRef} className="dot" style={{
          width: 8, height: 8,
          background: '#fff',
          borderRadius: '50%',
          position: 'absolute',
          transform: 'translate(-50%,-50%)',
        }} />
      </div>
      {/* Ring — follows with lag */}
      <div ref={ringRef} className="ring" style={{
        width: 36, height: 36,
        border: '1px solid rgba(167,139,250,.6)',
        borderRadius: '50%',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 99998,
        top: 0, left: 0,
        transition: 'width .3s, height .3s',
      }} />
    </>
  )
}
