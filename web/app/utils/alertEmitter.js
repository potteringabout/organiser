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