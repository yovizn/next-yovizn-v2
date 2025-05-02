'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useFirstRender } from '@/hooks/useFirstRender.hook'
import {
  firstRenderVariant,
  polygonVariant,
  rectVariant,
} from '@/lib/constants/variants/firstRender.variant'
import { mountAnim } from '@/lib/constants/animation.constant'

interface FirstRenderTransitionProps {
  isFirstRender: boolean
}

export function FirstRenderTransition({ isFirstRender }: FirstRenderTransitionProps) {
  const [isTransitionDone, setIsTransitionDone] = useState(isFirstRender)
  const { setPageTransition } = usePageTransition()

  useScrollControl(isTransitionDone)
  useFirstRender(isFirstRender, setIsTransitionDone)

  return (
    <AnimatePresence mode="wait">
      {!isTransitionDone && (
        <motion.div
          {...mountAnim(firstRenderVariant)}
          className="bg-secondary fixed top-0 left-0 z-100 flex h-dvh w-full items-center justify-center overflow-clip"
        >
          <svg
            id="b"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
            className="size-100 sm:size-200"
          >
            <g id="c">
              <g>
                <rect width="1000" height="1000" fill="none" opacity="0" strokeWidth="0" />
                <AnimatePresence propagate>
                  <motion.polygon
                    key="triangle"
                    points="395.46 828.6 696.03 308 94.89 308 395.46 828.6"
                    className="fill-foreground stroke-foreground stroke-3"
                    {...mountAnim(polygonVariant)}
                  />
                  <motion.rect
                    key="rect"
                    x="717.6"
                    y="162.83"
                    width="83.56"
                    height="438.15"
                    className="fill-foreground stroke-foreground -rotate-150 stroke-3"
                    {...mountAnim(rectVariant)}
                    onUpdate={(latest) => {
                      if (latest.y === '-50%') setPageTransition({ isTransitionComplete: true })
                    }}
                  />
                </AnimatePresence>
              </g>
            </g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
