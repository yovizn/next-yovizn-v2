import { useGlobalStore } from '@/providers/global-store.provider'
import { useShallow } from 'zustand/shallow'

export function useMenu() {
  return useGlobalStore(
    useShallow((state) => ({
      menu: state.menu,
      setMenu: state.setMenu,
    })),
  )
}
