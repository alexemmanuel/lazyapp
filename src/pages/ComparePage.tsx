import React, { useState, useEffect, useRef } from 'react';
import { usePremium } from '../context/PremiumContext';
import { useRegion } from '../context/RegionContext';
import {
  generateServicesComparison,
  generateApartments,
  formatCurrency,
  formatDistance,
  getIdentityVerificationBadge,
  ALL_COUNTRIES,
  LOADING_STEPS_NG,
  LOADING_STEPS_US,
  LOADING_STEPS_GB,
  LOADING_STEPS_KE,
  LOADING_STEPS_GLOBAL,
} from '../data/constants';
import { ServiceItem, ApartmentItem, ReportTarget } from '../types';
import { ReportListingModal } from '../components/ReportListingModal';
import {
  Compass,
  Search,
  Building,
  Car,
  Utensils,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowUpDown,
  Clock,
  Tag,
  AlertTriangle,
  ChevronDown,
  Globe,
  Star,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function ComparePage() {
  const { isPremium, trySearch, openUpgrade } = usePremium();
  const { region, setRegion, isOnline, countryInfo } = useRegion();

  const [activeTab, setActiveTab] = useState<'services' | 'apartments'>('services');

  // Services state
  const [serviceQuery, setServiceQuery] = useState(() => {
    try {
      return localStorage.getItem('compareQuery') || '';
    } catch {
      return '';
    }
  });
  const [serviceStatus, setServiceStatus] = useState<'idle' | 'loading' | 'results'>(() => {
    try {
      const cached = localStorage.getItem('lazyCompareResults');
      return cached && JSON.parse(cached).length > 0 ? 'results' : 'idle';
    } catch {
      return 'idle';
    }
  });
  const [serviceResults, setServiceResults] = useState<ServiceItem[]>(() => {
    try {
      const cached = localStorage.getItem('lazyCompareResults');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [serviceStep, setServiceStep] = useState(0);
  const [serviceFilter, setServiceFilter] = useState<'all' | 'ride' | 'delivery'>('all');
  const [serviceSort, setServiceSort] = useState<'price' | 'time'>('price');

  // Apartments state
  const [apartmentCity, setApartmentCity] = useState(() => {
    try {
      return localStorage.getItem('apartmentCity') || (region === 'NG' ? 'Lagos' : 'London');
    } catch {
      return region === 'NG' ? 'Lagos' : 'London';
    }
  });
  const [apartmentStatus, setApartmentStatus] = useState<'idle' | 'loading' | 'results'>(() => {
    try {
      const cached = localStorage.getItem('lazyApartmentsCache');
      return cached && JSON.parse(cached).length > 0 ? 'results' : 'idle';
    } catch {
      return 'idle';
    }
  });
  const [apartmentResults, setApartmentResults] = useState<ApartmentItem[]>(() => {
    try {
      const cached = localStorage.getItem('lazyApartmentsCache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [apartmentStep, setApartmentStep] = useState(0);
  const [apartmentSort, setApartmentSort] = useState<'price' | 'distance'>('price');
  const [safeOnly, setSafeOnly] = useState(false);

  // Country select dropdown
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Report modal
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // Loading steps
  const loadingSteps =
    region === 'NG'
      ? LOADING_STEPS_NG
      : region === 'US'
      ? LOADING_STEPS_US
      : region === 'GB'
      ? LOADING_STEPS_GB
      : region === 'KE'
      ? LOADING_STEPS_KE
      : LOADING_STEPS_GLOBAL;

  // Persist caches
  useEffect(() => {
    try {
      localStorage.setItem('lazyCompareResults', JSON.stringify(serviceResults));
      localStorage.setItem('lazyApartmentsCache', JSON.stringify(apartmentResults));
      if (serviceStatus === 'idle') localStorage.setItem('compareQuery', serviceQuery);
      if (apartmentStatus === 'idle') localStorage.setItem('apartmentCity', apartmentCity);
    } catch {
      // ignore
    }
  }, [serviceResults, apartmentResults, serviceQuery, apartmentCity, serviceStatus, apartmentStatus]);

  // Click outside country picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [countryDropdownOpen]);

  // Check for LazyAI apartment search redirect
  useEffect(() => {
    try {
      const req = localStorage.getItem('lazyai_apartment_request');
      if (req) {
        localStorage.removeItem('lazyai_apartment_request');
        setActiveTab('apartments');
        setApartmentCity(req);
        const res = generateApartments(req, region).filter(
          (a) => a.isIdentityVerified && a.safetyScore >= 95
        );
        setApartmentResults(res);
        setApartmentStatus('results');
      }
    } catch {
      // ignore
    }
  }, [region]);

  const handleRunServiceSearch = (q: string = serviceQuery) => {
    const query = q.trim();
    if (!query) return;
    if (!trySearch()) return;

    setServiceStatus('loading');
    setServiceStep(0);
    setServiceResults([]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setServiceStep(step);
      } else {
        clearInterval(interval);
      }
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      const res = generateServicesComparison(query, region);
      setServiceResults(res);
      setServiceStatus('results');
    }, loadingSteps.length * 450 + 200);
  };

  const handleRunApartmentSearch = (city: string = apartmentCity) => {
    const c = city.trim();
    if (!c) return;
    if (!trySearch()) return;

    setApartmentStatus('loading');
    setApartmentStep(0);
    setApartmentResults([]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setApartmentStep(step);
      } else {
        clearInterval(interval);
      }
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      const res = generateApartments(c, region);
      setApartmentResults(res);
      setApartmentStatus('results');
    }, loadingSteps.length * 450 + 200);
  };

  const handleSafeToggle = () => {
    if (!isPremium) {
      openUpgrade();
      return;
    }
    setSafeOnly((prev) => !prev);
  };

  // Quick suggestions
  const suggestions =
    region === 'NG'
      ? ['Ride to Lagos Island', 'Jollof rice delivery', 'Groceries', 'Bolt to Ikeja']
      : region === 'US'
      ? ['Ride to Airport', 'Pizza delivery', 'Groceries', 'Ride downtown']
      : region === 'GB'
      ? ['Ride to Heathrow', 'Fish & chips delivery', 'Groceries', 'Ride to Soho']
      : ['Ride to Airport', 'Food delivery', 'Groceries', 'Ride downtown'];

  const apartmentSuggestions =
    region === 'NG'
      ? ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']
      : region === 'US'
      ? ['New York', 'Miami', 'Austin', 'Chicago']
      : region === 'GB'
      ? ['London', 'Manchester', 'Edinburgh', 'Birmingham']
      : ['Downtown', 'Old Town', 'City Center', 'Beachfront'];

  // Filter & sort services
  const filteredServices = serviceResults
    .filter((s) => (serviceFilter === 'all' ? true : s.category === serviceFilter))
    .slice()
    .sort((a, b) => (serviceSort === 'price' ? a.price - b.price : a.time - b.time));

  const availableServices = serviceResults.filter((s) => s.available);
  const bestPrice =
    availableServices.length > 0
      ? availableServices.reduce((min, s) => (s.price < min.price ? s : min))
      : null;
  const fastestTime =
    availableServices.length > 0
      ? availableServices.reduce((min, s) => (s.time < min.time ? s : min))
      : null;

  // Filter & sort apartments
  const filteredApartments = apartmentResults
    .filter((a) => (!safeOnly ? true : a.isIdentityVerified && a.safetyScore >= 95))
    .slice()
    .sort((a, b) =>
      apartmentSort === 'price'
        ? a.pricePerNight - b.pricePerNight
        : a.distanceKm - b.distanceKm
    );

  return (
    <div className="min-h-full p-4 sm:p-7 md:p-10 animate-in fade-in duration-300 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-300">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Lazy Compare
              </h1>
              <p className="text-xs text-muted-foreground">
                Never open 5 apps again. Compare rides, deliveries, and stays instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Country Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setCountryDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground shadow-sm"
          >
            <span className="text-base">{countryInfo.flag}</span>
            <span>{countryInfo.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
          </button>

          {countryDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl z-50 animate-in zoom-in-95 duration-150">
              <input
                type="text"
                placeholder="Search country..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none mb-2 border border-border/40"
              />
              <div className="max-h-56 overflow-y-auto space-y-1">
                {ALL_COUNTRIES.filter(
                  (c) =>
                    c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
                    c.code.toLowerCase().includes(countryFilter.toLowerCase())
                ).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setRegion(c.code);
                      setCountryDropdownOpen(false);
                      setServiceStatus('idle');
                      setServiceResults([]);
                      setApartmentStatus('idle');
                      setApartmentResults([]);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                      region === c.code
                        ? 'bg-violet-500/15 text-violet-300 font-bold'
                        : 'text-foreground/80 hover:bg-muted/40'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span className="truncate max-w-[150px]">{c.name}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Car className="h-4 w-4" />
          Rides & Delivery
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('apartments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'apartments'
              ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300 shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building className="h-4 w-4" />
          Apartments & Stays
        </button>
      </div>

      {/* =========================================================================
         TAB 1: RIDES & DELIVERY
         ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Search box */}
          <div className="rounded-3xl border border-card-border bg-card p-4 sm:p-5 shadow-xl shadow-black/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunServiceSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/30 border border-border/50 focus-within:border-violet-500/50 transition-colors">
                <Search className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={`What are you ordering or where are you headed in ${countryInfo.name}?`}
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="py-3 px-6 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-display text-xs font-bold shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Compare Prices
              </button>
            </form>

            {/* Quick suggestion pills */}
            <div className="mt-3.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground/60 font-medium">Try:</span>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    setServiceQuery(sug);
                    handleRunServiceSearch(sug);
                  }}
                  className="px-2.5 py-1 rounded-full border border-border/40 bg-muted/20 text-[11px] text-muted-foreground hover:border-violet-500/30 hover:text-foreground transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {serviceStatus === 'loading' && (
            <div className="rounded-3xl border border-violet-500/20 bg-card/60 p-8 text-center animate-pulse-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-300 mb-4 animate-spin">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                {loadingSteps[serviceStep] || 'Comparing platforms...'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Checking live rates across top local networks in {countryInfo.name}
              </p>
            </div>
          )}

          {/* Results state */}
          {serviceStatus === 'results' && (
            <div className="space-y-6">
              {/* Highlight Best & Fastest cards */}
              {(bestPrice || fastestTime) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {bestPrice && (
                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-sm">
                          {bestPrice.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                              🏆 Cheapest Option
                            </span>
                          </div>
                          <p className="font-display text-base font-bold text-foreground">
                            {bestPrice.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-black text-emerald-300">
                          {formatCurrency(bestPrice.price, region)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ~{bestPrice.time} mins away
                        </p>
                      </div>
                    </div>
                  )}

                  {fastestTime && (
                    <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 font-bold text-sm">
                          {fastestTime.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                              ⚡ Fastest Pickup
                            </span>
                          </div>
                          <p className="font-display text-base font-bold text-foreground">
                            {fastestTime.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-black text-sky-300">
                          {fastestTime.time} mins
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatCurrency(fastestTime.price, region)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Filters & Sort bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/40 bg-card/60">
                <div className="flex items-center gap-1.5">
                  {(['all', 'ride', 'delivery'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setServiceFilter(filter)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                        serviceFilter === filter
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Sort by:
                  </span>
                  <button
                    type="button"
                    onClick={() => setServiceSort('price')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      serviceSort === 'price'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Lowest Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceSort('time')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      serviceSort === 'time'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Fastest Time
                  </button>
                </div>
              </div>

              {/* Services list */}
              <div className="grid gap-3">
                {filteredServices.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      item.available
                        ? `${item.borderColor} ${item.color} bg-opacity-40`
                        : 'border-border/30 bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${item.borderColor} ${item.color} ${item.textColor} font-bold font-display text-sm`}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-bold text-foreground">
                            {item.name}
                          </h3>
                          {item.surge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-300">
                              ⚡ {item.surge}x Surge
                            </span>
                          )}
                          {!item.available && (
                            <span className="px-1.5 py-0.5 rounded-full bg-muted border border-border text-[9px] font-semibold text-muted-foreground">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground capitalize">
                          {item.category} · {item.time} mins estimated
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`font-display text-base font-bold ${item.textColor}`}>
                          {formatCurrency(item.price, region)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.available ? 'Ready to book' : 'No drivers'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         TAB 2: APARTMENTS & STAYS
         ========================================================================= */}
      {activeTab === 'apartments' && (
        <div className="space-y-6">
          {/* Warning banner */}
          <div className="p-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-xs text-amber-200 flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <span>
              Prices in local currency. Always verify host verification and safety score before sending any deposit. 🔒
            </span>
          </div>

          {/* Search & Safe toggle */}
          <div className="rounded-3xl border border-card-border bg-card p-4 sm:p-5 shadow-xl shadow-black/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunApartmentSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/30 border border-border/50 focus-within:border-violet-500/50 transition-colors">
                <Building className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter destination city (e.g. Lagos, London, New York...)"
                  value={apartmentCity}
                  onChange={(e) => setApartmentCity(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="py-3 px-6 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-display text-xs font-bold shadow-lg shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="h-4 w-4" />
                Find Stays
              </button>
            </form>

            <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
              {/* Quick suggestions */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted-foreground/60 font-medium">Cities:</span>
                {apartmentSuggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setApartmentCity(city);
                      handleRunApartmentSearch(city);
                    }}
                    className="px-2.5 py-1 rounded-full border border-border/40 bg-muted/20 text-[11px] text-muted-foreground hover:border-violet-500/30 hover:text-foreground transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Pro Safe Filter Toggle */}
              <button
                type="button"
                onClick={handleSafeToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  safeOnly
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Safe Apartment Sorting</span>
                {!isPremium && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-[9px] font-bold text-violet-300 border border-violet-500/30">
                    PRO
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Loading */}
          {apartmentStatus === 'loading' && (
            <div className="rounded-3xl border border-violet-500/20 bg-card/60 p-8 text-center animate-pulse-soft">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-300 mb-4 animate-spin">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Aggregating shortlet & stay rates...
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Comparing Airbnb, Booking.com, and local verified hosts in {apartmentCity}
              </p>
            </div>
          )}

          {/* Results */}
          {apartmentStatus === 'results' && (
            <div className="space-y-4">
              {/* Sort header */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/40 bg-card/60 text-xs">
                <span className="text-muted-foreground font-medium">
                  {filteredApartments.length} stays found in {apartmentCity}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setApartmentSort('price')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      apartmentSort === 'price'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Lowest Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setApartmentSort('distance')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      apartmentSort === 'distance'
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Closest
                  </button>
                </div>
              </div>

              {/* Apartment Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredApartments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-3xl border border-border/50 bg-card/90 flex flex-col justify-between transition-all hover:border-violet-500/30"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{apt.emoji}</span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {apt.platform}
                            </span>
                            <h3 className="font-display text-sm font-bold text-foreground leading-snug">
                              {apt.name}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-display text-lg font-black text-foreground">
                            {formatCurrency(apt.pricePerNight, region)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">/ night</p>
                        </div>
                      </div>

                      {/* Distance & Rating */}
                      <div className="flex items-center gap-3 my-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-foreground">{apt.rating}</span>
                          <span>({apt.reviews})</span>
                        </span>
                        <span>·</span>
                        <span>{formatDistance(apt.distanceKm, region)} from center</span>
                      </div>

                      {/* Safety & Identity Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            apt.isIdentityVerified
                              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                              : 'text-muted-foreground/60 bg-muted/30 border-border/40'
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {apt.isIdentityVerified
                            ? getIdentityVerificationBadge(region)
                            : 'Unverified ID'}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            apt.safetyScore >= 95
                              ? 'text-sky-300 bg-sky-500/10 border-sky-500/25'
                              : 'text-amber-300 bg-amber-500/10 border-amber-500/25'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {apt.safetyScore}% Safety Rating
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() =>
                          setReportTarget({
                            kind: 'apartment',
                            id: apt.id,
                            name: apt.name,
                          })
                        }
                        className="text-[11px] text-muted-foreground/60 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <ShieldAlert className="h-3 w-3" />
                        Report
                      </button>

                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-500/20"
                      >
                        View Details
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportListingModal
        target={reportTarget}
        country={region}
        onClose={() => setReportTarget(null)}
        onSubmit={(_target, reason) => {
          setReportTarget(null);
          window.dispatchEvent(
            new CustomEvent('lazy:push-notification', {
              detail: {
                message: `Report logged with Trust & Safety (${reason}). Listing queued for review.`,
              },
            })
          );
        }}
      />
    </div>
  );
}
