"use client"
import { useEffect, useRef } from 'react'

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    let anim: any
    import('lottie-web').then((lottie) => {
      anim = lottie.default.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/Pikachu.json',
      })
    })
    return () => anim?.destroy()
  }, [])

  return (
    <div className="pokemon-runner">
      <div ref={ref} style={{ height: 55, width: 55, border: '2px solid red' }} />
    </div>
  )
}
