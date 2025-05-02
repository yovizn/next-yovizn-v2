'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { TLink } from '@/components/common/transitionLink'
import { useMenu } from '@/hooks/stores/useMenu.hook'

import { clipPath, duration, easing, mountAnim } from '@/lib/constants/animation.constant'
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
  const { menu, setMenu } = useMenu()
  const pathname = usePathname()
  const isReduceMotion = useReducedMotion()
  const isDesktop = useMatchMedia(640, 'min')

  const MImage = motion.create(Image)

  useEffect(() => {
    setMenu({ isOpen: false })
  }, [pathname])

  return (
    <AnimatePresence mode="wait" initial={!isReduceMotion}>
      {menu.isOpen && (
        <nav className="fixed top-0 left-0 z-30 h-dvh w-full sm:h-fit">
          <motion.div
            key="overlay"
            {...mountAnim(menuOverlayVariant)}
            className="bg-secondary top-0 left-0 flex h-full w-full flex-col justify-between gap-6 overflow-clip px-4 pt-28 pb-4 lg:h-[412px] lg:flex-row sm:justify-normal sm:px-6 sm:pb-6"
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
                className="relative z-10 aspect-video h-auto w-auto rounded-xs sm:h-full object-cover"
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
                      className="text-foreground font-helvetica block text-5xl font-semibold uppercase"
                    >
                      {link.name}
                    </TLink>
                  </motion.div>
                </li>
              ))}
            </ul>

            <div key="menu-social" className="flex w-full flex-col gap-4 sm:gap-0 lg:gap-6 sm:h-full sm:flex-row">
              <motion.div
                {...mountAnim(menuDividerVariant)}
                className="h-0 w-full border-b border-dashed sm:h-full sm:w-0 sm:border-r sm:border-b-0"
              />

              <ul className="flex flex-wrap gap-x-4 gap-y-0 sm:gap-x-6 self-end lg:ml-auto">
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
