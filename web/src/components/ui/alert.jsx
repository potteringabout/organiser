"use client";
import { useState, useEffect } from "react";


const listeners = [];

export const showAlert = (message, type = "info", duration = 3000) => {
  listeners.forEach((listener) => listener({ message, type, duration }));
};

export const subscribeToAlerts = (listener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};


export default function FloatingAlert() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAlerts((newAlert) => {
      setAlert(newAlert);
      if (newAlert.duration > 0) {
        setTimeout(() => setAlert(null), newAlert.duration);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (!alert) return null;

  const getAlertStyles = () => {
    switch (alert.type) {
      case "error":
        return "bg-red-500 text-white";
      case "success":
        return "bg-green-500 text-white";
      case "warning":
        return "bg-yellow-500 text-black";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center">
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg transition-opacity duration-300 ease-in-out z-50">
      <div className={`p-3 rounded-md shadow-lg flex items-center justify-between ${getAlertStyles()}`}>
        <span>{alert.message}</span>
        <button onClick={() => setAlert(null)} className="ml-4 text-xl font-bold opacity-80 hover:opacity-100">
          &times;
        </button>
      </div>
    </div>
    </div>
  );
}