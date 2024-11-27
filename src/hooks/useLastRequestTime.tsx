//useLastRequestTime.ts
import { useState, useEffect } from 'react';
import { getLastRequestTime } from '../services/apiServices';  // Adjust the import path

export const useLastRequestTime = () => {
  const [lastRequestTime, setLastRequestTime] = useState<string | null>(null);

  useEffect(() => {
    // Fetch immediately on mount
    const fetchTime = () => {
      const time = getLastRequestTime();
      setLastRequestTime(time);
    };

    fetchTime(); // Call immediately to avoid delay

    // Set up polling
    const intervalId = setInterval(() => {
      fetchTime();
    }, 9000); // Poll every 9 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return lastRequestTime;
};
