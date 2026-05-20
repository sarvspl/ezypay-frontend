'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import ConsoleShell from '@/components/console/ConsoleShell';

const LIMIT = 20;

export default function ConsoleTicketsPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [tickets, setTickets] = useState(null);
  const [stats, setStats]     = useState(null);
  const [total, setTotal]     = useState(0);
  const [error, setError]     = useState(null);
  const [query, setQuery]     = useState('');
  const [filter, setFilter]   = useState('all'); // all | open | in_progress | resolved | closed
  const [page, setPage]       = useState(0);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(0); }, [filter, debouncedQuery]);

  const reload = () => {
    if (!ready) return;
    const token = adminAuth.get();
    const params = { limit: LIMIT, offset: page * LIMIT };
    if (debouncedQuery) params.q = debouncedQuery;
    if (filter !== 'all') params.status = filter;
    return api.adminListTickets(token, params)
      .then((r) => { setTickets(r.tickets); setStats(r.stats); setTotal(r.total); })
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else setError(e.message);
      });
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [ready, page, filter, debouncedQuery]);

  if (!ready) return null;

  const TABS = [
    { key: 'all',         label: 'All',         count: stats?.total       ?? 0, tone: 'slate'   },
    { key: 'open',        label: 'Open',        count: stats?.open        ?? 0, tone: 'amber'   },
    { key: 'in_progress', label: 'In progress', count: stats?.in_progress ?? 0, tone: 'blue'    },
    { key: 'resolved',    label: 'Resolved',    count: stats?.resolved    ?? 0, tone: 'emerald' },
    { key: 'closed',      label: 'Closed',      count: stats?.closed      ?? 0, tone: 'slate'   },
  ];

  return (
    <ConsoleShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Support tickets</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Every ticket raised by your merchants. Click one to read the thread and reply.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Stat label="Total"        value={stats.total}       tone="slate"   />
          <Stat label="Open"         value={stats.open}        tone="amber"   />
          <Stat label="In progress"  value={stats.in_progress} tone="blue"    />
          <Stat label="Resolved"     value={stats.resolved}    tone="emerald" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticket #, subject, merchant…"
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-100 rounded-lg p-1">
          {TABS.map((t) => {
            const active = filter === t.key;
            return (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  active ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}>
                {t.label}
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${active ? toneClasses(t.tone) : 'text-slate-400'}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!tickets && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">Loading…</div>
      )}
      {tickets && tickets.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          {query || filter !== 'all' ? 'No tickets match this filter.' : 'No tickets yet.'}
        </div>
      )}
      {tickets && tickets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {tickets.map((t) => (
            <Link key={t.id} href={`/console/tickets/${t.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <StatusDot status={t.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{t.ticket_number}</span>
                    <StatusPill status={t.status} />
                    {t.priority !== 'normal' && <PriorityPill priority={t.priority} />}
                    {t.last_reply_by === 'merchant' && t.status !== 'closed' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">
                        Awaiting reply
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-semibold text-slate-900 truncate">{t.subject}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {t.merchant_name} · {t.merchant_email}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {t.message_count} {t.message_count === 1 ? 'message' : 'messages'}
                    {t.last_reply_at && (
                      <> · Last reply {new Date(t.last_reply_at).toLocaleString([], { timeZone: 'Asia/Dhaka', dateStyle: 'short', timeStyle: 'short' })} by {t.last_reply_by}</>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > LIMIT && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
          <div className="text-slate-500 text-center sm:text-left">
            Showing <strong>{page * LIMIT + 1}</strong>–<strong>{Math.min(total, (page + 1) * LIMIT)}</strong> of <strong>{total}</strong>
            <span className="sm:hidden"> · Page <strong>{page + 1}</strong> of <strong>{Math.max(1, Math.ceil(total / LIMIT))}</strong></span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex-1 sm:flex-none px-4 py-2 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 whitespace-nowrap"
            >← Prev</button>
            <span className="hidden sm:inline px-3 py-1.5 text-slate-700 whitespace-nowrap">
              Page {page + 1} of {Math.max(1, Math.ceil(total / LIMIT))}
            </span>
            <button
              disabled={(page + 1) * LIMIT >= total}
              onClick={() => setPage((p) => p + 1)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 whitespace-nowrap"
            >Next →</button>
          </div>
        </div>
      )}
    </ConsoleShell>
  );
}

function Stat({ label, value, tone }) {
  const tones = {
    slate:   'text-slate-900',
    emerald: 'text-emerald-700',
    amber:   'text-amber-700',
    blue:    'text-blue-700',
    rose:    'text-rose-700',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-2xl font-bold mt-0.5 ${tones[tone] || tones.slate}`}>{value}</div>
    </div>
  );
}

function StatusDot({ status }) {
  const map = {
    open:        'bg-amber-400',
    in_progress: 'bg-blue-500',
    resolved:    'bg-emerald-500',
    closed:      'bg-slate-300',
  };
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${map[status] || 'bg-slate-300'}`} />;
}

function StatusPill({ status }) {
  const map = {
    open:        { label: 'Open',        cls: 'bg-amber-100 text-amber-700' },
    in_progress: { label: 'In progress', cls: 'bg-blue-100 text-blue-700' },
    resolved:    { label: 'Resolved',    cls: 'bg-emerald-100 text-emerald-700' },
    closed:      { label: 'Closed',      cls: 'bg-slate-200 text-slate-700' },
  };
  const s = map[status] || map.open;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function PriorityPill({ priority }) {
  const map = { low: 'bg-slate-100 text-slate-600', high: 'bg-rose-100 text-rose-700' };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[priority] || 'bg-slate-100 text-slate-600'}`}>
    {priority.toUpperCase()}
  </span>;
}

function toneClasses(tone) {
  switch (tone) {
    case 'emerald': return 'bg-emerald-100 text-emerald-700';
    case 'amber':   return 'bg-amber-100 text-amber-700';
    case 'blue':    return 'bg-blue-100 text-blue-700';
    case 'rose':    return 'bg-rose-100 text-rose-700';
    default:        return 'bg-slate-100 text-slate-700';
  }
}

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
