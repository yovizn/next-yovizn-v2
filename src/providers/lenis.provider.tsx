'use client'

import ReactLenis, { LenisRef } from 'lenis/react'
import { LenisOptions } from 'lenis'
import { cancelFrame, frame } from 'motion'
import { useEffect, useRef } from 'react'

interface LenisProviderProps {
  options?: LenisOptions
}

export default function LenisProvider({ options }: LenisProviderProps) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp
      lenisRef.current?.lenis?.raf(time)
    }

    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        ...options,
        autoRaf: false,
        duration: 1.5,
        lerp: 0.095,
        easing: (t) => Math.min(1, 1.02 - Math.pow(2, -10 * t)),
      }}
    />
  )
}
