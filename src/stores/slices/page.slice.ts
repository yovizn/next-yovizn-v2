import { CreateSlice } from '..'

export interface PageSlice {
  page: { isTransition: boolean; isTransitionComplete: boolean }
  setPageTransition: (page: Partial<PageSlice['page']>) => void
}

export const initialPageState: PageSlice['page'] = {
  isTransition: false,
  isTransitionComplete: false,
}

export const createPageSlice: CreateSlice<PageSlice> = (set) => ({
  page: initialPageState,
  setPageTransition: (page) => set((state) => ({ page: { ...state.page, ...page } })),
})
