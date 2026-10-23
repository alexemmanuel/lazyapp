import React, { useState, useEffect, useRef } from 'react';
import { usePremium } from '../context/PremiumContext';
import {
  PANTRY_PRESETS,
  COOK_LOADING_MESSAGES,
  findRecipeForIngredients,
} from '../data/constants';
import { Recipe } from '../types';
import {
  UtensilsCrossed,
  Sparkles,
  Plus,
  X,
  Clock,
  Users,
  CheckCircle,
  RotateCcw,
  ChefHat,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function CookPage() {
  const { isPremium, openUpgrade } = usePremium();
  const maxIngredients = isPremium ? 6 : 3;

  const [ingredients, setIngredients] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cookIngredients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputVal, setInputVal] = useState(() => {
    try {
      return localStorage.getItem('cookInput') || '';
    } catch {
      return '';
    }
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'result'>('idle');
  const [loadingStep, setLoadingStep] = useState(0);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync localStorage
  useEffect(() => {
    if (status === 'idle') {
      try {
        localStorage.setItem('cookIngredients', JSON.stringify(ingredients));
        localStorage.setItem('cookInput', inputVal);
      } catch {
        // ignore
      }
    }
  }, [ingredients, inputVal, status]);

  // Listen for AI dispatch
  useEffect(() => {
    const handleAiIngredients = (e: Event) => {
      const custom = e as CustomEvent<{ ingredients?: string[] }>;
      const incoming = (custom.detail?.ingredients ?? []).map((i) => i.trim()).filter(Boolean);
      if (incoming.length > 0) {
        setIngredients((prev) => {
          const merged = [...new Set([...prev, ...incoming])].slice(0, maxIngredients);
          const found = findRecipeForIngredients(merged);
          setRecipe(found);
          setCompletedSteps(new Array(found.steps.length).fill(false));
          setStatus('result');
          return merged;
        });
        setInputVal('');
      }
    };

    try {
      const savedAi = localStorage.getItem('lazyai_cook_ingredients');
      if (savedAi) {
        localStorage.removeItem('lazyai_cook_ingredients');
        const parsed = JSON.parse(savedAi);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...new Set(parsed)].slice(0, maxIngredients);
          setIngredients(merged);
          const found = findRecipeForIngredients(merged);
          setRecipe(found);
          setCompletedSteps(new Array(found.steps.length).fill(false));
          setStatus('result');
        }
      }
    } catch {
      // ignore
    }

    window.addEventListener('lazyai:ingredients', handleAiIngredients);
    return () => window.removeEventListener('lazyai:ingredients', handleAiIngredients);
  }, [maxIngredients]);

  const addIngredient = (item: string) => {
    const clean = item.trim();
    if (!clean) return;
    if (ingredients.length >= maxIngredients) {
      if (!isPremium) openUpgrade();
      return;
    }
    if (!ingredients.some((i) => i.toLowerCase() === clean.toLowerCase())) {
      setIngredients((prev) => [...prev, clean]);
      setInputVal('');
      setStatus('idle');
      setRecipe(null);
      inputRef.current?.focus();
    }
  };

  const removeIngredient = (item: string) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
    setStatus('idle');
    setRecipe(null);
  };

  const clearAll = () => {
    setIngredients([]);
    setInputVal('');
    setStatus('idle');
    setRecipe(null);
    setCompletedSteps([]);
    try {
      localStorage.removeItem('cookIngredients');
      localStorage.removeItem('cookInput');
    } catch {
      // ignore
    }
  };

  const generateRecipe = () => {
    if (ingredients.length === 0) return;
    setStatus('loading');
    setLoadingStep(0);
    setRecipe(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < COOK_LOADING_MESSAGES.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
      }
    }, 480);

    setTimeout(() => {
      clearInterval(interval);
      const rec = findRecipeForIngredients(ingredients);
      setRecipe(rec);
      setCompletedSteps(new Array(rec.steps.length).fill(false));
      setStatus('result');
    }, COOK_LOADING_MESSAGES.length * 480 + 200);
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      if (next.every(Boolean)) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const allCompleted = completedSteps.length > 0 && completedSteps.every(Boolean);

  // Unselected pantry items
  const availablePantry = PANTRY_PRESETS.filter(
    (p) => !ingredients.some((i) => i.toLowerCase() === p.value.toLowerCase())
  );

  return (
    <div className="min-h-full p-4 sm:p-7 md:p-10 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Lazy Cook
              </h1>
              {isPremium ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-[10px] font-bold text-violet-300">
                  <Sparkles className="h-2.5 w-2.5" /> 6 Ingredients
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-muted/40 border border-border text-[10px] font-semibold text-muted-foreground">
                  3 Ingredients (Free)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tell us what is in your fridge. Get a real meal ready in under 10 minutes.
            </p>
          </div>
        </div>

        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Left Column: Ingredient selection */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-card-border bg-card p-5 shadow-xl shadow-black/20">
            <label className="block text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
              <span>Your Fridge / Pantry</span>
              <span className="text-[11px] text-muted-foreground">
                {ingredients.length}/{maxIngredients} items
              </span>
            </label>

            {/* Chips Box */}
            <div className="p-3 min-h-[80px] rounded-2xl border border-border/50 bg-muted/20 flex flex-wrap gap-2 items-center">
              {ingredients.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(item)}
                    className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-emerald-500/30 text-emerald-200"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}

              {ingredients.length < maxIngredients && (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={ingredients.length === 0 ? 'Type an ingredient...' : 'Add more...'}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addIngredient(inputVal);
                    }
                  }}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-1"
                />
              )}
            </div>

            {/* Quick Add presets */}
            <div className="mt-4">
              <span className="block text-[11px] font-medium text-muted-foreground mb-2">
                Quick pick pantry basics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availablePantry.slice(0, 12).map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => addIngredient(p.value)}
                    className="px-2.5 py-1 rounded-full border border-border/40 bg-muted/30 text-[11px] text-foreground/80 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              disabled={ingredients.length === 0 || status === 'loading'}
              onClick={generateRecipe}
              className="mt-6 w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ChefHat className="h-4 w-4" />
              {status === 'loading' ? 'Generating Recipe...' : 'Cook Something Fast'}
            </button>
          </div>

          {!isPremium && (
            <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-violet-300">Want 6 ingredients?</p>
                <p className="text-[11px] text-muted-foreground">
                  Ultra Lazy Pro unlocks complex meals and custom pantry routing.
                </p>
              </div>
              <button
                type="button"
                onClick={openUpgrade}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold"
              >
                Upgrade
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recipe or loading */}
        <div>
          {status === 'idle' && (
            <div className="rounded-3xl border border-border/40 bg-card/40 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 border border-border/60 text-muted-foreground mb-4">
                <Flame className="h-7 w-7" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Zero Thinking Required
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Pick 2 or 3 ingredients on the left. We will show you how to turn them into an actual meal with minimal pan-washing.
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="rounded-3xl border border-emerald-500/20 bg-card/60 p-12 text-center animate-pulse-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 mb-4 animate-spin">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                {COOK_LOADING_MESSAGES[loadingStep] || 'Pretending we are chefs...'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Calculating least amount of dishes possible...
              </p>
            </div>
          )}

          {status === 'result' && recipe && (
            <div className="rounded-3xl border border-emerald-500/30 bg-card p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 space-y-6">
              {/* Recipe Title & Stats */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{recipe.emoji}</span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                      {recipe.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        {recipe.prepMins} minutes
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-emerald-400" />
                        {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-3">
                  {recipe.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fun Fact quote */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs italic text-foreground/80">
                "{recipe.funFact}"
              </div>

              {/* Steps Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Foolproof Steps ({completedSteps.filter(Boolean).length}/{recipe.steps.length} done)
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {recipe.steps.map((step, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStep(idx)}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer ${
                        completedSteps[idx]
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 line-through'
                          : 'bg-card border-border/50 text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0 text-[10px] font-bold border transition-colors ${
                          completedSteps[idx]
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'border-muted-foreground/40 text-muted-foreground'
                        }`}
                      >
                        {completedSteps[idx] ? '✓' : idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{step}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Completion Banner */}
              {allCompleted && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h4 className="font-display text-sm font-bold text-emerald-300">
                      You actually cooked!
                    </h4>
                    <p className="text-xs text-emerald-400/80 mt-0.5">
                      Against all odds. Genuinely proud of you. Eat straight from the pan!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
