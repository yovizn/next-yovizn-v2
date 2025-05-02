export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
