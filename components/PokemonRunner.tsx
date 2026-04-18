"use client"
import { useEffect, useRef, useState } from 'react'

const pokemons = ['/Pikachu.json', '/Bulbasaur.json']
const durations = [8000, 8000]

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

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
      setVisible(false)
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % pokemons.length)
        setVisible(true)
      }, 500)
    }, durations[current])

    return () => {
      clearTimeout(timer)
      anim?.destroy()
    }
  }, [current])

  return (
    <div
      key={current}
      className="pokemon-runner"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div ref={ref} style={{ height: 55, width: 55 }} />
    </div>
  )
}
