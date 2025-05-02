import { ReturnMountAnimType, Variants } from '@/types/motion.type'

export const easing = {
  in: [0.22, 1, 0.36, 1],
  out: [0.76, 0, 0.24, 1],
  inOut: [0.215, 0.61, 0.355, 1],
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
} as const
