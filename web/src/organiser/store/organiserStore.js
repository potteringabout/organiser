import { create } from "zustand";

const useOrganiserStore = create((set, get) => ({
  // UI Preferences
  developerMode: true,
  darkMode: localStorage.getItem("darkMode") === "true",
  setDarkMode: (value) => {
    localStorage.setItem("darkMode", value);
    set({ darkMode: value });
  },

  menu: "Boards",
  setMenu: (menu) => set(() => ({ menu: menu })),
}));

export default useOrganiserStore;


