import local from 'next/font/local'

// Satoshi Variable is the body face (`--font-sans` in the globals.css @theme).
// A single variable woff2 (~42KB) covers the whole 300–900 weight range, so
// regular/medium/bold body text all render from this one file. Licensed under
// the Fontshare Free Font License — see ./LICENSE.md.
export const satoshi = local({
  src: './Satoshi-Variable.woff2',
  weight: '300 900',
  variable: '--font-satoshi',
  display: 'swap',
  style: 'normal',
})
