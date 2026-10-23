import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRegion } from '../context/RegionContext';
import { usePremium } from '../context/PremiumContext';
import { VoiceButton } from './VoiceButton';
import { LazyAiMessage } from '../types';
import {
  LAZY_AI_WELCOME_MSG,
  getCountryInfo,
  getCurrencySymbol,
  getIdentityVerificationBadge,
  findRecipeForIngredients,
  detectArtisanTrade,
  detectCountryInQuery,
} from '../data/constants';
import {
  Sparkles,
  X,
  Send,
  Building,
  Phone,
  Bot,
  Plus,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

function parseIngredients(input: string): string[] {
  const cleaned = input
    .replace(/^(hey\s+)?(lazyai[, ]*)?/i, '')
    .replace(
      /\b(make|cook|find|suggest|give|me|a|an|some|recipe|food|with|using|from|what|can|i|have|in|my|fridge|please|ingredients?)\b/gi,
      ' '
    )
    .replace(/[.!?]/g, ',');
  const parts = cleaned
    .split(/[,;\n]+|\s+(?:and|&)\s+|\s+/i)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1);
  return [...new Set(parts)].slice(0, 6);
}

function parseCity(input: string, country: string): string {
  const match = input.match(/\b(?:in|near|around|at)\s+([A-Z][a-zA-Z .'-]{1,35})/i);
  if (match) {
    return match[1].trim().replace(/\b(apartment|hotel|airbnb|rent|stay|please)\b.*$/i, '').trim();
  }
  if (country === 'NG') return 'Lagos';
  if (country === 'US') return 'San Francisco';
  if (country === 'GB') return 'London';
  if (country === 'CA') return 'Toronto';
  if (country === 'KE') return 'Nairobi';
  return 'Downtown';
}

export function LazyAIModal() {
  const [, setLocation] = useLocation();
  const { region, countryInfo, detectedCountry } = useRegion();
  const { isPremium, creditsExhausted, openUpgrade } = usePremium();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem('lazyAiDraft') || '';
    } catch {
      return '';
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [planMode, setPlanMode] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat message history initialized with welcome message
  const [chatMessages, setChatMessages] = useState<LazyAiMessage[]>([
    { id: 'welcome', role: 'assistant', text: LAZY_AI_WELCOME_MSG },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('lazyAiDraft', draft);
    } catch {
      // ignore
    }
  }, [draft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading, isOpen]);

  const handleProcessMessage = async (text: string): Promise<LazyAiMessage> => {
    const lower = text.toLowerCase();

    // Check if user is asking to search another country/region while on free tier
    const targetCountry = detectCountryInQuery(text);
    if (targetCountry && targetCountry !== detectedCountry && !isPremium) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `🔒 Searching other countries & regions is exclusive to Ultra Lazy Core. Your free tier is locked to your present location (${countryInfo.name}). Upgrade to Core to search verified artisans, stays, and services worldwide across 240+ countries.`,
      };
    }

    // 1. Cook flow
    if (/\b(cook|food|recipe|ingredient|fridge)\b/.test(lower)) {
      const ings = parseIngredients(text);
      if (ings.length > 0) {
        try {
          localStorage.setItem('lazyai_cook_ingredients', JSON.stringify(ings));
        } catch {
          // ignore
        }
      }
      setLocation('/cook');
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('lazyai:ingredients', { detail: { ingredients: ings } })
        );
      }, 180);

      const matched = findRecipeForIngredients(ings);
      const recipeSummary = matched
        ? ` Recommended: ${matched.emoji} ${matched.name} (~${matched.prepMins} min). Key steps: ${matched.steps.slice(0, 2).join(' ')}`
        : ` Turn ${ings.slice(0, 3).join(', ')} into a simple skillet meal.`;

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `I've loaded those into your fridge grid and found a recipe!${recipeSummary}`,
      };
    }

    // 2. Stay flow
    if (/\b(apartment|stay|airbnb|rent|hotel|lodge)\b/.test(lower)) {
      const city = parseCity(text, region);
      const props = [
        {
          name: `${city} Central Studio`,
          platform: region === 'NG' ? 'Local Stay' : region === 'GB' ? 'Booking.com' : 'Airbnb',
          price: region === 'NG' ? 48000 : region === 'GB' ? 92 : 115,
          city,
          occupancyStatus: 'available' as const,
          occupancyLabel: 'Vacancies Available · 3 spots open',
        },
        {
          name: `${city} Garden Suite Lodge`,
          platform: region === 'NG' ? 'Verified Host' : 'Booking.com',
          price: region === 'NG' ? 62000 : region === 'GB' ? 118 : 139,
          city,
          occupancyStatus: 'filled_up' as const,
          occupancyLabel: 'No Space · Fully Booked',
        },
      ];
      try {
        localStorage.setItem('lazyai_apartment_request', city);
      } catch {
        // ignore
      }
      setLocation('/compare');
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `I've checked accommodations around ${city} and identified live space availability:\n• ${city} Central Studio has vacancies ready to book.\n• ${city} Garden Suite Lodge is completely filled up (0 spaces left, waitlist open).\nI've opened Lazy Stay to compare rates and join waitlists.`,
        properties: props,
      };
    }

    // 3. Task & Artisan hand skills flow
    if (
      /\b(plumber|electrician|carpenter|tiler|plaster|plasterer|painter|mason|bricklayer|welder|mechanic|roofer|ac|generator|locksmith|laundry|cleaner|handyman|help|fix|repair)\b/i.test(
        lower
      )
    ) {
      const cat = detectArtisanTrade(text);

      let myContact: { name: string; phone: string } | null = null;
      try {
        const raw = localStorage.getItem('lazyContacts');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find(
            (c: any) =>
              (!c.country || c.country === region) &&
              c.category?.toLowerCase().includes(cat.toLowerCase())
          );
          if (found) {
            myContact = { name: found.name, phone: found.phone };
          }
        }
      } catch {
        // ignore
      }

      try {
        localStorage.setItem('lazyai_task_request', cat);
      } catch {
        // ignore
      }
      setLocation('/task');

      const provider = myContact
        ? {
            name: myContact.name,
            phone: myContact.phone,
            source: 'Your My Circle contact',
            verification: 'Personal contact — on file',
          }
        : {
            name:
              region === 'NG'
                ? `Verified ${cat} Guild Craftsman`
                : region === 'GB'
                ? `London ${cat} Specialist`
                : `${cat} Pro via TaskRabbit`,
            phone: region === 'NG' ? '+234 803 123 4567' : '+1 (415) 555-0148',
            source: region === 'NG' ? 'Local artisan network' : 'TaskRabbit verified',
            verification: getIdentityVerificationBadge(region),
          };

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: myContact
          ? `I found ${myContact.name} in your My Circle for ${cat}. You can call them directly, or explore the public market for another option.`
          : `I've found verified ${cat} artisans near you on the Public Market. Here is a localized verified contact to start with.`,
        provider,
      };
    }

    // 4. Fallback conversational with localized currency
    const currSym = getCurrencySymbol(region);
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: `Got it. You're in ${countryInfo.name}, so I'll prioritize local options and ${currSym} pricing. Let me know if you'd like me to compare stays, find quick recipes, or dispatch an artisan.`,
    };
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    if (creditsExhausted) {
      openUpgrade();
      return;
    }

    setDraft('');
    setAttachment(null);
    try {
      localStorage.removeItem('lazyAiDraft');
    } catch {
      // ignore
    }

    setChatMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 650));
    const response = await handleProcessMessage(text);
    setChatMessages((prev) => [...prev, response]);
    setIsLoading(false);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file.name);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Open LazyAI"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[65] flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/40 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
      >
        <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-black border-2 border-background animate-pulse">
          ✨
        </span>
      </button>

      {/* Overlay Window */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="LazyAI chat"
          className="fixed inset-x-3 bottom-[5.5rem] z-[70] mx-auto flex max-h-[min(82dvh,720px)] w-auto max-w-md flex-col overflow-hidden rounded-3xl border border-violet-500/30 bg-card/95 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[420px]"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-violet-500/20 via-violet-500/10 to-transparent p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/20 text-violet-300 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                LazyAI 🌟
              </h2>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span>{countryInfo.flag}</span>
                <span>{countryInfo.name}</span>
                <span>·</span>
                <span>{getCurrencySymbol(region)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close LazyAI"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Credit Status Banner */}
          {creditsExhausted && (
            <div className="bg-amber-500/15 border-b border-amber-500/25 px-4 py-2.5 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span className="leading-tight">
                  You've used up your daily credits. Upgrade to continue.
                </span>
              </div>
              <button
                type="button"
                onClick={openUpgrade}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold flex-shrink-0 shadow-sm"
              >
                Upgrade to Core
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white font-medium rounded-br-sm shadow-md shadow-violet-600/20'
                      : 'bg-muted/50 text-foreground border border-border/50 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Stays card attachment */}
                  {msg.properties && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-border/30">
                      {msg.properties.map((p, idx) => {
                        const isFilled = p.occupancyStatus === 'filled_up';
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2.5 rounded-xl bg-card border text-[11px] ${
                              isFilled ? 'border-rose-500/30 bg-rose-950/10' : 'border-border/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-foreground">{p.name}</p>
                                {isFilled ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-500/30">
                                    🚫 No Space
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30">
                                    ✓ Available
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {p.platform} · {p.city} · {p.occupancyLabel || 'Verified'}
                              </p>
                            </div>
                            <span
                              className={`font-bold ${
                                isFilled ? 'text-muted-foreground line-through' : 'text-emerald-400'
                              }`}
                            >
                              {getCurrencySymbol(region)}
                              {p.price}
                            </span>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setLocation('/compare');
                        }}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-300 hover:bg-violet-500/25"
                      >
                        <Building className="h-3.5 w-3.5" />
                        Open Lazy Stay
                      </button>
                    </div>
                  )}

                  {/* Provider card attachment */}
                  {msg.provider && (
                    <div className="mt-2.5 rounded-xl bg-card border border-border/40 p-3 space-y-2">
                      <div>
                        <p className="font-semibold text-foreground text-xs">
                          {msg.provider.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {msg.provider.source} · {msg.provider.verification}
                        </p>
                      </div>
                      <a
                        href={`tel:${msg.provider.phone.replace(/\D/g, '')}`}
                        className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Now · {msg.provider.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setLocation('/task');
                        }}
                        className="flex w-full items-center justify-center py-1.5 rounded-xl border border-border/40 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                      >
                        Browse Public Market
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                <span>LazyAI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment chip if present */}
          {attachment && (
            <div className="px-4 py-1.5 bg-muted/20 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 truncate">
                <FileText className="h-3 w-3 text-violet-400" />
                {attachment}
              </span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Prompt Bar with Interface Controls */}
          <div className="border-t border-border/50 bg-card/90 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-3 py-1.5 focus-within:border-violet-500/40">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Make, test, iterate..."
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />

                {/* Voice Dictation Mic Button */}
                <VoiceButton
                  onTranscript={handleVoiceTranscript}
                  size="sm"
                  title="Speak to LazyAI"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!draft.trim() || isLoading}
                  aria-label="Send message"
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Bottom bar controls: Attachment (+), Plan Mode, Tier Indicator */}
              <div className="flex items-center justify-between px-1 text-[11px]">
                <div className="flex items-center gap-2">
                  {/* File attachment option (+) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Add attachment"
                    title="Add file attachment"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Attach</span>
                  </button>

                  {/* Plan mode selector */}
                  <button
                    type="button"
                    onClick={() => setPlanMode((p) => !p)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                      planMode
                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                        : 'border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Plan
                  </button>
                </div>

                {/* Tier indicator */}
                <button
                  type="button"
                  onClick={openUpgrade}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                    isPremium
                      ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5 text-violet-400" />
                  {isPremium ? 'Pro' : 'Free'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
