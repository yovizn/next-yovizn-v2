'use client'

import { AnimatePresence, motion } from 'motion/react'

import HoverText from '@/components/animations/text/hover.text'
import { GAnchor } from '@/components/common/googleAnchor'
import { socials } from '@/lib/constants/social.constant'
import { duration, easing } from '@/lib/constants/animation.constant'
import { useMenu } from '@/hooks/stores/useMenu.hook'

const headerSocialMedia = socials.filter(
  (social) => social.id === 'linkedin' || social.id === 'email',
)

export function SocialHeader() {
  const { menu } = useMenu()

  return (
    <AnimatePresence mode="wait">
      {!menu.isOpen && (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: duration.short, delay: duration.short, ease: easing.out },
          }}
          exit={{ opacity: 0, transition: { duration: duration.short, ease: easing.in } }}
          className="hidden w-fit items-center gap-5 sm:flex"
        >
          {headerSocialMedia.map((social) => (
            <li key={social.id}>
              <GAnchor
                href={social.href}
                target="_blank"
                className="group text-paper font-data block text-[11px] tracking-[0.12em] uppercase"
              >
                <HoverText>{social.name === 'Email' ? 'Contact' : social.name}</HoverText>
              </GAnchor>
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  )
}
