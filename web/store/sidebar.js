import { create } from "zustand"

export const useSidebarStore = create((set) => ({
  reloadTrigger: 0,
  reloadSidebar: () => set((state) => ({ reloadTrigger: state.reloadTrigger + 1 })),
}))