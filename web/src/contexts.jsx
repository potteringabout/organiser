import { createContext, useState, useContext } from "react";
import FloatingAlert from "@/components/ui/alert";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {

  const [darkMode, setDarkMode] = useState(false);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  return useContext(DarkModeContext);
}