'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { useScrollControl } from '@/hooks/useScrollControl.hook'
import { duration, easing, mountAnim } from '@/lib/constants/animation.constant'
import { normalizePath } from '@/lib/utils/normalizePath'
import {
  pageTransitionOverlayVariant,
  pageTransitionVariant,
} from '@/lib/constants/variants/pageTransition.variant'
import { Logo } from '../common/icon'

export function PageTransition() {
  const { page, setPageTransition } = usePageTransition()
  const pathname = usePathname()
  const router = useRouter()
  const isReduceMotion = useReducedMotion()

  // Label the cover with the DESTINATION (targetPath is set once at transition
  // start), not the live pathname. Deriving from pathname made the label's key
  // swap mid-cover when the deferred push committed — and a nested
  // <AnimatePresence propagate mode="wait"> key-swap racing the outer overlay's
  // exit deadlocks AnimatePresence in production: onExitComplete never fires,
  // isTransitionComplete stays false, and scroll stays locked until a refresh.
  const targetLabel =
    (page.targetPath ?? pathname).split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'home'

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

  // Deferred navigation: the cover is fully down (phase 'covered') but the route
  // has NOT committed yet (pathname is still the old one). Push NOW — the content
  // swap then happens hidden behind the opaque overlay, never in the transparent
  // cover-in window. This is the other half of TLink's preventDefault. Once the
  // push commits, pathname === targetPath and the arrival effect below uncovers.
  useEffect(() => {
    if (
      page.phase === 'covered' &&
      page.targetPath &&
      normalizePath(pathname) !== normalizePath(page.targetPath)
    ) {
      router.push(page.targetPath)
    }
  }, [page.phase, page.targetPath, pathname, router])

  // REAL navigation-arrival signal: once we are fully covered AND the router has
  // committed to the target path (new segment rendered), begin uncovering.
  useEffect(() => {
    if (page.phase === 'covered' && page.targetPath && normalizePath(pathname) === normalizePath(page.targetPath)) {
      setPageTransition({ phase: 'uncovering' })
    }
  }, [page.phase, page.targetPath, pathname, setPageTransition])

  // Recovery — a transition must never get stuck covering/covered (the overlay
  // would stay up and scroll would stay locked via useScrollControl):
  //
  // 1) Event-driven (primary). Browser Back/Forward during a cover changes the
  //    route WITHOUT firing TLink.onNavigate, so the arrival effect's pathname
  //    can never reach targetPath → deadlock. popstate is that exact (and, given
  //    the TLink re-click guard, only) divergence trigger — reset immediately.
  //    Race-free: forward navigations use pushState, which does NOT fire popstate.
  useEffect(() => {
    const onPopState = () =>
      setPageTransition({ isTransition: false, isTransitionComplete: true, phase: 'idle', targetPath: null })
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [setPageTransition])

  // 2) Defensive backstop. If we stay 'covered' for an unusually long time (a
  //    slow/failed commit), force-uncover. 6s is far above a normal route commit
  //    (~2s in dev here) and ANY successful commit clears this via the phase
  //    change — so it never races a real navigation (the old 2s timer did: a
  //    commit at ~2.2s would lose to it). It only catches a genuinely stuck one.
  useEffect(() => {
    if (page.phase !== 'covered') return
    const t = setTimeout(() => setPageTransition({ phase: 'uncovering' }), 6000)
    return () => clearTimeout(t)
  }, [page.phase, setPageTransition])

  // 3) Same backstop for the uncover leg. If AnimatePresence's onExitComplete
  //    ever fails to fire (an interrupted/entangled exit — the class of bug that
  //    locked scroll in production), never leave the page frozen behind an
  //    invisible overlay: force-complete. Exit choreography tops out at 0.75s,
  //    so 4s only catches a genuinely dead exit; normal completion clears this
  //    via the phase change to 'idle', and a late onExitComplete is idempotent.
  useEffect(() => {
    if (page.phase !== 'uncovering') return
    const t = setTimeout(
      () =>
        setPageTransition({
          isTransition: false,
          isTransitionComplete: true,
          phase: 'idle',
          targetPath: null,
        }),
      4000,
    )
    return () => clearTimeout(t)
  }, [page.phase, setPageTransition])

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
        <div className="fixed top-0 left-0 z-999 h-dvh w-full">
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
              className="bg-graphite absolute top-0 left-0 size-full"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: duration.medium,
                  delay: duration.medium,
                  ease: easing.outSoft,
                },
              }}
              exit={{ opacity: 0, transition: { duration: duration.short, ease: easing.outSoft } }}
              className="relative flex size-full flex-col items-center justify-center"
            >
              {/* Single label for the overlay's whole life — it mounts and exits
                  with the overlay itself, so no nested AnimatePresence is needed. */}
              <motion.p
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
                className="text-signal font-nohemi absolute right-6 bottom-6 font-bold uppercase text-display-md"
              >
                {targetLabel}
              </motion.p>

              <Logo className="text-paper size-40 translate-x-[10%] md:size-60" />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
