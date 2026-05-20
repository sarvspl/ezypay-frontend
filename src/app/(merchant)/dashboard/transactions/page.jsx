'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { getProvider, labelVariant } from '@/lib/providers';
import { formatMoney } from '@/lib/money';
import { useMerchant } from '../layout';

const proofUrl = (t) => (t.proof_image_url ? `${API_BASE}${t.proof_image_url}` : null);

export default function TransactionsPage() {
  const router = useRouter();
  const { merchant } = useMerchant();
  const currency = merchant?.currency || 'USD';
  const [txs, setTxs] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const params = {};
      if (tab !== 'all') params.status = tab;
      if (q.trim())      params.q = q.trim();
      const r = await api.merchantListTransactions(token, params);
      setTxs(r.transactions);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };

  // Reload on filter change (debounced for search)
  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q, tab]); // eslint-disable-line

  // Refresh every 5s so APK/manual updates show up
  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const counts = useMemo(() => {
    const all = txs || [];
    return {
      all:     all.length,
      pending: all.filter((t) => t.status === 'pending').length,
      success: all.filter((t) => t.status === 'success').length,
      failed:  all.filter((t) => t.status === 'failed').length,
    };
  }, [txs]);

  // Manual resolve modal state. Opening it doesn't fire the API call yet —
  // gives the merchant a chance to add an optional reason / note before
  // committing.
  const [resolveTarget, setResolveTarget] = useState(null); // { tx, result }
  const [resolveReason, setResolveReason] = useState('');
  const [resolveBusy, setResolveBusy]     = useState(false);
  const [resolveError, setResolveError]   = useState(null);

  // Full-screen view of a payment screenshot.
  const [lightbox, setLightbox] = useState(null); // image URL

  const onResolve = (tx, result) => {
    setResolveTarget({ tx, result });
    setResolveReason('');
    setResolveError(null);
  };

  const submitResolve = async () => {
    if (!resolveTarget) return;
    setResolveBusy(true);
    setResolveError(null);
    try {
      const token = merchantAuth.get();
      await api.merchantResolveTransaction(
        token,
        resolveTarget.tx.id,
        resolveTarget.result,
        resolveReason.trim() || null,
      );
      setResolveTarget(null);
      setResolveReason('');
      load();
    } catch (e) {
      setResolveError(e.message || 'Failed to update');
    } finally {
      setResolveBusy(false);
    }
  };

  const TABS = [
    { key: 'all',     label: 'All',     count: counts.all,     tone: 'slate'  },
    { key: 'pending', label: 'Pending', count: counts.pending, tone: 'amber'  },
    { key: 'success', label: 'Done',    count: counts.success, tone: 'emerald'},
    { key: 'failed',  label: 'Failed',  count: counts.failed,  tone: 'rose'   },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
        <p className="text-sm text-slate-600 mt-1">
          Every customer payment attempt, live. Pending rows can be resolved manually while your APK is being built.
        </p>
      </div>

      <div className="card p-3 sm:p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            className="input pl-10"
            placeholder="Search TxnID or Order ID…"
          />
        </div>

        <div className="grid grid-cols-4 gap-1 bg-slate-100 rounded-lg p-1 sm:flex sm:flex-wrap">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  active ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}>
                {t.label}
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${active ? toneClasses(t.tone) : 'text-slate-400'}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>
      )}

      {/* Desktop table (md+) */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">TxnID</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Method</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Amount</th>
                <th className="px-4 sm:px-6 py-3 font-medium">From</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Order</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Proof</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Date</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!txs && (
                <tr><td colSpan={9} className="py-10 text-center text-slate-400">Loading…</td></tr>
              )}
              {txs && txs.length === 0 && (
                <tr><td colSpan={9} className="py-16">
                  <EmptyState filtered={!!(q || tab !== 'all')} onClear={() => { setQ(''); setTab('all'); }} />
                </td></tr>
              )}
              {txs && txs.map((t) => {
                const p = getProvider(t.provider);
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 sm:px-6 py-3 font-mono text-xs">{t.txnid_submitted}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-md ${p.bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{p.initials}</span>
                        <div className="min-w-0">
                          <div className="text-slate-900 font-medium flex items-center gap-1.5 flex-wrap">
                            <span>{p.name}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">{labelVariant(t.variant)}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {t.account_number}
                            {t.gateway_label && <span className="text-slate-400"> · {t.gateway_label}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-semibold whitespace-nowrap">{formatMoney(t.amount, currency)}</td>
                    <td className="px-4 sm:px-6 py-3">
                      {t.payer_name || t.payer_phone || t.sender_account ? (
                        <div className="min-w-0">
                          {t.payer_name && <div className="text-slate-900 truncate max-w-[180px]" title={t.payer_name}>{t.payer_name}</div>}
                          {t.payer_phone && <div className="text-xs text-slate-500 font-mono">{t.payer_phone}</div>}
                          {t.sender_account && (
                            <div className="text-xs text-slate-500 font-mono" title="Sender number entered by customer">
                              <span className="text-slate-400">paid from </span>{t.sender_account}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-slate-700">
                      <div className="min-w-0">
                        <div className="truncate max-w-[220px]" title={t.order_id || ''}>
                          {t.order_id || <span className="text-slate-400 italic">—</span>}
                        </div>
                        {(() => {
                          let src = t.brand_domain || '';
                          try {
                            const u = new URL(t.redirect_url);
                            const port = (u.port && u.port !== '80' && u.port !== '443') ? ':' + u.port : '';
                            src = u.hostname + port;
                          } catch {}
                          return src ? (
                            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]" title={src}>
                              {src}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <StatusBadge status={t.status} source={t.result_source} />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {proofUrl(t) ? (
                        <button type="button" onClick={() => setLightbox(proofUrl(t))} className="block" title="View payment screenshot">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={proofUrl(t)} alt="proof" className="w-10 h-10 rounded object-cover border border-slate-200 hover:ring-2 hover:ring-brand-400 transition" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      {t.status === 'pending' ? (
                        <div className="inline-flex gap-1">
                          <button onClick={() => onResolve(t, 'success')}
                            className="rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1.5">
                            Mark Paid
                          </button>
                          <button onClick={() => onResolve(t, 'failed')}
                            className="rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1.5">
                            Mark Failed
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards (< md) */}
      <div className="md:hidden space-y-3">
        {!txs && (
          <div className="card p-10 text-center text-slate-400">Loading…</div>
        )}
        {txs && txs.length === 0 && (
          <div className="card p-12">
            <EmptyState filtered={!!(q || tab !== 'all')} onClear={() => { setQ(''); setTab('all'); }} />
          </div>
        )}
        {txs && txs.map((t) => {
          const p = getProvider(t.provider);
          let src = t.brand_domain || '';
          try {
            const u = new URL(t.redirect_url);
            const port = (u.port && u.port !== '80' && u.port !== '443') ? ':' + u.port : '';
            src = u.hostname + port;
          } catch {}
          return (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-9 h-9 rounded-md ${p.bg} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{p.initials}</span>
                  <div className="min-w-0">
                    <div className="text-slate-900 font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{p.name}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">{labelVariant(t.variant)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{t.account_number}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-slate-900 whitespace-nowrap">{formatMoney(t.amount, currency)}</div>
                  <div className="mt-1"><StatusBadge status={t.status} source={t.result_source} /></div>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-y-1.5 gap-x-2 text-xs">
                <dt className="text-slate-500">TxnID</dt>
                <dd className="col-span-2 font-mono text-slate-800 truncate">{t.txnid_submitted}</dd>
                <dt className="text-slate-500">Order</dt>
                <dd className="col-span-2 text-slate-800 truncate">
                  {t.order_id || <span className="text-slate-400 italic">—</span>}
                  {src && <span className="text-slate-400"> · {src}</span>}
                </dd>
                {(t.payer_name || t.payer_phone) && (
                  <>
                    <dt className="text-slate-500">From</dt>
                    <dd className="col-span-2 text-slate-800 truncate">
                      {t.payer_name || ''}{t.payer_name && t.payer_phone ? ' · ' : ''}
                      {t.payer_phone && <span className="font-mono">{t.payer_phone}</span>}
                    </dd>
                  </>
                )}
                {t.sender_account && (
                  <>
                    <dt className="text-slate-500">Paid from</dt>
                    <dd className="col-span-2 font-mono text-slate-800 truncate">{t.sender_account}</dd>
                  </>
                )}
                <dt className="text-slate-500">Date</dt>
                <dd className="col-span-2 text-slate-700">
                  {new Date(t.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </dd>
                {proofUrl(t) && (
                  <>
                    <dt className="text-slate-500">Screenshot</dt>
                    <dd className="col-span-2">
                      <button type="button" onClick={() => setLightbox(proofUrl(t))}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofUrl(t)} alt="proof" className="w-16 h-16 rounded object-cover border border-slate-200" />
                      </button>
                    </dd>
                  </>
                )}
              </dl>

              {t.status === 'pending' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => onResolve(t, 'success')}
                    className="flex-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-2">
                    Mark Paid
                  </button>
                  <button onClick={() => onResolve(t, 'failed')}
                    className="flex-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-2">
                    Mark Failed
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/80"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Payment screenshot"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}

      {resolveTarget && (
        <ResolveModal
          tx={resolveTarget.tx}
          result={resolveTarget.result}
          reason={resolveReason}
          onReasonChange={setResolveReason}
          busy={resolveBusy}
          error={resolveError}
          onCancel={() => { setResolveTarget(null); setResolveReason(''); setResolveError(null); }}
          onConfirm={submitResolve}
        />
      )}
    </div>
  );
}

function ResolveModal({ tx, result, reason, onReasonChange, busy, error, onCancel, onConfirm }) {
  const isSuccess = result === 'success';
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isSuccess ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">
              {isSuccess ? 'Mark as Paid?' : 'Mark as Failed?'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              TxnID <code className="text-xs font-mono">{tx.txnid_submitted}</code>{tx.order_id ? <> · Order <code className="text-xs font-mono">{tx.order_id}</code></> : null}
            </p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-slate-700 mt-5 mb-1 uppercase tracking-wider">
          Reason / note <span className="text-slate-400 font-normal normal-case">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder={isSuccess
            ? 'e.g. "Confirmed via WhatsApp message from customer"'
            : 'e.g. "Customer never paid, abandoned cart"'}
          className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-${isSuccess ? 'emerald' : 'rose'}-500 focus:ring-${isSuccess ? 'emerald' : 'rose'}-500/30`}
          disabled={busy}
          maxLength={240}
        />
        <div className="text-xs text-slate-400 mt-1 text-right">{reason.length}/240</div>

        {error && <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {busy ? 'Working…' : (isSuccess ? 'Confirm Paid' : 'Confirm Failed')}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filtered, onClear }) {
  if (filtered) {
    return (
      <div className="text-center">
        <SearchIcon className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
        <p className="text-sm mt-2 text-slate-500">No transactions match your filter.</p>
        <button onClick={onClear} className="mt-3 text-sm text-brand-600 hover:underline">Clear filter</button>
      </div>
    );
  }
  return (
    <div className="text-center text-slate-400">
      <InboxIcon className="w-10 h-10 mx-auto opacity-40" />
      <p className="text-base mt-2 font-medium text-slate-600">No transactions yet</p>
      <p className="text-sm mt-1 max-w-md mx-auto">
        Once a customer submits a payment through your checkout link, they&apos;ll appear here in real time.
      </p>
    </div>
  );
}

function StatusBadge({ status, source }) {
  const map = {
    success: { label: 'Done',    cls: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pending', cls: 'bg-amber-100   text-amber-700'   },
    failed:  { label: 'Failed',  cls: 'bg-rose-100    text-rose-700'    },
  };
  const s = map[status] || map.pending;
  const sourceLabel =
    source === 'manual'      ? 'manual' :
    source === 'sms_inbound' ? 'auto' :
    source === 'apk'         ? 'apk' :
    null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.cls}`}>{s.label}</span>
      {sourceLabel && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{sourceLabel}</span>}
    </span>
  );
}

function toneClasses(tone) {
  switch (tone) {
    case 'emerald': return 'bg-emerald-100 text-emerald-700';
    case 'amber':   return 'bg-amber-100 text-amber-700';
    case 'rose':    return 'bg-rose-100 text-rose-700';
    default:        return 'bg-slate-100 text-slate-700';
  }
}

function SearchIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function InboxIcon({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
}
