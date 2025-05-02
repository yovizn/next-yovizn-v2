import { Variants } from '@/types/motion.type'
import { duration, easing } from '../animation.constant'

export const pageTransitionVariant: Variants = {
  initial: { backdropFilter: 'blur(0px)' },
  enter: { backdropFilter: 'blur(10px)', transition: { duration: 1, ease: easing.out } },
  exit: { backdropFilter: 'blur(0px)', transition: { duration: 0.75, ease: easing.in } },
}

export const pageTransitionOverlayVariant: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: duration.medium, delay: duration.medium, ease: easing.inOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.short, ease: easing.inOut, type: 'linear' },
  },
}
