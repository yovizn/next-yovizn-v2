'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { GAnchor } from '@/components/common/googleAnchor'
import { socials } from '@/lib/constants/social.constant'
import { duration, easing } from '@/lib/constants/animation.constant'
import { Li } from '@/components/animations/li.animation'

const headerSocialMedia = socials.filter(
  (social) => social.id === 'linkedin' || social.id === 'email',
)

export function SocialHeader() {
  return (
    <ul className="hidden w-fit items-center gap-4 sm:flex">
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
    </ul>
  )
}
