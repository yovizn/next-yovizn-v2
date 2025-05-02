import { tryCatch } from '@/lib/utils/tryCatch'
import { checkFirstRender } from '@/services/checkFirstRender.service'
import { useEffect } from 'react'
import { usePageTransition } from './stores/usePage.hook'

export function useFirstRender(
  isFirstRender: boolean,
  setIsTransitionDone: (isTransitionDone: boolean) => void,
) {
  const { setPageTransition } = usePageTransition()

  useEffect(() => {
    if (isFirstRender) {
      setPageTransition({ isTransitionComplete: true })
      return
    }

    const handleFirstRender = async () => {
      const [, error] = await tryCatch(checkFirstRender())
      setIsTransitionDone(true)
      if (error) return
    }

    const timeout = setTimeout(handleFirstRender, 3000)

    return () => clearTimeout(timeout)
  }, [isFirstRender])
}
