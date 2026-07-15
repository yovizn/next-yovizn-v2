import { Variants } from '@/types/motion.type'
import { clipPath, duration, easing } from '../animation.constant'

// Outer wrapper: no visual motion of its own now — the graphite overlay carries
// the wipe. Kept as a mounted container so the transition tree structure (and
// its AnimatePresence exit propagation) is unchanged; AnimatePresence still waits
// for the overlay's clip exit before firing onExitComplete.
export const pageTransitionVariant: Variants = {
  initial: { opacity: 1 },
  enter: { opacity: 1 },
  exit: { opacity: 1 },
}

// Graphite cover: a hard clip-path panel wipe replacing the former backdrop-blur
// + opacity fade (glassmorphism read as soft; the wipe is stark and matches the
// menu's clip-path language). Wipes DOWN from the top to full cover on enter —
// its enter completion drives the covering -> covered handoff via
// onAnimationComplete in page.transition.tsx (unchanged). On exit it continues
// downward, collapsing off the bottom edge.
export const pageTransitionOverlayVariant: Variants = {
  initial: { clipPath: clipPath.close },
  enter: {
    clipPath: clipPath.open,
    transition: { duration: duration.long, ease: easing.inOut },
  },
  exit: {
    clipPath: clipPath.closeBottom,
    transition: { duration: duration.medium, ease: easing.inOut },
  },
}
