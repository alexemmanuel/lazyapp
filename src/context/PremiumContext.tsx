import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  searchCount: number;
  upgradeOpen: boolean;
  togglePremium: () => void;
  openUpgrade: () => void;
  closeUpgrade: () => void;
  trySearch: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lazyIsPremium') === 'true';
    } catch {
      return false;
    }
  });

  const [searchCount, setSearchCount] = useState<number>(0);
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('lazyIsPremium', String(isPremium));
    } catch {
      // storage unavailable
    }
  }, [isPremium]);

  const togglePremium = useCallback(() => {
    setIsPremium((prev) => !prev);
  }, []);

  const openUpgrade = useCallback(() => {
    setUpgradeOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
  }, []);

  const trySearch = useCallback(() => {
    if (isPremium) return true;
    if (searchCount >= 3) {
      setUpgradeOpen(true);
      return false;
    }
    setSearchCount((prev) => prev + 1);
    return true;
  }, [isPremium, searchCount]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        searchCount,
        upgradeOpen,
        togglePremium,
        openUpgrade,
        closeUpgrade,
        trySearch,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used inside PremiumProvider');
  }
  return context;
}
