'use client'

import { motion, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

import { useCursor } from '@/hooks/stores/useCursor.hook'
import { usePageTransition } from '@/hooks/stores/usePage.hook'
import { easing } from '@/lib/constants/animation.constant'
import { lerp } from '@/lib/utils/math'

export function Cursor() {
  const rafId = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })
  const position = useRef({ x: 0, y: 0 })
  const smoothCursor = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  }
  const { page } = usePageTransition()
  const { cursor } = useCursor()

  const render = useCallback(() => {
    const { current: pos } = position
    const { current: m } = mouse

    pos.x = lerp(pos.x, m.x, 0.075)
    pos.y = lerp(pos.y, m.y, 0.075)

    smoothCursor.x.set(pos.x - cursor.size.width / 2)
    smoothCursor.y.set(pos.y - cursor.size.height / 2)

    rafId.current = requestAnimationFrame(render)
  }, [cursor.size.height, cursor.size.width, smoothCursor.x, smoothCursor.y])

  useEffect(() => {
    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
      mouse.current = { x: clientX, y: clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    rafId.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [render])

  const cursorVisible =
    cursor.isVisible && !page.isTransition && smoothCursor.x.get() > 0 && smoothCursor.y.get() > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: page.isTransitionComplete ? 1 : 0 }}
      className="pointer-events-none fixed top-0 left-0 z-50 h-screen w-full"
    >
      <motion.div style={{ x: smoothCursor.x, y: smoothCursor.y }} className="size-fit">
        <motion.div
          animate={{
            scale: cursorVisible ? 1 : 0,
            opacity: cursorVisible ? 1 : 0,
            transition: { duration: 1, ease: easing.out },
          }}
          className="bg-foreground flex origin-center items-center justify-center rounded-full opacity-0"
          style={{
            width: cursor?.size.width || 0,
            height: cursor?.size.height || 0,
          }}
        >
          {cursor?.children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
