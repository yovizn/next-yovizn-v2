'use client'

import { useStore } from 'zustand'
import { createContext, use, useRef } from 'react'

import { createGlobalStore, GlobalStores } from '@/stores'

export type GlobalStoresApi = ReturnType<typeof createGlobalStore>

export const GlobalContext = createContext<GlobalStoresApi | null>(null)

export default function GlobalStoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<GlobalStoresApi>(null)

  if (!storeRef.current) {
    storeRef.current = createGlobalStore()
  }

  return <GlobalContext.Provider value={storeRef.current}>{children}</GlobalContext.Provider>
}

export function useGlobalStore<T>(selector: (state: GlobalStores) => T) {
  const globalStoreContext = use(GlobalContext)
  if (!globalStoreContext) throw new Error(`useGlobalStore must be used within GlobalStoreProvider`)
  return useStore(globalStoreContext, selector)
}
