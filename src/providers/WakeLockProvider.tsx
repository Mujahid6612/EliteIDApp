//providers/WakeLockProvider.tsx
import React, { ReactNode, useEffect } from 'react';
import { WakeLockManager } from '../utils/wakeLockManager';

// Define props for the WakeLockProvider
interface WakeLockProviderProps {
  children: ReactNode; // Children can be any valid React node
}

const wakeLockManager = new WakeLockManager();

const WakeLockProvider: React.FC<WakeLockProviderProps> = ({ children }) => {
  useEffect(() => {
    // Request Wake Lock on mount
    wakeLockManager.requestWakeLock();

    // Cleanup on unmount
    return () => {
      wakeLockManager.cleanup();
    };
  }, []);

  return <>{children}</>
};

export default WakeLockProvider;
