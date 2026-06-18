import { tryCatch } from '@/lib/utils/tryCatch'
import { checkFirstRender } from '@/services/checkFirstRender.service'
import { useEffect } from 'react'
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

    // First visit: play the intro, persist the cookie, then finish.
    setIsTransitionDone(false)

    const handleFirstRender = async () => {
      const [, error] = await tryCatch(checkFirstRender())
      setIsTransitionDone(true)
      if (error) return
    }

    const timeout = setTimeout(handleFirstRender, 3000)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
