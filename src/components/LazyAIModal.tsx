import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRegion } from '../context/RegionContext';
import { LazyAiMessage } from '../types';
import {
  LAZY_AI_WELCOME_MSG,
  getCountryInfo,
  getCurrencySymbol,
  getIdentityVerificationBadge,
} from '../data/constants';
import {
  Sparkles,
  X,
  Send,
  Building,
  Phone,
  Flame,
  Wrench,
  Bot,
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
  const { region, countryInfo } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => {
    try {
      return localStorage.getItem('lazyAiDraft') || '';
    } catch {
      return '';
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<LazyAiMessage[]>([
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
  }, [messages, isLoading, isOpen]);

  const handleProcessMessage = async (text: string): Promise<LazyAiMessage> => {
    const lower = text.toLowerCase();

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

      const idea =
        ings.length > 0
          ? ` Quick idea: turn ${ings.slice(0, 3).join(', ')} into a simple skillet meal, adding the quickest-cooking items last.`
          : ' Tell me which ingredients you have, and I’ll load them into your fridge grid.';

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `I've loaded those into your fridge grid and found a recipe!${idea}`,
      };
    }

    // 2. Stay flow
    if (/\b(apartment|stay|airbnb|rent|hotel)\b/.test(lower)) {
      const city = parseCity(text, region);
      const props = [
        {
          name: `${city} Central Studio`,
          platform: region === 'NG' ? 'Local Stay' : region === 'GB' ? 'Booking.com' : 'Airbnb',
          price: region === 'NG' ? 48000 : region === 'GB' ? 92 : 115,
          city,
        },
        {
          name: `${city} Garden Suite`,
          platform: region === 'NG' ? 'Verified Host' : 'Booking.com',
          price: region === 'NG' ? 62000 : region === 'GB' ? 118 : 139,
          city,
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
        text: `I found two safety-filtered stay options around ${city}. These are demo listings; confirm details directly before booking.`,
        properties: props,
      };
    }

    // 3. Task flow
    if (/\b(plumber|electrician|help|mechanic|fix|cleaner|painter|carpenter|handyman)\b/.test(lower)) {
      const categoryMatch = text.match(
        /\b(plumber|electrician|mechanic|cleaner|painter|carpenter|handyman)\b/i
      )?.[0];
      const cat = categoryMatch || 'Plumber';

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
                ? `Oluwaseun — ${cat}`
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
          ? `I found ${myContact.name} in your My Circle. You can call them directly, or explore the public market for another option.`
          : `No personal contact found for ${cat}. Here's a verified provider to start with.`,
        provider,
      };
    }

    // 4. Fallback conversational
    const currSym = getCurrencySymbol(region);
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: `Got it. You're in ${countryInfo.name}, so I'll keep local options and ${currSym} pricing in mind. Tell me if you want to cook, compare a trip, or find a service pro.`,
    };
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    setDraft('');
    try {
      localStorage.removeItem('lazyAiDraft');
    } catch {
      // ignore
    }

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    const response = await handleProcessMessage(text);
    setMessages((prev) => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle LazyAI"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[65] flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-600 text-white shadow-2xl shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black border-2 border-background">
          1
        </span>
      </button>

      {/* Expandable chat window */}
      {isOpen && (
        <section
          role="dialog"
          aria-label="LazyAI chat"
          className="fixed inset-x-3 bottom-[5.5rem] z-[70] mx-auto flex max-h-[min(76dvh,700px)] w-auto max-w-md flex-col overflow-hidden rounded-3xl border border-violet-400/25 bg-card/95 shadow-2xl shadow-black/70 backdrop-blur-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[400px]"
        >
          {/* Header */}
          <header className="flex items-center gap-3 border-b border-border/50 bg-gradient-to-r from-violet-500/15 via-violet-500/5 to-transparent p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/15 text-violet-300">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                LazyAI <span className="text-xs">🌟</span>
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

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white font-medium rounded-br-sm'
                      : 'bg-muted/40 text-foreground/90 border border-border/50 rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Stays card attachment */}
                  {msg.properties && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-border/30">
                      {msg.properties.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-[11px]"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {p.platform} · {p.city}
                            </p>
                          </div>
                          <span className="font-bold text-emerald-400">
                            {getCurrencySymbol(region)}
                            {p.price}
                          </span>
                        </div>
                      ))}
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
                    <div className="mt-2.5 rounded-xl bg-card border border-border/40 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-[11px]">
                            {msg.provider.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {msg.provider.source} · {msg.provider.verification}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${msg.provider.phone.replace(/\D/g, '')}`}
                        className="flex w-full items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600 text-white text-[11px] font-semibold hover:bg-violet-500"
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

          {/* Input */}
          <div className="border-t border-border/50 bg-card/60 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 px-3 py-1.5 focus-within:border-violet-500/40"
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask LazyAI anything..."
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isLoading}
                aria-label="Send message"
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
