import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current!
    const follower = followerRef.current!
    let fx = 0, fy = 0, mx = 0, my = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      cursor.style.transform = `translate(${mx}px, ${my}px)`
    }

    const animate = () => {
      fx += (mx - fx) * 0.12
      fy += (my - fy) * 0.12
      follower.style.transform = `translate(${fx}px, ${fy}px)`
      requestAnimationFrame(animate)
    }

    const onEnter = () => cursor.classList.add('cursor--hover')
    const onLeave = () => cursor.classList.remove('cursor--hover')

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const raf = requestAnimationFrame(animate)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={followerRef} className="cursor-follower" />
    </>
  )
}
