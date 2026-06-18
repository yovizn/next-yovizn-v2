'use client'

import LenisProvider from '@/providers/lenis.provider'
import { useMediaQuery } from '@/hooks/useMedia.hook'

/**
 * Client-side device gate for smooth-scroll chrome.
 *
 * Lenis is JS-conditionally mounted only on fine-pointer devices
 * (`(pointer: fine)` ≈ mouse/trackpad), preserving the previous
 * desktop-only behavior WITHOUT a server `headers()` read. Lenis with
 * `root` registers a global instance and renders no DOM, so a
 * post-hydration mount causes no layout shift or hydration mismatch.
 *
 * The cursor is intentionally NOT gated here — it is always rendered and
 * hidden via CSS (`@media (pointer: coarse)`), which avoids the hydration
 * mismatch a JS conditional mount would create.
 */
export default function DeviceChrome() {
  const isFinePointer = useMediaQuery('(pointer: fine)')

  if (!isFinePointer) return null

  return <LenisProvider />
}
