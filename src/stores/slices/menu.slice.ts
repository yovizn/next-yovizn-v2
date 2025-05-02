import { CreateSlice } from ".."

export interface MenuSlice {
  menu: { isOpen: boolean }
  setMenu: (menu: Partial<MenuSlice['menu']>) => void
}

export const initialMenuState: MenuSlice['menu'] = {
  isOpen: false,
}

export const createMenuSlice: CreateSlice<MenuSlice> = (set) => ({
    menu: initialMenuState,
    setMenu: (menu) => set((state) => ({ menu: { ...state.menu, ...menu } })),
  })
