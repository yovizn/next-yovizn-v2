'use client'

import { duration, easing } from '@/lib/constants/animation.constant'
import { cn } from '@/lib/utils/cn'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

export function Li({ children, className }: { children: React.ReactNode; className?: string }) {
  const [isShow, setIsShow] = useState(false)

  return (
    <li
      className={cn(
        'outline-foreground relative size-fit overflow-hidden rounded-xs outline-offset-4 select-none focus-within:outline-2',
        className,
      )}
      onMouseEnter={() => setIsShow(true)}
      onMouseLeave={() => setIsShow(false)}
    >
      {children}
      <AnimatePresence mode="wait">
        {isShow && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: duration.medium, ease: easing.inOut }}
            className="bg-foreground absolute bottom-0 left-0 h-px w-full"
          />
        )}
      </AnimatePresence>
    </li>
  )
}
