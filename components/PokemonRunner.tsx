"use client"
import { useEffect, useRef } from 'react'

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    import('lottie-web').then((lottie) => {
      lottie.default.loadAnimation({
        container: ref.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/Pikachu.json',
      })
    })
  }, [])

  return (
    <div className="pokemon-runner">
      <div ref={ref} style={{ height: 55, width: 55, border: '2px solid red' }} />
    </div>
  )
}
