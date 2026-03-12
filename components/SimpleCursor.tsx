'use client'

import { useEffect, useRef } from 'react'

export default function SimpleCursor() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    let mouseX = 0, mouseY = 0
    let dotX = 0, dotY = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    document.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      // Faster follow
      dotX += (mouseX - dotX) * 0.7
      dotY += (mouseY - dotY) * 0.7

      dot.style.left = `${dotX}px`
      dot.style.top = `${dotY}px`

      requestAnimationFrame(animate)
    }
    animate()

    // Scale on hover for interactive elements
    const interactive = document.querySelectorAll('a, button, input, select, .interactive')
    const onHover = () => dot.classList.add('w-3', 'h-3')
    const onLeave = () => dot.classList.remove('w-3', 'h-3')

    interactive.forEach(el => {
      el.addEventListener('mouseenter', onHover)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      interactive.forEach(el => {
        el.removeEventListener('mouseenter', onHover)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    <div
      ref={dotRef}
      className="fixed w-1.5 h-1.5 bg-[#D4AF37] rounded-full pointer-events-none z-[99999] shadow-[0_0_10px_#D4AF37] transition-all duration-100"
      style={{ transform: 'translate(-50%, -50%)' }}
    />
  )
}