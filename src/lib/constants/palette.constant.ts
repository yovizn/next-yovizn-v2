/**
 * TRANSPORT palette — the single source of truth for the site's hex values.
 *
 * These MUST stay in lockstep with the CSS custom properties in
 * `src/styles/globals.css` (`:root` TRANSPORT block). The CSS vars drive
 * Tailwind utility classes (bg-graphite, text-signal, …); this object is for
 * the places that cannot read CSS vars — WebGL shaders and Motion color
 * interpolation, which need concrete hex strings. Change both together.
 */
export const PALETTE = {
  graphite: '#17151A',
  graphite2: '#211E25',
  paper: '#F2EDE4',
  paperDim: '#9A958C',
  signal: '#FF6A3D',
  phosphor: '#C7F7E9',
} as const

export type PaletteKey = keyof typeof PALETTE

/**
 * Parse a `#RRGGBB` hex string into normalized [0..1] RGB channels — the form
 * WebGL shader uniforms want. Used by the OGL islands to tint from PALETTE
 * instead of hardcoding channel literals.
 */
export function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
}
