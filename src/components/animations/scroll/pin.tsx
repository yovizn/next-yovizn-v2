import { cn } from '@/lib/utils/cn'

interface PinProps {
  /** Optional — most pin bars are empty (no children). */
  children?: React.ReactNode
  /** Sticky offset from top. Number = px. Default 0. */
  top?: number
  /** Stacking context. Default 20 (matches existing sticky blocks). */
  zIndex?: number
  /** Element tag. Default 'div'. */
  as?: React.ElementType
  className?: string
}

/**
 * position: sticky pin. GPU-cheap, no RAF, no JS scroll listener.
 * Formalizes the existing `sticky top-0 z-20` idiom used across the sticky blocks.
 * For reduced-motion there is nothing to disable — sticky is a layout behavior, not motion.
 */
export function Pin({ children, top = 0, zIndex = 20, as: Tag = 'div', className }: PinProps) {
  return (
    <Tag
      className={cn('sticky', className)}
      style={{ top, zIndex }}
    >
      {children}
    </Tag>
  )
}
