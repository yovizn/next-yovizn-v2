'use client'

import { AnimatePresence, motion } from 'motion/react'

import { GAnchor } from '@/components/common/googleAnchor'
import { socials } from '@/lib/constants/social.constant'
import { duration, easing } from '@/lib/constants/animation.constant'
import { Li } from '@/components/animations/li.animation'
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
            transition: { duration: duration.short, delay: duration.short, ease: easing.in },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.1, type: 'linear' },
          }}
          className="hidden w-fit items-center gap-4 sm:flex"
        >
          {headerSocialMedia.map((social) => (
            <Li key={social.id}>
              <GAnchor
                href={social.href}
                target="_blank"
                className="outline-foreground block font-light uppercase outline focus-within:outline"
              >
                {social.name === 'Email' ? 'Contact' : social.name}
              </GAnchor>
            </Li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  )
}
