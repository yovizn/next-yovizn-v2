import { ReturnMountAnimType, Variants } from '@/types/motion.type'

// Named by ACTUAL curve shape (the previous names were inverted — `in` held an
// ease-out curve, etc.). Roles:
//   out     — sharp decelerating attack; entrances and scroll/text reveals
//   inOut   — symmetric; wipes, covers, roller swaps
//   outSoft — gentle decelerating; secondary/settling motion
//   in      — accelerating; exits
export const easing = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.76, 0, 0.24, 1],
  outSoft: [0.215, 0.61, 0.355, 1],
  in: [0.64, 0, 0.78, 0],
} as const

export const duration = {
  short: 0.3,
  medium: 0.5,
  long: 0.8,
} as const

export const mountAnim = (variants: Variants): ReturnMountAnimType => ({
  variants,
  initial: 'initial',
  animate: 'enter',
  exit: 'exit',
})

export const clipPath = {
  close: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
  open: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  closeBottom: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
} as const

export const TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 18,
  mass: 0.3,
} as const
