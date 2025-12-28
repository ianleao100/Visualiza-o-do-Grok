
import { useState, useEffect } from 'react';

export const useOrderTimer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Sincroniza com o segundo atual para precisão, depois atualiza a cada segundo
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getElapsedTimeInMinutes = (timestamp: Date) => {
    const diff = currentTime.getTime() - new Date(timestamp).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  return { currentTime, getElapsedTimeInMinutes };
};
