import { cn } from '@/lib/utils/cn'

/**
 * HoverText — roller-flip label. Two stacked copies of the text share a
 * one-line clip mask: on hover of an ancestor `.group`, the visible copy rolls
 * up and out while the duplicate (positioned one line below) rolls up into view.
 *
 * - Transform-only (GPU-safe); no layout properties animate.
 * - The PARENT interactive element MUST carry the `group` class.
 * - The duplicate is aria-hidden so screen readers announce the label once.
 * - Reduced motion: the global CSS kill-switch collapses the transition to
 *   ~0.01ms, so the first copy simply stays put — the label is always legible.
 */
export default function HoverText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <span className={cn('relative inline-block overflow-clip align-bottom', className)}>
      <span className="block transition-transform duration-500 ease-in-out-quart group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute top-full left-0 block transition-transform duration-500 ease-in-out-quart group-hover:-translate-y-full"
      >
        {children}
      </span>
    </span>
  )
}
