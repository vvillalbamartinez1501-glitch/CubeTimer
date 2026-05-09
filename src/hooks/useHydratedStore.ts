import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Custom hook to handle hydration state for Zustand's persisted store.
 * Prevents React hydration errors (#418) by ensuring both the client
 * has mounted and the store has finished loading from local storage.
 * 
 * @returns boolean indicating if the store is fully hydrated and ready to be used.
 */
export const useHydratedStore = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if store is already hydrated on mount
    const checkHydration = () => {
      if (useAppStore.persist.hasHydrated()) {
        setIsHydrated(true);
      } else {
        // If not hydrated yet, subscribe to hydration events
        const unsub = useAppStore.persist.onHydrate(() => {
          // This runs when hydration starts
        });
        
        const unsubFinish = useAppStore.persist.onFinishHydration(() => {
          setIsHydrated(true);
          unsub();
          unsubFinish();
        });
      }
    };

    checkHydration();
    
    // We also set isHydrated to true after initial mount to avoid 
    // basic React hydration mismatch, but we prioritize Zustand's state.
    // In some cases, hasHydrated() might already be true.
    const timer = setTimeout(() => {
      if (useAppStore.persist.hasHydrated()) {
        setIsHydrated(true);
      }
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
};
