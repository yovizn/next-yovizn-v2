'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { useLenis } from 'lenis/react'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useMenu } from '@/hooks/stores/useMenu.hook'
import { useCursor } from '@/hooks/stores/useCursor.hook'

type TLinkProps = Omit<React.HTMLProps<HTMLAnchorElement> & LinkProps, 'onClick' | 'classID'>

export function TLink({ href, ...props }: TLinkProps) {
  const lenis = useLenis()
  const pathname = usePathname()
  const { push } = useRouter()
  const {
    page: { phase },
    setPageTransition,
  } = usePageTransition()
  const { setMenu } = useMenu()
  const { setCursor } = useCursor()

  const target = typeof href === 'object' ? ((href as { pathname?: string }).pathname ?? '') : (href ?? '')

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
    // Same-path: no transition (scroll-to-top already handled in handleClick).
    if (pathname === target) {
      e.preventDefault()
      return
    }
    // Rapid re-click guard: a cover/cover-hold is already running — let it own the nav.
    if (phase === 'covering' || phase === 'covered') {
      e.preventDefault()
      return
    }

    setPageTransition({
      isTransition: true,
      isTransitionComplete: false,
      phase: 'covering',
      targetPath: target,
    })
    // Drive navigation immediately; the overlay covers in parallel and the
    // uncover is gated on the REAL pathname arrival (see PageTransition).
    push(target, { scroll: true })
  }

  return <Link href={href} onClick={handleClick} onNavigate={handleNavigate} {...props} />
}
