'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import ConsoleShell from '@/components/console/ConsoleShell';

export default function ConsoleMerchantsPage() {
  const router = useRouter();
  const ready = useGuard('admin');

  const [merchants, setMerchants] = useState(null);
  const [stats, setStats]         = useState(null);   // server-computed stats over the filter
  const [total, setTotal]         = useState(0);
  const [error, setError]         = useState(null);
  const [query, setQuery]         = useState('');
  const [filter, setFilter]       = useState('all'); // all | active | suspended
  const [page, setPage]           = useState(0);     // 0-indexed
  const LIMIT = 20;
  const [suspendTarget, setSuspendTarget]   = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [walletTarget, setWalletTarget]     = useState(null);
  const [working, setWorking]               = useState(false);
  const [actionError, setActionError]       = useState(null);

  // Debounce search input so we don't hammer the API on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to first page whenever filter / search changes.
  useEffect(() => { setPage(0); }, [filter, debouncedQuery]);

  const reload = () => {
    const token = adminAuth.get();
    const params = { limit: LIMIT, offset: page * LIMIT };
    if (debouncedQuery) params.q = debouncedQuery;
    if (filter !== 'all') params.filter = filter;
    return api.adminListMerchants(token, params)
      .then((r) => { setMerchants(r.merchants); setStats(r.stats); setTotal(r.total); })
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else setError(e.message);
      });
  };

  useEffect(() => { if (ready) reload(); /* eslint-disable-next-line */ }, [ready, debouncedQuery, filter, page]);

  // The list rendering uses `merchants` directly now — server-side pagination,
  // filter, and search are applied by the backend.
  const filtered = merchants || [];

  const doSuspend = async (reason, forceUnbind) => {
    setWorking(true); setActionError(null);
    try {
      const token = adminAuth.get();
      await api.adminSuspendMerchant(token, suspendTarget.id, { reason, force_unbind: forceUnbind });
      setSuspendTarget(null);
      await reload();
    } catch (e) {
      setActionError(e.message || 'Failed to suspend');
    } finally { setWorking(false); }
  };

  const doActivate = async () => {
    setWorking(true); setActionError(null);
    try {
      const token = adminAuth.get();
      await api.adminUnsuspendMerchant(token, activateTarget.id);
      setActivateTarget(null);
      await reload();
    } catch (e) {
      setActionError(e.message || 'Failed to activate');
    } finally { setWorking(false); }
  };

  const doAdjustWallet = async (amount, note) => {
    setWorking(true); setActionError(null);
    try {
      const token = adminAuth.get();
      await api.adminAdjustWallet(token, walletTarget.id, { amount, note });
      setWalletTarget(null);
      await reload();
    } catch (e) {
      setActionError(e.message || 'Failed to adjust wallet');
    } finally { setWorking(false); }
  };

  if (!ready) return null;

  return (
    <ConsoleShell
      action={
        <Link href="/console/merchants/new" className="btn-primary !py-2">
          + Create merchant
        </Link>
      }
    >
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Merchants</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Every registered account in one place. Suspend, reactivate, or open a profile for full detail.
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total merchants" value={stats.total}     tone="slate"   />
          <StatCard label="Active"          value={stats.active}    tone="emerald" />
          <StatCard label="Suspended"       value={stats.suspended} tone="rose"    />
          <StatCard label="Wallet balance"  value={`₹${Number(stats.wallet_sum || 0).toFixed(2)}`} tone="brand" subdued />
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, username, domain…"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
          />
        </div>
        <div className="inline-flex bg-slate-100 rounded-lg p-1 self-start">
          {[
            ['all',       'All',       stats?.total],
            ['active',    'Active',    stats?.active],
            ['suspended', 'Suspended', stats?.suspended],
          ].map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                filter === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
              {typeof count === 'number' && (
                <span className={`ml-1.5 text-xs ${filter === key ? 'text-slate-500' : 'text-slate-400'}`}>{count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {!merchants && !error && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          Loading…
        </div>
      )}

      {merchants && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="text-slate-700 font-semibold">
            {query || filter !== 'all' ? 'No merchants match this filter.' : 'No merchants yet.'}
          </div>
          {!(query || filter !== 'all') && (
            <Link href="/console/merchants/new" className="inline-block mt-3 text-brand-600 hover:underline font-medium">Create the first one →</Link>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Merchant</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Domain</th>
                <th className="text-left px-4 py-3 font-medium">Mobile</th>
                <th className="text-right px-4 py-3 font-medium">Wallet</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="group hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/console/merchants/${m.id}`} className="flex items-center gap-3 group/avatar">
                      <Avatar name={m.name} />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 group-hover/avatar:text-brand-700 truncate">{m.name}</div>
                        <div className="text-xs text-slate-500 truncate">{m.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill suspended={m.is_suspended} reason={m.suspended_reason} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{m.domain}</td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{m.mobile}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-slate-900 font-semibold tabular-nums">
                        ₹{Number(m.wallet_balance || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => setWalletTarget(m)}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 px-2 py-0.5 rounded-md hover:bg-brand-50 whitespace-nowrap border border-brand-100"
                      >Top up</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {m.is_suspended ? (
                      <button
                        onClick={() => setActivateTarget(m)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-md hover:bg-emerald-50 whitespace-nowrap"
                      >Activate</button>
                    ) : (
                      <button
                        onClick={() => setSuspendTarget(m)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-md hover:bg-rose-50 whitespace-nowrap"
                      >Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination footer — only when we actually have more than one page */}
      {merchants && total > LIMIT && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-slate-500">
            Showing <strong>{page * LIMIT + 1}</strong>–<strong>{Math.min(total, (page + 1) * LIMIT)}</strong> of <strong>{total}</strong>
          </div>
          <div className="inline-flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >← Prev</button>
            <span className="px-3 py-1.5 text-slate-700">
              Page {page + 1} of {Math.max(1, Math.ceil(total / LIMIT))}
            </span>
            <button
              disabled={(page + 1) * LIMIT >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >Next →</button>
          </div>
        </div>
      )}

      {suspendTarget && (
        <SuspendModal
          merchant={suspendTarget}
          working={working}
          error={actionError}
          onCancel={() => { setSuspendTarget(null); setActionError(null); }}
          onConfirm={doSuspend}
        />
      )}
      {activateTarget && (
        <ActivateModal
          merchant={activateTarget}
          working={working}
          error={actionError}
          onCancel={() => { setActivateTarget(null); setActionError(null); }}
          onConfirm={doActivate}
        />
      )}
      {walletTarget && (
        <WalletAdjustModal
          merchant={walletTarget}
          working={working}
          error={actionError}
          onCancel={() => { setWalletTarget(null); setActionError(null); }}
          onConfirm={doAdjustWallet}
        />
      )}
    </ConsoleShell>
  );
}

/* ─── Wallet adjustment modal ─── */
function WalletAdjustModal({ merchant, working, error, onCancel, onConfirm }) {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('credit'); // 'credit' | 'debit'
  const [note, setNote] = useState('');

  const parsed = Number(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const signed = direction === 'credit' ? parsed : -parsed;
  const newBal = Number(merchant.wallet_balance || 0) + (valid ? signed : 0);
  const tooLow = direction === 'debit' && valid && newBal < 0;

  const submit = (e) => {
    e?.preventDefault?.();
    if (!valid || tooLow || working) return;
    onConfirm(signed, note.trim());
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 text-lg font-bold">
            ₹
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">{merchant.name}</div>
            <div className="text-xs text-slate-500">
              Current balance: ₹{Number(merchant.wallet_balance || 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="inline-flex bg-slate-100 rounded-lg p-1 mb-3">
          {[['credit', 'Credit'], ['debit', 'Debit']].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setDirection(k)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                direction === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >{label}</button>
          ))}
        </div>

        <label className="block text-xs font-medium text-slate-600 mb-1">Amount (BDT)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 tabular-nums"
        />

        <label className="block text-xs font-medium text-slate-600 mb-1 mt-3">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="e.g. Promotional credit / Manual reconciliation"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
        />

        {valid && (
          <div className="mt-3 text-xs text-slate-600">
            New balance will be{' '}
            <span className={`font-semibold tabular-nums ${tooLow ? 'text-rose-700' : 'text-slate-900'}`}>
              ₹{newBal.toFixed(2)}
            </span>
            {tooLow && <span className="text-rose-600"> · insufficient for debit</span>}
          </div>
        )}

        {error && (
          <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={working}
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
          >Cancel</button>
          <button
            type="submit"
            disabled={!valid || tooLow || working}
            className="btn-primary !py-2 disabled:opacity-50"
          >{working ? 'Saving…' : direction === 'credit' ? 'Credit wallet' : 'Debit wallet'}</button>
        </div>
      </form>
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, tone = 'slate', subdued }) {
  const tones = {
    slate:   'text-slate-900',
    emerald: 'text-emerald-700',
    rose:    'text-rose-700',
    brand:   'text-brand-700',
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${subdued ? 'text-slate-900' : tones[tone]}`}>{value}</div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  // Stable color per name
  const hash = Array.from(name || '').reduce((a, c) => a + c.charCodeAt(0), 0);
  const palettes = [
    'bg-brand-100 text-brand-700',
    'bg-emerald-100 text-emerald-700',
    'bg-indigo-100 text-indigo-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
  ];
  const color = palettes[hash % palettes.length];
  return (
    <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${color}`}>
      {initials || '?'}
    </span>
  );
}

function StatusPill({ suspended, reason }) {
  if (suspended) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold"
        title={reason || ''}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      Active
    </span>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

/* ─── Suspend modal ─── */
function SuspendModal({ merchant, working, error, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [forceUnbind, setForceUnbind] = useState(false);
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 9v6m4-6v6M4.93 19.07A10 10 0 1 1 19.07 4.93 10 10 0 0 1 4.93 19.07z"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">Suspend merchant</h2>
            <p className="mt-1 text-sm text-slate-600">
              Block <span className="font-semibold">{merchant.name}</span> from logging in or creating new sessions. In-flight checkouts complete normally.
            </p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-slate-700 mt-5 mb-1 uppercase tracking-wider">Reason (optional)</label>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Shown to the merchant on their next login attempt"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          disabled={working}
        />

        <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={forceUnbind}
            onChange={(e) => setForceUnbind(e.target.checked)}
            disabled={working}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Also unbind all devices</span>
            <span className="block text-xs text-slate-500 mt-0.5">Force every bound phone to re-bind after reactivation. Use for hard suspensions only.</span>
          </span>
        </label>

        {error && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={working} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          <button
            onClick={() => onConfirm(reason.trim() || null, forceUnbind)}
            disabled={working}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            {working ? 'Suspending…' : 'Suspend merchant'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivateModal({ merchant, working, error, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">Activate merchant</h2>
            <p className="mt-1 text-sm text-slate-600">
              Restore access for <span className="font-semibold">{merchant.name}</span>. They can log in immediately.
            </p>
            {merchant.suspended_reason && (
              <p className="mt-3 text-xs text-slate-500">Previously suspended: <span className="italic">"{merchant.suspended_reason}"</span></p>
            )}
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={working} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={working}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            {working ? 'Activating…' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
}
