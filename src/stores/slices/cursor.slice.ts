import { CreateSlice } from '..'

export interface CursorSlice {
  cursor: {
    isHover: boolean
    isClick: boolean
    isVisible: boolean
    size: { width: number; height: number }
    children: React.ReactNode
  }
  setCursor: (cursor: Partial<CursorSlice['cursor']>) => void
}

export const initialCursorState: CursorSlice['cursor'] = {
  isHover: false,
  isClick: false,
  isVisible: false,
  size: { width: 100, height: 100 },
  children: null,
}

export const createCursorSlice: CreateSlice<CursorSlice> = (set) => ({
  cursor: initialCursorState,
  setCursor: (cursor) => set((state) => ({ cursor: { ...state.cursor, ...cursor } })),
})
