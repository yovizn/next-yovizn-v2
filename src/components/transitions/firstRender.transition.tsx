'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'

import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { useFirstRender } from '@/hooks/useFirstRender.hook'
import {
  firstRenderVariant,
  polygonVariant,
  rectVariant,
} from '@/lib/constants/variants/firstRender.variant'
import { mountAnim } from '@/lib/constants/animation.constant'

export function FirstRenderTransition() {
  // Default `true` = skip intro (fail-safe for repeat visits). The
  // cookie is read post-hydration inside useFirstRender, which flips
  // this to `false` (play) only on a genuine first visit.
  const [isTransitionDone, setIsTransitionDone] = useState(true)
  const completedRef = useRef(false)

  useScrollControl(isTransitionDone)
  const { completeFirstRender } = useFirstRender(setIsTransitionDone)

  return (
    <AnimatePresence mode="wait">
      {!isTransitionDone && (
        <motion.div
          {...mountAnim(firstRenderVariant)}
          className="bg-graphite fixed top-0 left-0 z-100 flex h-dvh w-full items-center justify-center overflow-clip"
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
                    className="fill-paper stroke-3"
                    {...mountAnim(polygonVariant)}
                  />
                  <motion.rect
                    key="rect"
                    x="717.6"
                    y="162.83"
                    width="83.56"
                    height="438.15"
                    className="fill-paper -rotate-150 stroke-3"
                    {...mountAnim(rectVariant)}
                    onAnimationComplete={(definition) => {
                      // Drive completion from the ENTER (draw-in) finishing — NOT exit.
                      // Gating on 'exit' deadlocks: a Motion `exit` variant only plays
                      // once the element is removed from <AnimatePresence>, but the
                      // element is only removed by completeFirstRender (isTransitionDone
                      // → true), which here would only run after exit completes. Nothing
                      // ever starts the exit, so the overlay hangs on the drawn mark.
                      // Completing on 'enter' removes the overlay, which THEN plays the
                      // exit variants (mark flies up + blur) as the leave animation.
                      // One-shot guard against repeat callbacks.
                      if (definition === 'enter' && !completedRef.current) {
                        completedRef.current = true
                        completeFirstRender()
                      }
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
