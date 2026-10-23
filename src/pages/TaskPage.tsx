import React, { useState, useEffect } from 'react';
import { usePremium } from '../context/PremiumContext';
import { useRegion } from '../context/RegionContext';
import {
  TASK_CATEGORIES,
  CATEGORY_CONFIG,
  DEFAULT_CONTACTS,
  generateMarketProviders,
  formatCurrency,
  getIdentityVerificationBadge,
  getDispatchSuccessMessage,
  getArtisanSearchLoadingText,
  formatGoogleCalendarUrl,
} from '../data/constants';
import { ContactItem, MarketProvider, ScheduleItem, TimerItem, ReportTarget } from '../types';
import { ReportListingModal } from '../components/ReportListingModal';
import {
  Wrench,
  Calendar,
  Timer,
  Heart,
  Globe,
  Search,
  Phone,
  Plus,
  Trash2,
  Edit2,
  CalendarPlus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Star,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Mic,
  Clock,
  Check,
} from 'lucide-react';

export function TaskPage() {
  const { isPremium, openUpgrade } = usePremium();
  const { region, isOnline, countryInfo } = useRegion();

  const [activeTab, setActiveTab] = useState<'help' | 'schedule' | 'timers'>('help');

  // Help Sub-states
  const [source, setSource] = useState<'circle' | 'market'>('circle');
  const [category, setCategory] = useState<string>('Plumber');
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return localStorage.getItem('taskSearch') || '';
    } catch {
      return '';
    }
  });

  // Contacts (My Circle)
  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem('lazyContacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  // Market Providers
  const [marketProviders, setMarketProviders] = useState<MarketProvider[]>(() => {
    try {
      const saved = localStorage.getItem('lazyTaskMarket');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [marketLoading, setMarketLoading] = useState(false);

  // Schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('lazySchedules');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              title: 'Pick up laundry & dry cleaning',
              dateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16),
              category: 'Laundry',
              completed: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // Timers
  const [timers, setTimers] = useState<TimerItem[]>(() => {
    try {
      const saved = localStorage.getItem('lazyTimers');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              label: 'Kitchen Simmer',
              totalSeconds: 900,
              remainingSeconds: 900,
              isRunning: false,
            },
          ];
    } catch {
      return [];
    }
  });

  // Modals
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactCategory, setNewContactCategory] = useState('Plumber');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  const [editContact, setEditContact] = useState<ContactItem | null>(null);

  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState(() =>
    new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16)
  );

  const [dispatchConfirm, setDispatchConfirm] = useState<{
    provider: MarketProvider;
    message: string;
  } | null>(null);

  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lazyContacts', JSON.stringify(contacts));
      localStorage.setItem('lazySchedules', JSON.stringify(schedules));
      localStorage.setItem('lazyTimers', JSON.stringify(timers));
      localStorage.setItem('lazyTaskMarket', JSON.stringify(marketProviders));
      localStorage.setItem('taskSearch', searchQuery);
    } catch {
      // ignore
    }
  }, [contacts, schedules, timers, marketProviders, searchQuery]);

  // Live countdown timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const next = t.remainingSeconds - 1;
          if (next === 0) {
            window.dispatchEvent(
              new CustomEvent('lazy:push-notification', {
                detail: { message: `⏰ Timer Finished: ${t.label}!` },
              })
            );
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for AI task requests
  useEffect(() => {
    const handleAiTask = (e: Event) => {
      const custom = e as CustomEvent<{ service?: string }>;
      const service = custom.detail?.service;
      if (service) {
        setCategory(service);
        setSource('market');
        runMarketSearch(service);
      }
    };

    try {
      const req = localStorage.getItem('lazyai_task_request');
      if (req) {
        localStorage.removeItem('lazyai_task_request');
        setCategory(req);
        setSource('market');
        runMarketSearch(req);
      }
    } catch {
      // ignore
    }

    window.addEventListener('lazyai:task', handleAiTask);
    return () => window.removeEventListener('lazyai:task', handleAiTask);
  }, [region]);

  const runMarketSearch = (cat: string = category) => {
    setMarketLoading(true);
    setMarketProviders([]);
    setTimeout(() => {
      const results = generateMarketProviders(cat, region, searchQuery.trim() || cat);
      setMarketProviders(results);
      setMarketLoading(false);
    }, 900);
  };

  const handleSourceChange = (newSource: 'circle' | 'market') => {
    setSource(newSource);
    if (newSource === 'market' && marketProviders.length === 0) {
      runMarketSearch(category);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (source === 'market') {
      runMarketSearch(cat);
    }
  };

  const handleDispatch = (provider: MarketProvider) => {
    const message = getDispatchSuccessMessage(region, provider.name);
    setDispatchConfirm({ provider, message });
    window.dispatchEvent(
      new CustomEvent('lazy:push-notification', {
        detail: { message },
      })
    );
  };

  // Contacts CRUD
  const handleSaveNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: ContactItem = {
      id: Date.now(),
      name: newContactName.trim(),
      category: newContactCategory,
      phone: newContactPhone.trim(),
      notes: newContactNotes.trim() || undefined,
      country: region,
      isIdentityVerified: false,
      reportCount: 0,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactNotes('');
    setAddContactOpen(false);
  };

  const handleSaveEditContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContact) return;
    setContacts((prev) =>
      prev.map((c) => (c.id === editContact.id ? editContact : c))
    );
    setEditContact(null);
  };

  const handleDeleteContact = (id: number | string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Schedule CRUD
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return;

    const item: ScheduleItem = {
      id: crypto.randomUUID(),
      title: newScheduleTitle.trim(),
      dateTime: newScheduleDate,
      category,
      completed: false,
    };

    setSchedules((prev) => [...prev, item]);
    setNewScheduleTitle('');
    setAddScheduleOpen(false);
  };

  const toggleScheduleComplete = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Timer actions
  const addTimerPreset = (minutes: number, label: string) => {
    if (!isPremium) {
      openUpgrade();
      return;
    }
    const secs = minutes * 60;
    const newTimer: TimerItem = {
      id: crypto.randomUUID(),
      label,
      totalSeconds: secs,
      remainingSeconds: secs,
      isRunning: true,
    };
    setTimers((prev) => [...prev, newTimer]);
  };

  const toggleTimerRunning = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t))
    );
  };

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const formatTimerDigits = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeCategoryConf = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Plumber;

  const filteredCircle = contacts.filter(
    (c) =>
      c.category === category &&
      (!c.country || c.country === region) &&
      (!searchQuery.trim() ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-full p-4 sm:p-7 md:p-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-400">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Lazy Task
            </h1>
            <p className="text-xs text-muted-foreground">
              Call trusted pros, schedule errands, or let timers keep you on track.
            </p>
          </div>
        </div>

        {/* Top 3 Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border/50 bg-card/60">
          <button
            type="button"
            onClick={() => setActiveTab('help')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'help'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            Get Help
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            Timers
            {!isPremium && (
              <span className="px-1 rounded-full bg-violet-500/20 text-[9px] text-violet-300 border border-violet-500/30 font-bold">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
         SUB-TAB 1: GET HELP (MY CIRCLE VS PUBLIC MARKET)
         ========================================================================= */}
      {activeTab === 'help' && (
        <div className="space-y-6">
          {/* Source Switcher: My Circle vs Public Market */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border/50 bg-card/70 p-1.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => handleSourceChange('circle')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                source === 'circle'
                  ? 'bg-rose-500/20 border border-rose-500/30 text-rose-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="h-3.5 w-3.5 fill-rose-500/40" />
              My Circle ❤️
            </button>
            <button
              type="button"
              onClick={() => handleSourceChange('market')}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                source === 'market'
                  ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Public Market 🌍
            </button>
          </div>

          {/* Search workmanship box */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 flex items-center gap-3">
            <Search className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for any workmanship (e.g. tiler, painter, carpenter, cleaner...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSource('market');
                  runMarketSearch(category);
                }
              }}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Speak service search"
              className="text-muted-foreground hover:text-violet-400 p-1"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>

          {/* Categories Horizontal Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TASK_CATEGORIES.map((cat) => {
              const conf = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG.Plumber;
              const isSelected = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? `${conf.bg} ${conf.border} ${conf.color} ring-1 ${conf.ring} shadow-md`
                      : 'border-border/40 bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <span className="text-base">{conf.emoji}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* SOURCE: MY CIRCLE */}
          {source === 'circle' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Your Saved Contacts for {category}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Personal numbers you trust. No middleman fees.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewContactCategory(category);
                    setAddContactOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Contact
                </button>
              </div>

              {filteredCircle.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    No personal {category} saved in your circle yet for {countryInfo.name}.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAddContactOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl border border-border/50 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Add a Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSourceChange('market')}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-xs font-semibold text-sky-300 hover:bg-sky-500/30"
                    >
                      Find on Public Market 🌍
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredCircle.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-2xl border border-border/50 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-display font-bold text-sm">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-sm font-bold text-foreground">
                              {contact.name}
                            </h4>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400" title="Personal contact on file" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {contact.phone}
                            {contact.notes && ` · ${contact.notes}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setEditContact(contact)}
                          aria-label="Edit provider"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:bg-muted"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          aria-label="Delete provider"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={`tel:${contact.phone.replace(/\D/g, '')}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call Now
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SOURCE: PUBLIC MARKET */}
          {source === 'market' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground">
                    Verified {category} Artisans Near You
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Vetted via {countryInfo.name} background databases.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => runMarketSearch(category)}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Refresh
                </button>
              </div>

              {marketLoading ? (
                <div className="p-8 rounded-3xl border border-sky-500/20 bg-card/60 text-center animate-pulse-soft">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 mb-3 animate-spin">
                    <Globe className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    {getArtisanSearchLoadingText(region)}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {marketProviders.map((provider, idx) => (
                    <div
                      key={provider.id}
                      className="p-5 rounded-3xl border border-border/50 bg-card/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300">
                              ⭐ Best Match
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-muted border border-border/50 text-[10px] font-semibold text-muted-foreground">
                            {provider.badge}
                          </span>
                        </div>

                        <h4 className="font-display text-base font-bold text-foreground">
                          {provider.name}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-foreground">{provider.rating}</span>
                            <span>({provider.reviews} reviews)</span>
                          </span>
                          <span>·</span>
                          <span>{provider.distance}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold">
                            Est. {formatCurrency(provider.startingPrice, region)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3" />
                            {getIdentityVerificationBadge(region)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                            {provider.safetyScore}% Safety Rating
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDispatch(provider)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display text-xs font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          One-Click Dispatch
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              kind: 'provider',
                              id: provider.id,
                              name: provider.name,
                            })
                          }
                          className="text-[11px] text-muted-foreground/60 hover:text-red-400 flex items-center gap-1"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Report Listing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
         SUB-TAB 2: SCHEDULE
         ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Scheduled Errands & Bookings
              </h3>
              <p className="text-xs text-muted-foreground">
                Sync reminders straight to your Google Calendar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAddScheduleOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Add Errand
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  item.completed
                    ? 'border-border/30 bg-muted/20 opacity-60'
                    : 'border-border/50 bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleScheduleComplete(item.id)}
                    className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-colors ${
                      item.completed
                        ? 'bg-amber-500 text-black border-amber-400'
                        : 'border-muted-foreground/40 text-transparent hover:border-amber-400'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <div>
                    <h4
                      className={`font-display text-sm font-bold ${
                        item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.dateTime).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {item.category && ` · ${item.category}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={formatGoogleCalendarUrl(item.title, item.dateTime)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                  >
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    Google Cal
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
         SUB-TAB 3: TIMERS (PRO FEATURE)
         ========================================================================= */}
      {activeTab === 'timers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-foreground">
                  Live Countdown Timers
                </h3>
                {!isPremium && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-300 border border-violet-500/30">
                    Ultra Lazy Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Set and forget. Visual tickers for cooking, laundry cycles, or power naps.
              </p>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Quick presets:</span>
            <button
              type="button"
              onClick={() => addTimerPreset(5, '5 min Quick Nap')}
              className="px-3 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-xs font-semibold text-foreground"
            >
              5 min
            </button>
            <button
              type="button"
              onClick={() => addTimerPreset(15, '15 min Simmer / Cycle')}
              className="px-3 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-xs font-semibold text-foreground"
            >
              15 min
            </button>
            <button
              type="button"
              onClick={() => addTimerPreset(25, '25 min Focus Pomodoro')}
              className="px-3 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-xs font-semibold text-foreground"
            >
              25 min
            </button>
            <button
              type="button"
              onClick={() => addTimerPreset(45, '45 min Laundry Wash')}
              className="px-3 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-muted text-xs font-semibold text-foreground"
            >
              45 min
            </button>
          </div>

          {!isPremium && (
            <div className="p-4 rounded-2xl border border-violet-500/25 bg-violet-500/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-violet-300">Live timers are a Pro perk</p>
                <p className="text-[11px] text-muted-foreground">
                  Upgrade to keep multiple running timers with background sound chimes.
                </p>
              </div>
              <button
                type="button"
                onClick={openUpgrade}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
              >
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Timer Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {timers.map((timer) => {
              const progress = ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100;
              const isDone = timer.remainingSeconds === 0;

              return (
                <div
                  key={timer.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isDone
                      ? 'border-red-500/40 bg-red-500/10 animate-bounce'
                      : 'border-border/50 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-sm font-bold text-foreground">
                      {timer.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteTimer(timer.id)}
                      className="text-muted-foreground hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="font-display text-3xl font-black text-foreground my-2">
                    {formatTimerDigits(timer.remainingSeconds)}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        isDone ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {isDone && (
                    <p className="text-xs font-bold text-red-300 mb-3 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      ⚠️ Task Overdue! Take Action.
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTimerRunning(timer.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                        timer.isRunning
                          ? 'bg-muted text-foreground hover:bg-muted/80'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {timer.isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      {timer.isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTimer(timer.id)}
                      className="px-3 py-2 rounded-xl border border-border/50 hover:bg-muted text-muted-foreground text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
         MODALS & DIALOGS
         ========================================================================= */}

      {/* Add Contact Modal */}
      {addContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-foreground mb-4">
              Add to My Circle ❤️
            </h3>
            <form onSubmit={handleSaveNewContact} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name / Artisan Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baba Tunde (Plumber)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Category
                </label>
                <select
                  value={newContactCategory}
                  onChange={(e) => setNewContactCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                >
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great rates, always on time"
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddContactOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  Save to My Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-foreground mb-4">
              Edit Provider
            </h3>
            <form onSubmit={handleSaveEditContact} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={editContact.name}
                  onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={editContact.phone}
                  onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editContact.notes || ''}
                  onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditContact(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {addScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-foreground mb-4">
              Schedule Task
            </h3>
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrician arrives at 3pm"
                  value={newScheduleTitle}
                  onChange={(e) => setNewScheduleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddScheduleOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Confirmation Dialog */}
      {dispatchConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-violet-500/30 bg-card p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              Artisan Dispatched!
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {dispatchConfirm.message}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">
              Provider Phone: {dispatchConfirm.provider.phone}
            </p>
            <button
              type="button"
              onClick={() => setDispatchConfirm(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
            >
              Done, back to my couch
            </button>
          </div>
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
