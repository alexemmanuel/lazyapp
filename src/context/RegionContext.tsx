import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectDefaultCountry, getCountryInfo, COUNTRY_SET } from '../data/constants';
import { CountryInfo } from '../types';

interface RegionContextType {
  region: string;
  detectedCountry: string;
  detectedCity: string | null;
  countryInfo: CountryInfo;
  setRegion: (countryCode: string) => void;
  isOnline: boolean;
  pushNotification: string | null;
  clearNotification: () => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [detectedCountry, setDetectedCountry] = useState<string>(() => {
    try {
      return localStorage.getItem('lazyDetectedCountry') || detectDefaultCountry();
    } catch {
      return detectDefaultCountry();
    }
  });

  const [detectedCity, setDetectedCity] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lazyDetectedCity');
    } catch {
      return null;
    }
  });

  const [region, setRegionState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('lazyRegion');
      if (saved && (COUNTRY_SET.has(saved) || saved === 'GLOBAL')) return saved;
      return localStorage.getItem('lazyDetectedCountry') || detectDefaultCountry();
    } catch {
      return detectDefaultCountry();
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);

  const pushNotification = notifications.at(-1)?.message ?? null;

  const clearNotification = useCallback(() => {
    setNotifications([]);
  }, []);

  const setRegion = useCallback((code: string) => {
    setRegionState(code);
    try {
      localStorage.setItem('lazyRegion', code);
    } catch {
      // storage unavailable
    }
    window.dispatchEvent(
      new CustomEvent('lazy:region-changed', {
        detail: { country: code },
      })
    );
  }, []);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handlePush = (e: Event) => {
      const custom = e as CustomEvent<{ message?: string }>;
      const msg = custom.detail?.message;
      if (!msg) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setNotifications((prev) => [...prev, { id, message: msg }]);
      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }, 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('lazy:push-notification', handlePush);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('lazy:push-notification', handlePush);
    };
  }, []);

  // Auto IP lookup
  useEffect(() => {
    let canceled = false;

    const lookup = () => {
      if (!navigator.onLine) return;
      fetch('https://ipapi.co/json/')
        .then((res) => {
          if (!res.ok) throw new Error('Failed');
          return res.json();
        })
        .then((data) => {
          const code = data.country_code?.toUpperCase();
          if (canceled || !code || !COUNTRY_SET.has(code)) return;

          localStorage.setItem('lazyDetectedCountry', code);
          setDetectedCountry(code);

          if (data.city?.trim()) {
            localStorage.setItem('lazyDetectedCity', data.city.trim());
            setDetectedCity(data.city.trim());
          }

          const currentSaved = localStorage.getItem('lazyRegion');
          if (!currentSaved) {
            localStorage.setItem('lazyRegion', code);
            setRegionState(code);
            window.dispatchEvent(
              new CustomEvent('lazy:region-changed', {
                detail: { country: code, detectedCountry: code, city: data.city?.trim() },
              })
            );
          }
        })
        .catch(() => {
          // ignore network error
        });
    };

    lookup();
    window.addEventListener('online', lookup);
    return () => {
      canceled = true;
      window.removeEventListener('online', lookup);
    };
  }, []);

  const countryInfo = getCountryInfo(region);

  return (
    <RegionContext.Provider
      value={{
        region,
        detectedCountry,
        detectedCity,
        countryInfo,
        setRegion,
        isOnline,
        pushNotification,
        clearNotification,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used inside RegionProvider');
  }
  return context;
}
