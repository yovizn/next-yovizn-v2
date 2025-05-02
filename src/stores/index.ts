import { createStore, StateCreator } from 'zustand'
import { createPageSlice, initialPageState, PageSlice } from './slices/page.slice'
import { createCursorSlice, CursorSlice, initialCursorState } from './slices/cursor.slice'
import { createMenuSlice, initialMenuState, MenuSlice } from './slices/menu.slice'

export type GlobalStores = PageSlice & CursorSlice & MenuSlice

export type CreateSlice<T> = StateCreator<GlobalStores, [], [], T>

export const createGlobalStore = (
  initialState = { ...initialCursorState, ...initialPageState, ...initialMenuState },
) =>
  createStore<GlobalStores>((...a) => ({
    ...initialState,
    ...createPageSlice(...a),
    ...createCursorSlice(...a),
    ...createMenuSlice(...a),
  }))
