"use client"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useState, useEffect } from 'react'

const pokemons = [
  '/Pikachu.lottie',
  '/Bulbasaur.lottie',
]

export function PokemonRunner() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <div
      className="pokemon-runner"
      onAnimationIteration={() =>
        setCurrent((prev) => (prev + 1) % pokemons.length)
      }
    >
      <DotLottieReact
        key={current}
        src={pokemons[current]}
        loop
        autoplay
        style={{ height: 50, width: 'auto' }}
      />
    </div>
  )
}
