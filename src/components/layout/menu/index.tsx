'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { TLink } from '@/components/common/transitionLink'
import { useMenu } from '@/hooks/stores/useMenu.hook'

import { duration, easing, mountAnim } from '@/lib/constants/animation.constant'
import { links } from '@/lib/constants/link.constant'

import BlackOne from '@public/images/black-one.jpg'
import {
  menuDividerVariant,
  menuImageVariant,
  menuLinkVariant,
  menuOverlayVariant,
} from '@/lib/constants/variants/menu.variant'
import { useMatchMedia } from '@/hooks/useMedia.hook'
import { socials } from '@/lib/constants/social.constant'
import { GAnchor } from '@/components/common/googleAnchor'
import { Li } from '@/components/animations/li.animation'

export function Menu() {
  const navRef = useRef<HTMLDivElement>(null)
  const { menu, setMenu } = useMenu()
  const pathname = usePathname()
  const isReduceMotion = useReducedMotion()
  const isDesktop = useMatchMedia(640, 'min')

  const MImage = motion.create(Image)

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

  return (
    <AnimatePresence mode="wait" initial={!isReduceMotion}>
      {menu.isOpen && (
        <nav ref={navRef} className="fixed top-0 left-0 isolate z-30 h-dvh w-full lg:h-[412px]">
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
              opacity: 1,
              scaleX: 1,
              transition: { duration: duration.short, delay: duration.short, ease: easing.in },
            }}
            exit={{ opacity: 0, scaleX: 0, transition: { duration: 0.1, type: 'linear' } }}
            className="bg-background/20 absolute bottom-0 left-0 z-10 hidden h-px w-full origin-left lg:block"
          />
          <motion.div
            key="overlay"
            {...mountAnim(menuOverlayVariant)}
            className="bg-foreground text-background relative flex h-full w-full flex-col justify-between gap-6 overflow-clip px-4 pt-28 pb-4 sm:justify-normal sm:px-6 sm:pb-6 lg:flex-row"
            style={{ perspective: '120px', perspectiveOrigin: 'center' }}
          >
            {isDesktop && (
              <MImage
                key="menu-image"
                src={BlackOne}
                alt="Image Black One by Josh Nuttall"
                width={640}
                height={400}
                {...(!isReduceMotion ? mountAnim(menuImageVariant) : {})}
                className="relative z-10 aspect-video h-auto w-auto rounded-xs object-cover sm:h-full"
              />
            )}

            <ul
              key="menu-list"
              className="relative z-10 flex w-full flex-col gap-4 sm:justify-between"
            >
              {links.map((link, idx) => (
                <li key={link.id} style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}>
                  <motion.div custom={idx} {...mountAnim(menuLinkVariant)}>
                    <TLink
                      href={link.href}
                      className="text-background font-helvetica block text-5xl font-semibold uppercase"
                    >
                      {link.name}
                    </TLink>
                  </motion.div>
                </li>
              ))}
            </ul>

            <div
              key="menu-social"
              className="flex w-full flex-col gap-4 sm:h-full sm:flex-row sm:gap-0 lg:gap-6"
            >
              <motion.div
                {...mountAnim(menuDividerVariant)}
                className="h-0 w-full border-b border-dashed sm:h-full sm:w-0 sm:border-r sm:border-b-0"
              />

              <ul className="flex flex-wrap gap-x-4 gap-y-0 self-end sm:gap-x-6 lg:ml-auto">
                {socials.map((social) => (
                  <Li key={social.id}>
                    <GAnchor
                      href={social.href}
                      target="_blank"
                      className="uppercase sm:text-lg md:text-lg"
                    >
                      {social.name}
                    </GAnchor>
                  </Li>
                ))}
              </ul>
            </div>
          </motion.div>
        </nav>
      )}
    </AnimatePresence>
  )
}
