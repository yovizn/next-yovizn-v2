import { Variants } from '@/types/motion.type'
import { clipPath, duration, easing } from '../animation.constant'

export const menuImageVariant: Variants = {
  initial: { opacity: 0, transform: 'translate3d(0px, 100px, 0px)' },
  enter: {
    opacity: 1,
    transform: 'translate3d(0px, 0px, 0px)',
    transition: { duration: duration.long, ease: easing.in },
  },
  exit: {
    opacity: 0,
    transform: 'translate3d(0px, -100px, 0px)',
    transition: { duration: duration.short, ease: easing.out },
  },
}

export const menuOverlayVariant: Variants = {
  initial: { clipPath: clipPath.close },
  enter: {
    clipPath: clipPath.open,
    transition: { duration: duration.long, ease: easing.in },
  },
  exit: {
    clipPath: clipPath.close,
    transition: { duration: duration.medium, ease: easing.out },
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
      default: { duration: duration.long, delay: index * 0.05, ease: easing.in },
      opacity: { duration: duration.long },
    },
  }),
  exit: {
    opacity: 0,
    transform: 'translate3d(0px, -140px, 0px)',
    transition: {
      type: 'linear',
      duration: duration.medium,
      ease: easing.out,
    },
  },
}

export const menuDividerVariant: Variants = {
  initial: { clipPath: clipPath.close, opacity: 0 },
  enter: {
    clipPath: clipPath.open,
    opacity: 1,
    transition: { duration: duration.long, ease: easing.inOut, delay: duration.short * 0.5 },
  },
  exit: {
    clipPath: clipPath.close,
    opacity: 1,
    transition: { duration: duration.short, ease: easing.out },
  },
}
