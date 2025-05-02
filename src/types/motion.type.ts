import { Variant } from 'motion/react'

export type Variants = {
  initial: Variant
  enter: Variant
  exit?: Variant
}

export type ReturnMountAnimType = {
  variants: Variants
  initial: keyof Variants
  animate: keyof Variants
  exit: keyof Variants
}
