import local from 'next/font/local'

// Nohemi is the display face and is ONLY ever used at Bold (every `font-nohemi`
// usage in the app sets `font-bold`). The other five weights (ExtraLight→SemiBold)
// + the never-declared Thin were shipped but unused, so they're trimmed to a
// single Bold face. Add a weight back here (and its .woff2) if a lighter Nohemi
// is ever needed.
export const nohemi = local({
  src: './Nohemi-Bold.woff2',
  weight: '700',
  variable: '--font-nohemi',
  display: 'swap',
  style: 'normal',
})
