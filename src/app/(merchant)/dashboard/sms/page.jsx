'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { formatMoney } from '@/lib/money';
import { getProvider, labelVariant } from '@/lib/providers';
import { useMerchant } from '../layout';

export default function VerifyPage() {
  const { merchant } = useMerchant();
  const currency = merchant?.currency || 'USD';

  const [txnid, setTxnid] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const onVerify = async (e) => {
    e.preventDefault();
    if (!txnid.trim()) return;
    setVerifying(true);
    setResult(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantVerifyTxnId(token, txnid.trim());
      setResult(r);
    } catch (e) {
      setResult({ matched: false, message: e.message });
    } finally {
      setVerifying(false);
    }
  };

  const reset = () => { setResult(null); setTxnid(''); };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 items-center justify-center mx-auto">
          <ShieldIcon />
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900">Verify a Payment</h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Got a Transaction ID from a customer? Paste it below — we&apos;ll check
          your wallet SMS and confirm if the payment landed.
        </p>
      </div>

      <form onSubmit={onVerify} className="card p-5 sm:p-6 mt-8">
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Transaction ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={txnid}
            onChange={(e) => setTxnid(e.target.value)}
            placeholder="e.g. 613384596583"
            disabled={verifying}
            className="input font-mono flex-1 text-base"
            autoFocus
          />
          <button
            type="submit"
            disabled={verifying || !txnid.trim()}
            className="btn-primary !px-6 !py-3 whitespace-nowrap"
          >
            {verifying ? (
              <><Spinner /><span className="ml-2">Verifying…</span></>
            ) : (
              <>Verify Payment</>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          We search SMS received in the last 7 days from your bound device.
        </p>
      </form>

      {result && (
        <div className="mt-5">
          <ResultPanel result={result} currency={currency} />
          <div className="text-center mt-4">
            <button onClick={reset} className="text-sm text-slate-500 hover:text-brand-600">
              ← Verify another payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Result panel ─── */
function ResultPanel({ result, currency }) {
  if (result.matched) {
    const t = result.transaction;
    const p = getProvider(t.provider);
    return (
      <div className="card p-5 sm:p-6 border-emerald-200 bg-emerald-50/50">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-emerald-900 text-lg">
                {result.already_existed ? 'Already verified' : 'Payment verified!'}
              </h3>
              {!result.already_existed && (
                <span className="text-[11px] font-semibold rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5">NEW</span>
              )}
            </div>
            <p className="text-sm text-emerald-800/90 mt-0.5">
              {result.already_existed
                ? 'This Transaction ID is already recorded.'
                : 'Added to your Transactions.'}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">Amount</dt>
                <dd className="font-bold text-slate-900 text-lg">{formatMoney(t.amount, currency)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">From</dt>
                <dd className="text-slate-900 truncate">{t.payer_name || t.payer_phone || <span className="text-slate-400 italic">—</span>}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">TxnID</dt>
                <dd className="font-mono text-sm text-slate-900 break-all">{t.txnid_submitted}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">Received in</dt>
                <dd className="text-slate-900 flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded ${p.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>{p.initials}</span>
                  {p.name} <span className="text-xs text-slate-500">· {labelVariant(t.variant)} · {t.account_number}</span>
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              <Link href="/dashboard/transactions" className="btn-primary !py-2 text-sm">
                Open Transactions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // failed
  return (
    <div className="card p-5 sm:p-6 border-rose-200 bg-rose-50/50">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <XIcon />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-rose-900 text-lg">Could not verify</h3>
          <p className="text-sm text-rose-800/90 mt-1">{result.message}</p>

          {result.reason === 'no_gateways' && (
            <Link href="/dashboard/gateways" className="btn-primary !py-1.5 text-sm mt-4 inline-flex">
              Configure a gateway →
            </Link>
          )}
          {result.reason === 'no_gateway_match' && (
            <Link href="/dashboard/gateways" className="btn-primary !py-1.5 text-sm mt-4 inline-flex">
              Adjust gateway account →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── icons ─── */
function I(props) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function ShieldIcon() { return <I width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></I>; }
function CheckIcon()  { return <I strokeWidth="3"><polyline points="20 6 9 17 4 12"/></I>; }
function XIcon()      { return <I strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
function Spinner()    { return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>; }
