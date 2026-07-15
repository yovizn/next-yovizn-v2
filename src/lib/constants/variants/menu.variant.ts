import { Variants } from '@/types/motion.type'
import { clipPath, duration, easing } from '../animation.constant'

// Easing names updated to the corrected vocabulary; resolved curves unchanged so
// the menu choreography plays identically:
//   old easing.in  ([0.22,1,0.36,1]) -> easing.out     (enters — sharp attack)
//   old easing.out ([0.76,0,0.24,1]) -> easing.inOut   (exits)
//   old easing.inOut([0.215,0.61,...]) -> easing.outSoft (divider enter)
export const menuImageVariant: Variants = {
  initial: { opacity: 0, transform: 'translate3d(0px, 100px, 0px)' },
  enter: {
    opacity: 1,
    transform: 'translate3d(0px, 0px, 0px)',
    transition: { duration: duration.long, ease: easing.out },
  },
  exit: {
    opacity: 0,
    transform: 'translate3d(0px, -100px, 0px)',
    transition: { duration: duration.short, ease: easing.inOut },
  },
}

export const menuOverlayVariant: Variants = {
  initial: { clipPath: clipPath.close },
  enter: {
    clipPath: clipPath.open,
    transition: { duration: duration.long, ease: easing.out },
  },
  exit: {
    clipPath: clipPath.close,
    transition: { duration: duration.medium, ease: easing.inOut },
  },
}

export const menuLinkVariant: Variants = {
  initial: {
    opacity: 0,
    transform: 'translate3d(0px, 140px, 0px)',
  },
  enter: (index: number) => ({
    opacity: 1,
    transform: 'translate3d(0px, 0px, 0px)',
    transition: {
      default: { duration: duration.long, delay: index * 0.05, ease: easing.out },
      opacity: { duration: duration.long },
    },
  }),
  exit: {
    opacity: 0,
    transform: 'translate3d(0px, -140px, 0px)',
    transition: {
      duration: duration.medium,
      ease: easing.inOut,
    },
  },
}

export const menuDividerVariant: Variants = {
  initial: { clipPath: clipPath.close, opacity: 0 },
  enter: {
    clipPath: clipPath.open,
    opacity: 1,
    transition: { duration: duration.long, ease: easing.outSoft, delay: duration.short * 0.5 },
  },
  exit: {
    clipPath: clipPath.close,
    opacity: 1,
    transition: { duration: duration.short, ease: easing.inOut },
  },
}
