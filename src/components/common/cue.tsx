import { cn } from '@/lib/utils/cn'

/**
 * Cue — the shared mono "instrument" kicker (e.g. "CUE 01 · INDEX").
 *
 * One source for the eyebrow spec that was copy-pasted across ~15 views with
 * drifting tracking/padding. Standardizes on font-data 11px / 0.12em tracking /
 * uppercase / paper-dim. Callers keep their own margin/padding and any per-site
 * overrides (e.g. leading-none, tabular-nums) via className, and pass
 * `aria-hidden` where the cue is decorative alongside an sr-only heading.
 */
type CueProps = React.ComponentPropsWithoutRef<'p'>

export function Cue({ children, className, ...props }: CueProps) {
  return (
    <p
      className={cn('font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase', className)}
      {...props}
    >
      {children}
    </p>
  )
}
