import React, { useState } from 'react';
import { ReportTarget } from '../types';
import { REPORT_REASONS } from '../data/constants';
import { ShieldAlert, X } from 'lucide-react';

interface ReportListingModalProps {
  target: ReportTarget | null;
  country: string;
  onClose: () => void;
  onSubmit: (target: ReportTarget, reason: string) => void;
}

export function ReportListingModal({
  target,
  country,
  onClose,
  onSubmit,
}: ReportListingModalProps) {
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(target, reason);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-listing-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md rounded-3xl border border-red-500/20 bg-card p-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close report dialog"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/25 text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 id="report-listing-title" className="font-display text-base font-bold text-foreground">
              Report Listing
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
              {target.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Select reason for Trust & Safety review
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-red-500/40 bg-red-500/10 text-red-200'
                      : 'border-border/40 bg-muted/20 text-foreground/80 hover:bg-muted/40'
                  }`}
                >
                  <span>{r}</span>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-red-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border/50 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-semibold text-red-200"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
