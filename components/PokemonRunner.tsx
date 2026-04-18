"use client"
import { useEffect, useRef, useState } from 'react'

const pokemons = ['/Pikachu.json', '/Bulbasaur.json']
const durations = [4000, 3000]

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    let anim: any
    import('lottie-web').then((lottie) => {
      lottie.default.destroy()
      anim = lottie.default.loadAnimation({
        container: ref.current!,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: pokemons[current],
      })
    })

    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % pokemons.length)
    }, durations[current])

    return () => {
      clearTimeout(timer)
      anim?.destroy()
    }
  }, [current])

  return (
    <div className="pokemon-runner">
      <div ref={ref} style={{ height: 55, width: 55 }} />
    </div>
  )
}
