'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from 'motion/react'
import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { useLenis } from 'lenis/react'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useMenu } from '@/hooks/stores/useMenu.hook'
import { useCursor } from '@/hooks/stores/useCursor.hook'
import { normalizePath } from '@/lib/utils/normalizePath'

type TLinkProps = Omit<React.HTMLProps<HTMLAnchorElement> & LinkProps, 'onClick' | 'classID'>

export function TLink({ href, ...props }: TLinkProps) {
  const lenis = useLenis()
  const pathname = usePathname()
  const prefersReduced = useReducedMotion()
  const {
    page: { phase },
    setPageTransition,
  } = usePageTransition()
  const { setMenu } = useMenu()
  const { setCursor } = useCursor()

  const target = normalizePath(typeof href === 'object' ? ((href as { pathname?: string }).pathname ?? '') : (href ?? ''))

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Pointer-intent side effects always run; navigation itself is handled in onNavigate.
    setMenu({ isOpen: false })
    setCursor({ isVisible: false, children: null })
    handleGoogleEvent({ event: 'linkClicked', url: target })

    if (pathname === target) {
      e.preventDefault()
      if (lenis) lenis.scrollTo(0)
      else window.scrollTo(0, 0)
    }
  }

  const handleNavigate = (e: { preventDefault: () => void }) => {
    // Rapid re-click guard: a cover/cover-hold is already running — let it own the nav.
    if (phase === 'covering' || phase === 'covered') {
      e.preventDefault()
      return
    }

    // Reduced motion: no cover choreography, so let Next navigate inline. Do NOT
    // preventDefault here — there'd be no cover to drive the deferred push, and
    // the navigation would be silently cancelled.
    if (prefersReduced) return

    // Defer the REAL navigation until the cover is fully down. preventDefault
    // cancels Next's immediate client nav; PageTransition issues router.push once
    // phase === 'covered', so the route commits hidden behind the opaque cover
    // (fixes the "page swaps before the animation" flash in the transparent
    // cover-in window). <Link> still prefetches → the deferred push is warm.
    e.preventDefault()
    setPageTransition({
      isTransition: true,
      isTransitionComplete: false,
      phase: 'covering',
      targetPath: target,
    })
  }

  return <Link href={href} onClick={handleClick} onNavigate={handleNavigate} {...props} />
}
