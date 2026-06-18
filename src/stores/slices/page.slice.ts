import { CreateSlice } from '..'

export type TransitionPhase = 'idle' | 'covering' | 'covered' | 'uncovering'

export interface PageSlice {
  page: {
    isTransition: boolean
    isTransitionComplete: boolean
    phase: TransitionPhase
    targetPath: string | null
  }
  setPageTransition: (page: Partial<PageSlice['page']>) => void
}

export const initialPageState: PageSlice['page'] = {
  isTransition: false,
  isTransitionComplete: false,
  phase: 'idle',
  targetPath: null,
}

export const createPageSlice: CreateSlice<PageSlice> = (set) => ({
  page: initialPageState,
  setPageTransition: (page) => set((state) => ({ page: { ...state.page, ...page } })),
})
