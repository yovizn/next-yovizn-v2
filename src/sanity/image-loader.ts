/**
 * Custom next/image loader.
 *
 * Sanity images are served straight from Sanity's image CDN, which already does
 * width/quality/format optimization (`?w=…&q=…&auto=format`). So we let the
 * browser fetch `cdn.sanity.io` directly and SKIP Next's own server-side image
 * optimizer for them. Benefits:
 *  - No double optimization (Sanity → then Next re-encoding); leaner + cheaper.
 *  - The browser still gets a proper responsive srcset (this loader is called
 *    once per srcset width, so each candidate is a correctly-sized Sanity URL).
 *  - As a bonus it sidesteps the Next 16 optimizer's private-IP/SSRF guard, which
 *    blocks `cdn.sanity.io` on NAT64/DNS64 networks (it resolves to a `64:ff9b::`
 *    address the guard rejects) — i.e. local dev now renders Sanity images.
 *
 * Non-Sanity sources (local `/_next/static` assets, etc.) pass through untouched.
 */

interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith('https://cdn.sanity.io/')) {
    const url = new URL(src)
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality ?? 75))
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', 'max')
    return url.toString()
  }
  return src
}
