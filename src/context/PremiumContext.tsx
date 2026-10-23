import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  searchCount: number;
  creditsRemaining: number;
  creditsExhausted: boolean;
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

  const [searchCount, setSearchCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lazySearchCount');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('lazyIsPremium', String(isPremium));
    } catch {
      // storage unavailable
    }
  }, [isPremium]);

  useEffect(() => {
    try {
      localStorage.setItem('lazySearchCount', String(searchCount));
    } catch {
      // ignore
    }
  }, [searchCount]);

  const togglePremium = useCallback(() => {
    setIsPremium((prev) => !prev);
  }, []);

  const openUpgrade = useCallback(() => {
    setUpgradeOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
  }, []);

  const creditsRemaining = isPremium ? 9999 : Math.max(0, 3 - searchCount);
  const creditsExhausted = !isPremium && searchCount >= 3;

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
        creditsRemaining,
        creditsExhausted,
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
