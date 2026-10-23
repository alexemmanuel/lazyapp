import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  detectDefaultCountry,
  getCountryInfo,
  COUNTRY_SET,
  getDispatchSuccessMessage,
} from '../data/constants';
import { CountryInfo } from '../types';
import { usePremium } from './PremiumContext';

interface RegionContextType {
  region: string;
  detectedCountry: string;
  detectedCity: string | null;
  countryInfo: CountryInfo;
  setRegion: (countryCode: string) => void;
  isOnline: boolean;
  pushNotification: string | null;
  clearNotification: () => void;
  savePendingInput: (key: string, value: any) => void;
  getPendingInput: (key: string, defaultValue?: any) => any;
  clearPendingInput: (key: string) => void;
  queueOfflineOrder: (order: any) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const { isPremium, openUpgrade } = usePremium();

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
      const isPrem = localStorage.getItem('lazyIsPremium') === 'true';
      const saved = localStorage.getItem('lazyRegion');
      const detected = localStorage.getItem('lazyDetectedCountry') || detectDefaultCountry();
      if (!isPrem) return detected;
      if (saved && (COUNTRY_SET.has(saved) || saved === 'GLOBAL')) return saved;
      return detected;
    } catch {
      return detectDefaultCountry();
    }
  });

  // Re-lock to detected country if premium expires or deactivated
  useEffect(() => {
    if (!isPremium && region !== detectedCountry) {
      setRegionState(detectedCountry);
      try {
        localStorage.setItem('lazyRegion', detectedCountry);
      } catch {
        // ignore
      }
    }
  }, [isPremium, detectedCountry, region]);

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);

  const pushNotification = notifications.at(-1)?.message ?? null;

  const clearNotification = useCallback(() => {
    setNotifications([]);
  }, []);

  const setRegion = useCallback(
    (code: string) => {
      // Disable region toggle while offline to prevent data corruption
      if (!isOnline) {
        setNotifications((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            message: 'Cannot change region while offline. Reconnect to switch countries.',
          },
        ]);
        return;
      }

      // Check premium entitlement for switching away from detected country
      if (!isPremium && code !== detectedCountry) {
        const detectedName = getCountryInfo(detectedCountry).name;
        const msg = `🔒 Free access is limited to your detected country (${detectedName}). Upgrade to Core to search worldwide.`;
        setNotifications((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            message: msg,
          },
        ]);
        window.dispatchEvent(
          new CustomEvent('lazy:push-notification', {
            detail: { message: msg },
          })
        );
        openUpgrade();
        return;
      }

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
    },
    [isOnline, isPremium, detectedCountry, openUpgrade]
  );

  // Pending input cache helpers
  const savePendingInput = useCallback((key: string, value: any) => {
    try {
      const raw = localStorage.getItem('pending_input_cache') || '{}';
      const cache = JSON.parse(raw);
      cache[key] = value;
      localStorage.setItem('pending_input_cache', JSON.stringify(cache));
    } catch {
      // ignore
    }
  }, []);

  const getPendingInput = useCallback((key: string, defaultValue?: any) => {
    try {
      const raw = localStorage.getItem('pending_input_cache');
      if (raw) {
        const cache = JSON.parse(raw);
        if (cache[key] !== undefined) return cache[key];
      }
    } catch {
      // ignore
    }
    return defaultValue;
  }, []);

  const clearPendingInput = useCallback((key: string) => {
    try {
      const raw = localStorage.getItem('pending_input_cache');
      if (raw) {
        const cache = JSON.parse(raw);
        delete cache[key];
        localStorage.setItem('pending_input_cache', JSON.stringify(cache));
      }
    } catch {
      // ignore
    }
  }, []);

  const queueOfflineOrder = useCallback((order: any) => {
    try {
      const raw = localStorage.getItem('queued_orders') || '[]';
      const list = JSON.parse(raw);
      list.push(order);
      localStorage.setItem('queued_orders', JSON.stringify(list));
    } catch {
      // ignore
    }
  }, []);

  // Process queued orders when connection resumes
  const processQueuedOrders = useCallback(() => {
    try {
      const raw = localStorage.getItem('queued_orders');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((order: any, idx: number) => {
          setTimeout(() => {
            const country = order.country || region;
            const name = order.provider?.name || 'Local Artisan';
            const msg = getDispatchSuccessMessage(country, name);
            window.dispatchEvent(
              new CustomEvent('lazy:push-notification', {
                detail: { message: `⚡ Connection Restored: ${msg}` },
              })
            );
          }, idx * 1200);
        });
        localStorage.removeItem('queued_orders');
      }
    } catch {
      // ignore
    }
  }, [region]);

  // Online / offline listeners & push notification events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.dispatchEvent(
        new CustomEvent('lazy:push-notification', {
          detail: { message: '🟢 Back Online — Syncing queued requests...' },
        })
      );
      processQueuedOrders();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

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
  }, [processQueuedOrders]);

  // IP lookup with GLOBAL DEFAULT fallback
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
          // Graceful fallback to default if network blocks location API
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
        savePendingInput,
        getPendingInput,
        clearPendingInput,
        queueOfflineOrder,
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
