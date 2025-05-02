import { useGlobalStore } from '@/providers/global-store.provider'
import { useShallow } from 'zustand/shallow'

export function useCursor() {
  return useGlobalStore(
    useShallow((state) => ({
      cursor: state.cursor,
      setCursor: state.setCursor,
    })),
  )
}
