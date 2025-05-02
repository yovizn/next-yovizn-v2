'use client'

import Link, { LinkProps } from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { sleep } from '@/lib/utils/sleep'
import { handleGoogleEvent } from '@/lib/analytic/googleEvent'
import { useLenis } from 'lenis/react'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useMenu } from '@/hooks/stores/useMenu.hook'

type TLinkProps = Omit<React.HTMLProps<HTMLAnchorElement> & LinkProps, 'onClick' | 'classID'>

export function TLink({ href, ...props }: TLinkProps) {
  const lenis = useLenis()
  const pathname = usePathname()
  const { push } = useRouter()
  const { setPageTransition } = usePageTransition()
  const { setMenu } = useMenu()

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMenu({ isOpen: false })
    handleGoogleEvent({ event: 'linkClicked', url: href })

    if (pathname === href) {
      if (lenis) {
        lenis?.scrollTo(0)
      } else {
        window.scrollTo(0, 0)
      }

      return
    }

    setPageTransition({
      isTransition: true,
      isTransitionComplete: false,
    })
    await sleep(1500)
    push(href, { scroll: true })
    await sleep(3000)
    setPageTransition({ isTransition: false })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
