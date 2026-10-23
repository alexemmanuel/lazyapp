import React from 'react';
import { usePremium } from '../context/PremiumContext';
import { Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const FREE_PERKS = [
  'Locked to your detected country',
  '3 ingredients per recipe',
  '3 searches per day',
  'Manual calendar sync',
  'My Circle contacts',
];

const PRO_PERKS = [
  'Search other countries & regions worldwide',
  'Public Market: All verified hand skills',
  '6 ingredients per recipe',
  'Unlimited searches',
  'Live countdown timers',
  'Safe apartment sorting & verified badges',
];

export function UpgradeModal() {
  const { upgradeOpen, closeUpgrade, togglePremium, isPremium } = usePremium();

  if (!upgradeOpen) return null;

  const handleToggle = () => {
    if (!isPremium) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a78bfa', '#34d399', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }
    togglePremium();
    closeUpgrade();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={closeUpgrade}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg rounded-3xl border border-violet-500/25 bg-card/95 p-6 sm:p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={closeUpgrade}
          aria-label="Close dialog"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Ultra Lazy Core / Pro
            </h2>
            <p className="text-xs text-muted-foreground">
              Maximum speed, unlimited searches, zero effort.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3.5 my-6">
          <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Free Tier
            </span>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground/80">
              {FREE_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[9px] font-bold text-violet-300 border border-violet-500/30">
              CORE
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
              Core / Pro Plan
            </span>
            <ul className="mt-3 space-y-2 text-xs text-foreground/90 font-medium">
              {PRO_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl font-display text-sm font-bold border transition-all duration-200 shadow-xl cursor-pointer ${
            isPremium
              ? 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
              : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-400/40 shadow-violet-500/25'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {isPremium ? 'Deactivate Core / Pro (Dev)' : 'Upgrade to Core (Activate Pro)'}
        </button>

        <p className="mt-3 text-center text-[11px] text-muted-foreground/50 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Dev mode — toggle persists in browser storage
        </p>
      </div>
    </div>
  );
}
