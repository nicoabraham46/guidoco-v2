"use client"
import { useEffect, useRef, useState } from 'react'

const pokemons = ['/Pikachu.json', '/Bulbasaur.json']

export function PokemonRunner() {
  const ref = useRef<HTMLDivElement>(null)
  const animRef = useRef<any>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!ref.current) return

    let cancelled = false

    import('lottie-web').then((lottie) => {
      if (cancelled || !ref.current) return

      // Destruir solo la animación anterior, no todas
      if (animRef.current) {
        animRef.current.destroy()
        animRef.current = null
      }

      animRef.current = lottie.default.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: pokemons[current],
      })
    })

    // Timer sincronizado con la animación CSS (8s)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        if (!cancelled) {
          setCurrent((prev) => (prev + 1) % pokemons.length)
          setVisible(true)
        }
      }, 400)
    }, 7600)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [current])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (animRef.current) {
        animRef.current.destroy()
        animRef.current = null
      }
    }
  }, [])

  return (
    <div
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
