'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils/cn'
import { SlidingNumber } from './slidingNumber'

// Jakarta (GMT+7) wall-clock parts, timezone-correct regardless of the viewer's
// locale. `new Date()` with no args is fine in app code (unlike workflow scripts).
function getJakartaTime() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { h: get('hour'), m: get('minute'), s: get('second') }
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Live GMT+7 clock rendered with the SlidingNumber odometer (spring-rolled
 * digits). Hydration-safe: server and first client paint both show a static
 * placeholder, then the ticking readout mounts. aria-hidden with an sr-only
 * label so screen readers get a stable description, not a per-second update.
 */
export function LocalTime({ className }: { className?: string }) {
  // null until the client ticks — keeps server and first client paint identical
  // (the placeholder), avoiding a hydration mismatch. State is only ever set from
  // callbacks (setTimeout/setInterval), never synchronously inside the effect.
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null)
  // Reduced-motion users still get the live-ticking number, but as static text —
  // the SlidingNumber odometer is a JS spring (motion value), which the global
  // CSS reduced-motion kill-switch cannot reach.
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const update = () => setTime(getJakartaTime())
    const initial = setTimeout(update, 0)
    const id = setInterval(update, 1000)
    return () => {
      clearTimeout(initial)
      clearInterval(id)
    }
  }, [])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-data text-paper-dim text-[11px] tracking-[0.12em] uppercase">
        Jakarta&nbsp;·&nbsp;GMT+7
      </span>
      <span className="sr-only">Local time in Jakarta, GMT+7</span>
      {time ? (
        prefersReduced ? (
          <span aria-hidden className="font-data text-paper tabular-nums">
            {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
          </span>
        ) : (
          <span aria-hidden className="font-data text-paper flex items-center tabular-nums">
            <SlidingNumber value={time.h} padStart />
            <span className="px-0.5">:</span>
            <SlidingNumber value={time.m} padStart />
            <span className="px-0.5">:</span>
            <SlidingNumber value={time.s} padStart />
          </span>
        )
      ) : (
        <span aria-hidden className="font-data text-paper tabular-nums">
          --:--:--
        </span>
      )}
    </div>
  )
}
