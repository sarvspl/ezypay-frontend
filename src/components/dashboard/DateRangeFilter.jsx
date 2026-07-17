'use client';

import { RANGES, TZ_LABEL } from '@/lib/dates';

/**
 * Preset chips + a custom From/To pair, driven entirely by the parent's
 * {range, from, to} state so the parent owns what gets sent to the API.
 */
export default function DateRangeFilter({ range, from, to, onChange, className = '' }) {
  const pickRange = (key) => {
    const r = RANGES.find((x) => x.key === key);
    if (!r) return;
    const { from: f, to: t } = r.resolve();
    onChange({ range: key, from: f, to: t });
  };

  // Editing either box switches to custom mode. An inverted range (from > to)
  // is corrected rather than sent, since it could only ever return nothing.
  const editFrom = (v) => onChange({ range: 'custom', from: v, to: v && to && v > to ? v : to });
  const editTo   = (v) => onChange({ range: 'custom', to: v, from: v && from && v < from ? v : from });

  const active = !!(from || to);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 self-start">
        {RANGES.map((r) => (
          <button key={r.key} onClick={() => pickRange(r.key)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              range === r.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="date" value={from} max={to || undefined}
          onChange={(e) => editFrom(e.target.value)}
          aria-label="From date"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
        <span className="text-slate-400 text-xs">to</span>
        <input
          type="date" value={to} min={from || undefined}
          onChange={(e) => editTo(e.target.value)}
          aria-label="To date"
          className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {active && (
        <button onClick={() => pickRange('all')}
          className="text-xs text-slate-500 hover:text-slate-800 underline self-start sm:self-auto">
          Clear dates
        </button>
      )}

      <span className="text-xs text-slate-400 sm:ml-auto">Dates shown in {TZ_LABEL}</span>
    </div>
  );
}

function CalendarIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
