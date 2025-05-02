import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { useMenu } from './stores/useMenu.hook'

/**
 * A custom hook to control Lenis smooth scrolling behavior and document scroll overflow.
 *
 * @param enable - A boolean that determines whether to enable or disable Lenis scrolling.
 * @returns void
 * @example
 * ```tsx
 * useScrollControl(true) // Enables Lenis scrolling and sets document scroll overflow to 'auto'.
 * ```
 */
export function useScrollControl(enable: boolean = false) {
  const lenis = useLenis()
  const { menu } = useMenu()

  useEffect(() => {
    if (enable && !menu.isOpen) {
      lenis?.start()
      document.body.style.overflow = 'auto'
    } else {
      lenis?.stop()
      document.body.style.overflow = 'clip'
    }
  }, [enable, lenis, menu.isOpen])
}
