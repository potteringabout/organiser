"use client";

import { createContext, useState, useContext } from "react";
import FloatingAlert from "../components/ui/alert";

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

/*const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info', duration = 5000) => {
    setAlert({ message, type, duration });

    if (duration > 0) {
      setTimeout(() => setAlert(null), duration);
    }
  };

  const hideAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alert && <FloatingAlert {...alert} />}
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);*/