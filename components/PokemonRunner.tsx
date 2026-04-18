"use client"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useState, useEffect } from 'react'

const pokemons = [
  { src: '/Pikachu.lottie', duration: 4000 },
  { src: '/Bulbasaur.lottie', duration: 3000 },
]

export function PokemonRunner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % pokemons.length)
    }, pokemons[current].duration)
    return () => clearTimeout(timer)
  }, [current])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px',
      backgroundColor: '#1a1a1a'
    }}>
      <DotLottieReact
        key={current}
        src={pokemons[current].src}
        loop
        autoplay
        style={{ height: 90, width: 'auto' }}
      />
    </div>
  )
}
