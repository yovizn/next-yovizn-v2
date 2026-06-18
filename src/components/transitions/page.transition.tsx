'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { duration, easing, mountAnim } from '@/lib/constants/animation.constant'
import {
  pageTransitionOverlayVariant,
  pageTransitionVariant,
} from '@/lib/constants/variants/pageTransition.variant'
import { Logo } from '../common/icon'

export function PageTransition() {
  const { page, setPageTransition } = usePageTransition()
  const pathname = usePathname()
  const isReduceMotion = useReducedMotion()

  const currentPath = pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'home'

  useScrollControl(page.isTransitionComplete)

  // Reduced motion: never play the choreography. As soon as a transition is
  // requested, resolve it immediately (no overlay, no dead time).
  useEffect(() => {
    if (isReduceMotion && page.isTransition) {
      setPageTransition({
        isTransition: false,
        isTransitionComplete: true,
        phase: 'idle',
        targetPath: null,
      })
    }
  }, [isReduceMotion, page.isTransition, setPageTransition])

  // REAL navigation-arrival signal: once we are fully covered AND the router has
  // committed to the target path (new segment rendered), begin uncovering.
  useEffect(() => {
    if (page.phase === 'covered' && page.targetPath && pathname === page.targetPath) {
      setPageTransition({ phase: 'uncovering' })
    }
  }, [page.phase, page.targetPath, pathname, setPageTransition])

  if (isReduceMotion) return null

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() =>
        setPageTransition({
          isTransition: false,
          isTransitionComplete: true,
          phase: 'idle',
          targetPath: null,
        })
      }
    >
      {/* Overlay stays mounted through covering + covered, and only EXITS when
          phase is uncovering. Removing the node triggers AnimatePresence exit. */}
      {page.isTransition && page.phase !== 'uncovering' && (
        <div className="fixed top-0 left-0 z-[999] h-dvh w-full">
          <motion.div
            {...mountAnim(pageTransitionVariant)}
            className="absolute top-0 left-0 size-full"
          >
            <motion.div
              {...mountAnim(pageTransitionOverlayVariant)}
              onAnimationComplete={() => {
                // Fully covered: hand off to the pathname-arrival effect above.
                if (page.phase === 'covering') setPageTransition({ phase: 'covered' })
              }}
              className="bg-secondary absolute top-0 left-0 size-full"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: duration.medium,
                  delay: duration.medium,
                  ease: easing.inOut,
                },
              }}
              exit={{ opacity: 0, transition: { duration: duration.short, ease: easing.inOut } }}
              className="relative flex size-full flex-col items-center justify-center"
            >
              <AnimatePresence mode="wait" propagate initial={false}>
                <motion.p
                  key={currentPath}
                  initial={{ y: '50%', opacity: 0 }}
                  animate={{
                    y: '20%',
                    opacity: 1,
                    transition: {
                      duration: duration.medium,
                      delay: duration.short,
                      ease: easing.out,
                    },
                  }}
                  exit={{
                    y: '-50%',
                    opacity: 0,
                    transition: { duration: duration.short, ease: easing.in },
                  }}
                  className="text-foreground font-helvetica absolute right-6 bottom-6  font-bold uppercase clamp-[text,xl,5xl]"
                >
                  {currentPath}
                </motion.p>
              </AnimatePresence>

              <Logo className="text-foreground size-40 translate-x-[10%] md:size-60" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
