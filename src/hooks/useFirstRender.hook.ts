import { tryCatch } from '@/lib/utils/tryCatch'
import { checkFirstRender } from '@/services/checkFirstRender.service'
import { useCallback, useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { usePageTransition } from './stores/usePage.hook'

/**
 * Drives the first-render intro overlay using a CLIENT-side cookie read
 * (no server `cookies()`, so the route stays static).
 *
 * Cookie semantics are inverted: `isFirstRender=true` EXISTS => already
 * visited => SKIP intro; cookie ABSENT => genuine first visit => PLAY.
 * We read `document.cookie` in an effect (never in a render/useState
 * initializer) so SSR HTML and first client render agree.
 *
 * Fail-safe default: the caller initializes `isTransitionDone = true`
 * (skip). We only flip to PLAY when the cookie is absent — so a repeat
 * visit never flashes the overlay even if the effect is delayed.
 *
 * Completion is signalled by the animation itself via `completeFirstRender`,
 * not by a fixed setTimeout — the animation is the single source of truth.
 */
export function useFirstRender(
  setIsTransitionDone: (isTransitionDone: boolean) => void,
) {
  const { setPageTransition } = usePageTransition()
  const isReduceMotion = useReducedMotion()
  const startedRef = useRef(false)

  // Called by the intro overlay when its SVG mark finishes its `enter` draw-in
  // (or immediately under reduced motion). Marks the transition complete, writes
  // the visited cookie, and unlocks scroll. The animation is the source of truth.
  const completeFirstRender = useCallback(async () => {
    setPageTransition({ isTransitionComplete: true })
    setIsTransitionDone(true)
    const [, error] = await tryCatch(checkFirstRender())
    if (error) return
  }, [setIsTransitionDone, setPageTransition])

  useEffect(() => {
    // Act exactly once, and only after reduced-motion resolves to a definite
    // value (it can be null until the media query is read post-mount).
    if (startedRef.current || isReduceMotion === null) return
    startedRef.current = true

    const hasVisited = document.cookie.includes('isFirstRender=true')

    // Already visited: keep the (default) skip state and let the page show.
    if (hasVisited) {
      setPageTransition({ isTransitionComplete: true })
      return
    }

    // Reduced motion (HARD RULE): never play the intro choreography. Resolve
    // immediately — complete + write the cookie + unlock scroll — and leave
    // isTransitionDone at its default `true` so the overlay never renders.
    if (isReduceMotion) {
      completeFirstRender()
      return
    }

    // Genuine first visit, motion OK: play the intro. Completion is driven by the
    // animation's `enter` via completeFirstRender — no timer started here.
    setIsTransitionDone(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReduceMotion])

  return { completeFirstRender }
}
