import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConnectivityContextType {
  isOnline: boolean;
  offlineReady: boolean;
  pendingSyncCount: number;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: navigator.onLine,
  offlineReady: true,
  pendingSyncCount: 0,
});

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineReady] = useState(true);
  const [pendingSyncCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, offlineReady, pendingSyncCount }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
