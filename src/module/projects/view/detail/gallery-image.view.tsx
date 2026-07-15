'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils/cn'
import { duration, easing } from '@/lib/constants/animation.constant'

/**
 * A single gallery frame with an in-view clip-inset + scale reveal — the only
 * gallery motion (the grid was fully static). transform/clip only; reduced
 * motion renders the frame settled with no animation.
 */
export function GalleryImage({
  src,
  alt,
  sizes,
  aspect,
  index,
}: {
  src: string
  alt: string
  sizes: string
  aspect: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const reduced = useReducedMotion()
  const revealed = inView || reduced

  return (
    <div ref={ref} className={cn('relative overflow-hidden rounded-sm', aspect)}>
      <motion.div
        initial={{ clipPath: reduced ? 'inset(0%)' : 'inset(10%)', scale: reduced ? 1 : 1.04 }}
        animate={{
          clipPath: revealed ? 'inset(0%)' : 'inset(10%)',
          scale: revealed ? 1 : 1.04,
          transition: {
            clipPath: { duration: duration.long, ease: easing.out, delay: (index % 3) * 0.08 },
            scale: { duration: duration.long * 1.1, ease: easing.out, delay: (index % 3) * 0.08 },
          },
        }}
        className="size-full"
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  )
}
