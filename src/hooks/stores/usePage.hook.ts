import { useGlobalStore } from '@/providers/global-store.provider'
import { useShallow } from 'zustand/shallow'

export function usePageTransition() {
  return useGlobalStore(
    useShallow((state) => ({
      page: state.page,
      setPageTransition: state.setPageTransition,
    })),
  )
}
