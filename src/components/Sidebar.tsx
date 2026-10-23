import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { usePremium } from '../context/PremiumContext';
import { useRegion } from '../context/RegionContext';
import {
  Compass,
  UtensilsCrossed,
  Wrench,
  Sparkles,
  WifiOff,
  Globe,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { getLocationBadgeText, ALL_COUNTRIES } from '../data/constants';

export const NAV_ITEMS = [
  {
    href: '/compare',
    label: 'Lazy Compare',
    description: 'Price aggregator',
    icon: Compass,
    activeColor: 'text-violet-400',
    activeBg: 'bg-violet-500/12',
    activeBorder: 'border-violet-500/25',
    activeBar: 'bg-violet-400',
    activeIcon: 'bg-violet-500/20 text-violet-300',
  },
  {
    href: '/cook',
    label: 'Lazy Cook',
    description: '3-ingredient recipes',
    icon: UtensilsCrossed,
    activeColor: 'text-emerald-400',
    activeBg: 'bg-emerald-500/12',
    activeBorder: 'border-emerald-500/25',
    activeBar: 'bg-emerald-400',
    activeIcon: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    href: '/task',
    label: 'Lazy Task',
    description: 'Quick errands',
    icon: Wrench,
    activeColor: 'text-amber-400',
    activeBg: 'bg-amber-500/12',
    activeBorder: 'border-amber-500/25',
    activeBar: 'bg-amber-400',
    activeIcon: 'bg-amber-500/20 text-amber-300',
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isPremium, openUpgrade } = usePremium();
  const { countryInfo, region, setRegion, isOnline, detectedCountry } = useRegion();

  const [mobileRegionOpen, setMobileRegionOpen] = useState(false);
  const [desktopRegionOpen, setDesktopRegionOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileRegionOpen(false);
      }
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setDesktopRegionOpen(false);
      }
    };
    if (mobileRegionOpen || desktopRegionOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [mobileRegionOpen, desktopRegionOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border bg-sidebar flex-shrink-0 flex-col py-7 transition-all duration-300 relative">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent pointer-events-none" />

        {/* Brand */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-display font-black text-xl shadow-lg shadow-violet-500/25">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-foreground">
                  Lazy
                </span>
                {isPremium ? (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[10px] font-bold text-violet-300 tracking-wide uppercase">
                    PRO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border/60 text-[10px] font-semibold text-muted-foreground">
                    Free
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground/70 font-medium">
                Effortless everyday tools
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Location Pin Badge with Country Selector */}
        <div className="px-6 mb-6 relative" ref={desktopRef}>
          <button
            type="button"
            disabled={!isOnline}
            onClick={() => setDesktopRegionOpen((p) => !p)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 transition-colors text-xs text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-violet-300">
                {getLocationBadgeText(region)}
              </span>
              <span className="text-[11px] text-muted-foreground truncate max-w-[90px]">
                {countryInfo.name}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isPremium && <Lock className="h-3 w-3 text-violet-400" />}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </button>

          {desktopRegionOpen && (
            <div className="absolute left-6 right-6 top-full mt-2 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl z-50 max-h-60 overflow-y-auto backdrop-blur-xl animate-in zoom-in-95 duration-150">
              {!isPremium && (
                <div className="p-2 mb-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 flex items-start gap-1.5 leading-tight">
                  <Lock className="h-3 w-3 mt-0.5 flex-shrink-0 text-violet-400" />
                  <span>
                    Free tier is locked to your detected country (<strong>{detectedCountry}</strong>). Upgrade to Core to switch countries.
                  </span>
                </div>
              )}
              {ALL_COUNTRIES.slice(0, 20).map((c) => {
                const isLocked = !isPremium && c.code !== detectedCountry;
                const isCurrent = region === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setRegion(c.code);
                      setDesktopRegionOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl text-xs ${
                      isCurrent
                        ? 'bg-violet-500/20 text-violet-300 font-bold'
                        : isLocked
                        ? 'text-foreground/50 hover:bg-muted/30 cursor-pointer'
                        : 'text-foreground/80 hover:bg-muted/40'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate max-w-[140px]">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    {isLocked ? (
                      <span className="flex items-center gap-0.5 text-[9px] text-violet-400 font-bold">
                        <Lock className="h-2.5 w-2.5" />
                        <span>PRO</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{c.code}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href === '/compare' && location === '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-200 group ${
                  isActive
                    ? `${item.activeBg} ${item.activeBorder} ${item.activeColor}`
                    : 'border-transparent text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div
                    className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full ${item.activeBar}`}
                  />
                )}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive ? item.activeIcon : 'bg-muted/40 text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 leading-tight">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Pro Banner in sidebar bottom */}
        <div className="px-5 mt-auto">
          <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-card to-card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="font-display text-xs font-bold text-foreground">
                Ultra Lazy Pro
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              {isPremium
                ? 'All Pro capabilities active. Live timers, 6-ingredient cook, verified stays.'
                : 'Unlock 6-ingredient cooking, live countdown timers, and verified safety sorting.'}
            </p>
            <button
              type="button"
              onClick={openUpgrade}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isPremium ? 'Manage Pro' : 'Activate Ultra Pro'}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-display font-black text-sm">
            L
          </div>
          <span className="font-display text-base font-bold text-foreground">
            Lazy
          </span>

          {/* Subtle Location Pin Badge */}
          <span className="text-[11px] font-bold text-violet-300 ml-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
            {getLocationBadgeText(region)}
          </span>
        </div>

        <div className="flex items-center gap-2" ref={mobileRef}>
          {/* Change Region Mobile Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={!isOnline}
              onClick={() => setMobileRegionOpen((p) => !p)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Globe className="h-3 w-3" />
              <span>Region</span>
              <ChevronDown className="h-2.5 w-2.5" />
            </button>

            {mobileRegionOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-card/95 p-1.5 shadow-2xl z-50 max-h-56 overflow-y-auto">
                {!isPremium && (
                  <div className="p-1.5 mb-1 rounded-lg bg-violet-500/10 text-[10px] text-violet-300 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-violet-400 flex-shrink-0" />
                    <span>Free locked to {detectedCountry}</span>
                  </div>
                )}
                {ALL_COUNTRIES.slice(0, 15).map((c) => {
                  const isLocked = !isPremium && c.code !== detectedCountry;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setRegion(c.code);
                        setMobileRegionOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-[11px] ${
                        region === c.code
                          ? 'bg-violet-500/20 text-violet-300 font-bold'
                          : isLocked
                          ? 'text-foreground/50 hover:bg-muted/30 cursor-pointer'
                          : 'text-foreground/80 hover:bg-muted/40'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span>{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      {isLocked ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-violet-400 font-bold">
                          <Lock className="h-2.5 w-2.5" />
                          <span>PRO</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">{c.code}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openUpgrade}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/15 text-[10px] font-bold text-violet-300 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            {isPremium ? 'PRO' : 'UPGRADE'}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar/95 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href === '/compare' && location === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? `${item.activeColor} font-semibold scale-105`
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
