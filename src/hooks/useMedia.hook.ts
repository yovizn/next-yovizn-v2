import { useEffect, useState } from 'react'

export const useMatchMedia = (
  breakPoint: number | undefined = 640,
  query: 'min' | 'max' = 'max',
) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(${query}-width: ${breakPoint}px)`)

    setMatches(mediaQuery.matches)

    const handleChange = () => setMatches(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [breakPoint, query])

  return matches
}

/**
 * Subscribes to an arbitrary CSS media query string.
 * SSR-safe: returns `false` until mounted (matches static HTML), then
 * resolves to the real match after hydration. Re-renders on change.
 * @example const isFinePointer = useMediaQuery('(pointer: fine)')
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    setMatches(mediaQuery.matches)

    const handleChange = () => setMatches(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
