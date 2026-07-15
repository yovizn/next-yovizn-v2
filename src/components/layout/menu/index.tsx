'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { TLink } from '@/components/common/transitionLink'
import { useMenu } from '@/hooks/stores/useMenu.hook'

import { mountAnim } from '@/lib/constants/animation.constant'
import { links } from '@/lib/constants/link.constant'

import BlackTwo from '@public/images/black-two.webp'
import {
  menuDividerVariant,
  menuImageVariant,
  menuLinkVariant,
  menuOverlayVariant,
} from '@/lib/constants/variants/menu.variant'
import { useMatchMedia } from '@/hooks/useMedia.hook'
import { socials } from '@/lib/constants/social.constant'
import { GAnchor } from '@/components/common/googleAnchor'
import HoverText from '@/components/animations/text/hover.text'

// Hoisted out of render: motion.create() must run once, not per-render — inside
// the component it rebuilt the wrapper every render (remounting the image).
const MImage = motion.create(Image)

export function Menu() {
  const navRef = useRef<HTMLDivElement>(null)
  const { menu, setMenu } = useMenu()
  const pathname = usePathname()
  const isReduceMotion = useReducedMotion()
  // lg+ only: the image is a side-column accent that only exists where the
  // overlay is flex-row. Below lg it must not mount (it would fill the column).
  const isDesktop = useMatchMedia(1024, 'min')

  useEffect(() => {
    setMenu({ isOpen: false })
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current?.contains(e.target as Node)) return
      setMenu({ isOpen: false })
    }

    window.addEventListener('click', handleClick)

    return () => window.removeEventListener('click', handleClick)
  }, [])

  // Keyboard dismiss: Escape closes the open drawer (modal nav needs Esc).
  useEffect(() => {
    if (!menu.isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu({ isOpen: false })
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menu.isOpen, setMenu])

  return (
    <AnimatePresence mode="wait" initial={!isReduceMotion}>
      {menu.isOpen && (
        <nav id="primary-menu" ref={navRef} className="fixed top-0 left-0 isolate z-30 h-dvh w-full">
          <motion.div
            key="overlay"
            {...mountAnim(menuOverlayVariant)}
            className="bg-paper text-graphite relative flex h-full w-full flex-col justify-between gap-6 overflow-clip px-4 pt-28 pb-4 sm:justify-normal sm:px-6 sm:pb-6 lg:flex-row lg:items-stretch lg:gap-12"
            style={{ perspective: '120px', perspectiveOrigin: 'center' }}
          >
            {isDesktop && (
              <MImage
                key="menu-image"
                src={BlackTwo}
                alt=""
                width={640}
                height={400}
                sizes="(max-width: 1024px) 0px, 36vw"
                priority
                {...(!isReduceMotion ? mountAnim(menuImageVariant) : {})}
                className="relative z-10 hidden rounded-xs object-cover lg:block lg:h-full lg:w-[36%] lg:shrink-0"
              />
            )}

            <ul key="menu-list" className="relative z-10 flex w-full flex-col justify-center gap-1 lg:flex-1">
              {links.map((link, idx) => (
                <li key={link.id} style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}>
                  <motion.div custom={idx} {...mountAnim(menuLinkVariant)}>
                    <TLink
                      href={link.href}
                      className="text-graphite font-nohemi block text-display-lg font-bold uppercase"
                    >
                      {link.name}
                    </TLink>
                  </motion.div>
                </li>
              ))}
            </ul>

            <div
              key="menu-social"
              className="flex w-full flex-col gap-4 sm:h-full sm:flex-row sm:gap-0 lg:w-auto lg:shrink-0 lg:gap-6"
            >
              <motion.div
                {...mountAnim(menuDividerVariant)}
                className="h-0 w-full border-b border-dashed sm:h-full sm:w-0 sm:border-r sm:border-b-0"
              />

              <ul className="flex w-full flex-wrap justify-between gap-x-4 gap-y-0 self-end sm:gap-x-6 lg:ml-auto">
                {socials.map((social) => (
                  <li key={social.id}>
                    <GAnchor
                      href={social.href}
                      target="_blank"
                      className="group font-data block text-[11px] tracking-[0.12em] uppercase"
                    >
                      <HoverText>{social.name}</HoverText>
                    </GAnchor>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </nav>
      )}
    </AnimatePresence>
  )
}
