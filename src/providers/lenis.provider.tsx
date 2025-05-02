'use client'

import ReactLenis, { LenisRef, useLenis } from 'lenis/react'
import { LenisOptions } from 'lenis'
import { cancelFrame, frame } from 'motion'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface LenisProviderProps {
  options?: LenisOptions
}

export default function LenisProvider({ options }: LenisProviderProps) {
  const lenisRef = useRef<LenisRef>(null)
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp
      lenisRef.current?.lenis?.raf(time)
    }

    frame.update(update, true)
    return () => cancelFrame(update)
  }, [])

  useEffect(() => {
    lenis?.scrollTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        ...options,
        autoRaf: false,
        duration: 1.5,
        easing: (t) => Math.min(1, 1.02 - Math.pow(2, -10 * t)),
      }}
    />
  )
}
