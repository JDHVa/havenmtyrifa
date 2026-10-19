import { useEffect, useRef } from 'react'

const COLORS = ['#b8c11f', '#fc8616', '#f9dd60', '#e87136']

export function ClickSpark() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    const sparks: { x: number; y: number; a: number; t: number; color: string }[] = []
    let raf = 0
    const resize = () => {
      c.width = window.innerWidth
      c.height = window.innerHeight
    }
    resize()
    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 10; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 10, t: performance.now(), color: COLORS[i % 4] })
      }
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const draw = (now: number) => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        const p = (now - s.t) / 450
        if (p >= 1) {
          sparks.splice(i, 1)
          continue
        }
        const d = 6 + p * 36
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x + Math.cos(s.a) * d, s.y + Math.sin(s.a) * d, 5 * (1 - p) + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = sparks.length ? requestAnimationFrame(draw) : 0
    }
    window.addEventListener('click', onClick)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])
  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden />
}
