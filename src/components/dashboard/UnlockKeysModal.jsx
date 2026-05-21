'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { formatMoney } from '@/lib/money';

/**
 * One-time "unlock integration keys" purchase modal. Charges the configured
 * fee from the merchant's wallet, then calls onUnlocked() (which should refresh
 * the merchant so the now-revealed keys appear).
 */
export default function UnlockKeysModal({ open, onClose, merchant, onUnlocked }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const currency = merchant?.currency || 'BDT';
  const fee = Number(merchant?.key_unlock_fee || 0);
  const balance = Number(merchant?.wallet_balance || 0);
  const enough = balance >= fee;

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = merchantAuth.get();
      const r = await api.merchantUnlockKeys(token);
      await onUnlocked?.(r);
      onClose?.();
    } catch (e) {
      setError(e?.data?.error || e?.message || 'Could not unlock keys. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Unlock integration keys</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your API key and device auth key unlock with a one-time payment from your wallet.
            </p>
          </div>
        </div>

        <dl className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <dt className="text-slate-500">One-time fee</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(fee, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Wallet balance</dt>
            <dd className={`font-semibold tabular-nums ${enough ? 'text-slate-900' : 'text-rose-700'}`}>{formatMoney(balance, currency)}</dd>
          </div>
          {enough && (
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <dt className="text-slate-500">Balance after</dt>
              <dd className="font-semibold tabular-nums">{formatMoney(balance - fee, currency)}</dd>
            </div>
          )}
        </dl>

        {!enough && (
          <div className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
            Insufficient balance — add <strong>{formatMoney(fee - balance, currency)}</strong> to your wallet first.
          </div>
        )}
        {error && <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          {enough ? (
            <button onClick={pay} disabled={busy} className="btn-primary !py-2">
              {busy ? 'Processing…' : `Pay ${formatMoney(fee, currency)} & unlock`}
            </button>
          ) : (
            <Link href="/dashboard/wallet" className="btn-primary !py-2">Top up wallet →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
