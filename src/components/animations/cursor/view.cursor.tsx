'use client'

import { TLink } from '@/components/common/transitionLink'
import { useCursor } from '@/hooks/stores/useCursor.hook'
import { cn } from '@/lib/utils/cn'

type ViewCursorProps = {
  children: React.ReactNode
  className?: string
  href: string
}

export function ViewCursor({
  as,
  children,
  className,
}: Omit<ViewCursorProps, 'href'> & { as?: 'div' | 'ul' }) {
  const { setCursor } = useCursor()

  const Slot = as || 'div'

  return (
    <Slot className={className} onMouseLeave={() => setCursor({ isVisible: false })}>
      {children}
    </Slot>
  )
}

export function ViewCursorTrigger({ href, className, children }: ViewCursorProps) {
  const { setCursor } = useCursor()

  return (
    <TLink
      className={cn('', className)}
      href={href}
      onMouseOver={() => setCursor({ isVisible: true })}
    >
      {children}
    </TLink>
  )
}
