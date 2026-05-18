'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { formatMoney } from '@/lib/money';
import { useMerchant } from '../layout';
import SupportContactCard from '@/components/SupportContactCard';

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm">Loading…</div>}>
      <WalletPageBody />
    </Suspense>
  );
}

function WalletPageBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { merchant } = useMerchant();
  const currency = merchant?.currency || 'BDT';

  const [wallet, setWallet] = useState(null);
  const [recharges, setRecharges] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const reload = async () => {
    try {
      const token = merchantAuth.get();
      const [w, r] = await Promise.all([
        api.merchantGetWallet(token),
        api.merchantListRecharges(token),
      ]);
      setWallet(w);
      setRecharges(r.recharges || []);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };

  useEffect(() => { reload(); }, [router]);

  // Came back from the hosted checkout with ?topup=ok — show a toast and refresh.
  useEffect(() => {
    if (searchParams.get('topup') === 'ok') {
      setToast('Recharge submitted. It will appear below once verified.');
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const startRecharge = async (e) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setStartError('Enter a valid amount.');
      return;
    }
    setStarting(true);
    setStartError(null);
    try {
      const token = merchantAuth.get();
      const r = await api.merchantStartRecharge(token, amt);
      window.location.href = r.checkout_url;
    } catch (e) {
      setStartError(e.message || 'Failed to start recharge');
      setStarting(false);
    }
  };

  if (error) return <div className="text-rose-600 bg-rose-50 border border-rose-200 rounded p-3 text-sm">{error}</div>;
  if (!wallet) return <div className="text-slate-500 text-sm">Loading…</div>;

  const isEmpty = Number(wallet.balance) <= 0;
  const isLow   = !isEmpty && Number(wallet.balance) < 10; // soft heuristic until we expose the configured threshold

  return (
    <div className="space-y-6">
      {toast && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">
          {toast}
        </div>
      )}

      {/* Empty / low balance warning. Loud red banner at the top when the wallet is at zero
          (operations are paused), softer amber when balance is low but not yet blocked. */}
      {isEmpty && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-rose-900">Wallet empty — payments are paused</div>
            <div className="text-sm text-rose-800 mt-0.5">
              Your customers can't complete new payments and your bound APK is blocked until you top up.
              Click <strong>Add Balance</strong> below.
            </div>
          </div>
        </div>
      )}
      {isLow && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9"  x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-amber-900">Low wallet balance</div>
            <div className="text-sm text-amber-800 mt-0.5">
              Only {formatMoney(wallet.balance, currency)} remaining — top up soon to avoid interruption.
            </div>
          </div>
        </div>
      )}

      {/* Balance hero */}
      <section className="rounded-2xl p-6 sm:p-7 text-white bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 shadow-lg shadow-brand-500/20 relative overflow-hidden">
        <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">Wallet Balance</div>
            <div className="mt-1 text-4xl font-extrabold">{formatMoney(wallet.balance, currency)}</div>
          </div>
          <button
            onClick={() => { setShowAdd(true); setAmount(''); setStartError(null); }}
            className="rounded-full bg-white text-brand-700 hover:bg-slate-100 font-semibold px-5 py-2.5 text-sm shadow"
          >
            + Add Balance
          </button>
        </div>
      </section>

      {/* Recharge history */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Recharge history</h2>
        <p className="text-xs text-slate-500 mt-0.5">Recent top-ups, newest first.</p>

        {(!recharges || recharges.length === 0) ? (
          <p className="mt-6 text-sm text-slate-500 text-center py-10">
            No recharges yet. Click <strong>Add Balance</strong> above to top up.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="text-left text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2">When</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">TxnID</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recharges.map((r) => (
                  <tr key={r.session_id}>
                    <td className="py-3 text-slate-600">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-3 font-semibold">{formatMoney(r.amount, r.currency)}</td>
                    <td className="py-3 text-slate-700">{r.provider ? `${r.provider}${r.variant ? ' · ' + r.variant : ''}` : <span className="text-slate-400">—</span>}</td>
                    <td className="py-3 font-mono text-xs text-slate-700">{r.txnid_submitted || <span className="text-slate-400">—</span>}</td>
                    <td className="py-3 text-right"><StatusPill tx={r.tx_status} session={r.session_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ledger */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Wallet ledger</h2>
        <p className="text-xs text-slate-500 mt-0.5">Every credit and debit on your wallet.</p>
        {(!wallet.ledger || wallet.ledger.length === 0) ? (
          <p className="mt-6 text-sm text-slate-500 text-center py-6">No ledger entries yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {wallet.ledger.map((row) => {
              const credit = Number(row.amount) >= 0;
              return (
                <div key={row.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">{prettyKind(row.kind)}</div>
                    <div className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}{row.note ? ` · ${row.note}` : ''}</div>
                  </div>
                  <div className={`font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {credit ? '+' : ''}{formatMoney(Number(row.amount), currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add balance modal */}
      {showAdd && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900">Add wallet balance</h2>
            <p className="mt-1 text-sm text-slate-600">
              You'll be taken to a hosted checkout to pay via wallet (bKash / Nagad / etc.). After you submit the TxnID, the amount appears here once verified.
            </p>

            <form onSubmit={startRecharge} className="mt-5 space-y-4">
              <div>
                <label className="label">Amount</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {QUICK_AMOUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAmount(String(n))}
                      className={`px-3 py-1.5 text-sm rounded-md border ${String(amount) === String(n) ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'}`}
                    >
                      {formatMoney(n, currency)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="10"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="input"
                  required
                  autoFocus
                />
                <div className="text-xs text-slate-500 mt-1">Between {formatMoney(10, currency)} and {formatMoney(100000, currency)}.</div>
              </div>

              {startError && (
                <div className="space-y-3">
                  <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{startError}</div>
                  {/contact support/i.test(startError) && (
                    <SupportContactCard tone="rose" title="Contact support" />
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} disabled={starting} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
                <button type="submit" disabled={starting} className="btn-primary">
                  {starting ? 'Starting…' : 'Continue to checkout →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ tx, session }) {
  if (tx === 'success' || session === 'success')
    return <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold">Credited</span>;
  if (tx === 'failed')
    return <span className="inline-flex rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-[11px] font-semibold">Rejected</span>;
  if (session === 'expired')
    return <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[11px] font-semibold">Expired</span>;
  if (session === 'cancelled')
    return <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-semibold">Cancelled</span>;
  return <span className="inline-flex rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[11px] font-semibold">Pending</span>;
}

function prettyKind(k) {
  switch (k) {
    case 'topup':         return 'Wallet topup';
    case 'debit_verify':  return 'Verification charge';
    case 'refund':        return 'Refund';
    case 'adjustment':    return 'Adjustment';
    default:              return k;
  }
}
