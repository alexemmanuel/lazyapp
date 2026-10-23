import React from 'react';
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
} from 'lucide-react';

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
  const { countryInfo, region } = useRegion();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border bg-sidebar flex-shrink-0 flex-col py-7 transition-all duration-300 relative overflow-hidden">
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

        {/* Country status pill */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{countryInfo.flag}</span>
              <span className="font-medium text-foreground truncate max-w-[130px]">
                {countryInfo.name}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              {region}
            </span>
          </div>
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
          <span className="text-xs">{countryInfo.flag}</span>
        </div>

        <button
          type="button"
          onClick={openUpgrade}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 text-[11px] font-bold text-violet-300"
        >
          <Sparkles className="h-3 w-3" />
          {isPremium ? 'PRO ACTIVE' : 'UPGRADE'}
        </button>
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
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
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
