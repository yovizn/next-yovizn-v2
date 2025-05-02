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
