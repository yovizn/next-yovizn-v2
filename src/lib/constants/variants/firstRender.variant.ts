import { Variants } from '@/types/motion.type'
import { duration, easing } from '../animation.constant'

const initial = { pathLength: 0, fillOpacity: 0, x: 0, y: 0 }
const animate = { fillOpacity: 1, pathLength: 1, x: 0, y: 0 }

export const firstRenderVariant: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  enter: { opacity: 1, filter: 'blur(0px)' },
  exit: {
    opacity: 0,
    filter: 'blur(10px)',
    transition: { duration: duration.long, delay: duration.short, ease: easing.out },
  },
}

export const polygonVariant: Variants = {
  initial,
  enter: {
    ...animate,
    transition: {
      pathLength: { duration: 1.25, ease: easing.out },
      fillOpacity: { duration: 2, delay: 1.25, ease: easing.in },
    },
  },
  exit: {
    fillOpacity: 1,
    pathLength: 1,
    x: 50,
    y: -100,
    transition: {
      pathLength: { duration: 1, ease: easing.out },
      fillOpacity: { duration: 2, delay: 1.25, ease: easing.in },
      default: { duration: 1, ease: easing.out },
    },
  },
}

export const rectVariant: Variants = {
  initial: {
    ...initial,
    y: '0%',
  },
  enter: {
    ...animate,
    transition: {
      pathLength: { duration: 1, ease: easing.out },
      fillOpacity: { duration: 2, delay: 1.25, ease: easing.in },
      default: { duration: 1, ease: easing.out },
    },
  },
  exit: {
    fillOpacity: 1,
    pathLength: 1,
    y: '-50%',
    transition: {
      pathLength: { duration: 1, ease: easing.out },
      fillOpacity: { duration: 2, delay: 1.25, ease: easing.in },
      default: { duration: 1, ease: easing.out },
    },
  },
}
