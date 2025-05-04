'use client'

import { AnimatePresence, motion } from 'motion/react'

import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { duration, easing, mountAnim } from '@/lib/constants/animation.constant'
import {
  pageTransitionOverlayVariant,
  pageTransitionVariant,
} from '@/lib/constants/variants/pageTransition.variant'
import { usePathname } from 'next/navigation'
import { Logo } from '../common/icon'

export function PageTransition() {
  const { page, setPageTransition } = usePageTransition()
  const pathname = usePathname()

  const currentPath = pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'home'

  useScrollControl(page.isTransitionComplete)

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => setPageTransition({ isTransitionComplete: true })}
    >
      {page.isTransition && (
        <div className="fixed top-0 left-0 z-[999] h-dvh w-full">
          <motion.div
            {...mountAnim(pageTransitionVariant)}
            className="absolute top-0 left-0 size-full"
          >
            <motion.div
              {...mountAnim(pageTransitionOverlayVariant)}
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
