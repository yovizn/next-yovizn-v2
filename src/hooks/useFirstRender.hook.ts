import { tryCatch } from '@/lib/utils/tryCatch'
import { checkFirstRender } from '@/services/checkFirstRender.service'
import { useCallback, useEffect } from 'react'
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

  useEffect(() => {
    const hasVisited = document.cookie.includes('isFirstRender=true')

    // Already visited: keep the (default) skip state and let the page show.
    if (hasVisited) {
      setPageTransition({ isTransitionComplete: true })
      return
    }

    // First visit: play the intro. Completion is driven by the animation
    // via completeFirstRender — no timer started here.
    setIsTransitionDone(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Called by the intro overlay when its SVG mark finishes animating.
  // The animation is the single source of truth — no parallel setTimeout.
  const completeFirstRender = useCallback(async () => {
    setPageTransition({ isTransitionComplete: true })
    setIsTransitionDone(true)
    const [, error] = await tryCatch(checkFirstRender())
    if (error) return
  }, [setIsTransitionDone, setPageTransition])

  return { completeFirstRender }
}
