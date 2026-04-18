"use client"
import lottie from 'lottie-web'
import { useEffect, useRef } from 'react'

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    try {
      const anim = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/Pikachu.json',
      })
      return () => anim.destroy()
    } catch (e) {
      console.error('lottie error:', e)
    }
  }, [])

  return (
    <div className="pokemon-runner">
      <div ref={ref} style={{ height: 55, width: 55, border: '2px solid red' }} />
    </div>
  )
}
