'use client'

/**
 * hero-shear.tsx — <HeroShear> wrapper component.
 *
 * Renders the wordmark <h1> as children (SSR HTML + a11y + no-WebGL fallback)
 * and mounts the hero-shear-canvas effect lazily via <WebGLIsland>.
 *
 * Scroll velocity derivation:
 *   useScroll() → scrollY MotionValue (px, 0..document.height)
 *   useVelocity(scrollY) → scrollVelocity MotionValue (px/s)
 *   NOT useSpring'd — raw velocity passed to effectProps, smoothed in shader loop.
 *
 * The <h1> is the SSR text, the a11y anchor, and the static no-JS / no-WebGL
 * fallback. When the effect is active, the canvas overlays it with the opaque
 * graphite background from the rasterizer. The <h1> stays in the a11y tree.
 *
 * The wordmarkRef is passed via effectProps so the canvas can read the live
 * computed font family (hashed next/font name) and text content without
 * re-querying the DOM in the frame loop.
 */

import { useRef } from 'react'
import { useScroll, useVelocity } from 'motion/react'

import { WebGLIsland } from '@/components/webgl/webgl-island'
import type { HeroShearCanvasProps } from '@/components/webgl/hero-shear-canvas'
import { cn } from '@/lib/utils/cn'

// Stable module-scope load fn — required by WebGLIsland contract.
// This is the only reference that pulls OGL into the module graph.
const loadHeroShearCanvas = () =>
  import('@/components/webgl/hero-shear-canvas') as Promise<{
    default: React.ComponentType<HeroShearCanvasProps>
  }>

export interface HeroShearProps {
  /** Wordmark text to display. Defaults to "YOVI ZULKARNAEN". */
  text?: string
  className?: string
}

export function HeroShear({ text = 'YOVI ZULKARNAEN', className }: HeroShearProps) {
  // Ref forwarded to the canvas effect so it can derive font + text content.
  const wordmarkRef = useRef<HTMLElement>(null)

  // Scroll velocity: useScroll → useVelocity (NOT useSpring — per contract).
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)

  // effectProps: static config + MotionValues/refs for live sampling.
  const effectProps: HeroShearCanvasProps = {
    scrollVelocity,
    wordmarkRef,
  }

  return (
    <WebGLIsland<HeroShearCanvasProps>
      load={loadHeroShearCanvas}
      effectProps={effectProps}
      rootMargin="200px"
      className={cn('w-full', className)}
    >
      {/*
       * The <h1> is ALWAYS in the DOM:
       *   • SSR output → zero-JS fallback renders real text
       *   • a11y tree → screen readers see the wordmark
       *   • No-WebGL / reduced-motion → only this renders
       * When WebGL is active, the canvas (absolute inset-0) overlays it.
       * Use ref to forward element to the canvas for font extraction.
       */}
      <h1
        id="hero-wordmark"
        ref={wordmarkRef as React.RefObject<HTMLHeadingElement>}
        className={cn(
          'font-nohemi text-paper clamp-[text,3xl,11rem] w-full leading-none font-bold uppercase tracking-tight',
        )}
      >
        {text}
      </h1>
    </WebGLIsland>
  )
}
