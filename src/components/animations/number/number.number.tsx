'use client'

import { motion, MotionValue, useTransform } from 'motion/react'
import { useId } from 'react'
import useMeasure from 'react-use-measure'

import { TRANSITION } from '@/lib/constants/animation.constant'

export function Number({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const uniqueId = useId()
  const [ref, bounds] = useMeasure()

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * bounds.height

    if (offset > 5) {
      memo -= 10 * bounds.height
    }

    return memo
  })

  // don't render the animated number until we know the height
  if (!bounds.height) {
    return (
      <span ref={ref} className="invisible absolute">
        {number}
      </span>
    )
  }

  return (
    <motion.span
      style={{ y }}
      layoutId={`${uniqueId}-${number}`}
      className="absolute inset-0 flex items-center justify-center"
      transition={TRANSITION}
      ref={ref}
    >
      {number}
    </motion.span>
  )
}
