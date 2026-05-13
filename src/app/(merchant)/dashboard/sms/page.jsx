'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { formatMoney } from '@/lib/money';
import { getProvider, labelVariant } from '@/lib/providers';
import { useMerchant } from '../layout';

export default function VerifyPage() {
  const router = useRouter();
  const { merchant } = useMerchant();
  const currency = merchant?.currency || 'USD';

  const [txnid, setTxnid] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const [sms, setSms] = useState(null);
  const [smsErr, setSmsErr] = useState(null);

  const loadSms = async () => {
    setSmsErr(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantListSms(token, { limit: 20 });
      setSms(r.sms);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setSmsErr(e.message);
    }
  };

  useEffect(() => { loadSms(); }, []); // eslint-disable-line
  useEffect(() => {
    const t = setInterval(loadSms, 5000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const onVerify = async (e) => {
    e.preventDefault();
    if (!txnid.trim()) return;
    setVerifying(true);
    setResult(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantVerifyTxnId(token, txnid.trim());
      setResult(r);
      if (r.matched) {
        // refresh SMS list so the just-matched SMS flips to Matched
        loadSms();
      }
    } catch (e) {
      setResult({ matched: false, message: e.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Verify a Payment</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Paste the Transaction ID a customer gave you. We&apos;ll check your received SMS,
          confirm the payment, and mark it as <strong>Done</strong> in Transactions.
        </p>
      </div>

      {/* Verify form */}
      <form onSubmit={onVerify} className="card p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Transaction ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={txnid}
            onChange={(e) => setTxnid(e.target.value)}
            placeholder="e.g. 613384596583"
            disabled={verifying}
            className="input font-mono flex-1"
            autoFocus
          />
          <button
            type="submit"
            disabled={verifying || !txnid.trim()}
            className="btn-primary !px-6 whitespace-nowrap"
          >
            {verifying ? (
              <><Spinner /><span className="ml-2">Verifying…</span></>
            ) : (
              <>Verify Payment</>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          We&apos;ll search SMS received in the last 7 days against your bound device.
        </p>
      </form>

      {/* Result panel */}
      {result && <ResultPanel result={result} currency={currency} />}

      {/* Recent SMS section */}
      <section>
        <div className="flex items-center justify-between mb-3 mt-2">
          <h3 className="font-semibold text-slate-900">Recent SMS received</h3>
          <span className="text-xs text-slate-400">Auto-refreshes every 5s</span>
        </div>

        {smsErr && <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{smsErr}</div>}

        {!sms && !smsErr && (
          <div className="card p-6 text-center text-slate-500 text-sm">Loading…</div>
        )}

        {sms && sms.length === 0 && (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
              <MessageIcon />
            </div>
            <p className="text-sm mt-3 text-slate-600">No SMS forwarded yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Make sure your APK is bound (<Link href="/dashboard/devices" className="text-brand-600 hover:underline">Devices</Link>) and is uploading SMS.
            </p>
          </div>
        )}

        {sms && sms.length > 0 && (
          <div className="space-y-2">
            {sms.map((s) => <SmsRow key={s.id} s={s} />)}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─── result panel ─── */
function ResultPanel({ result, currency }) {
  if (result.matched) {
    const t = result.transaction;
    const p = getProvider(t.provider);
    return (
      <div className="card p-5 sm:p-6 border-emerald-200 bg-emerald-50/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckIcon />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-emerald-900">
                {result.already_existed ? 'Already verified' : 'Payment verified!'}
              </h3>
              {!result.already_existed && (
                <span className="text-[11px] font-semibold rounded bg-emerald-100 text-emerald-700 px-1.5 py-0.5">NEW</span>
              )}
            </div>
            <p className="text-sm text-emerald-800/90 mt-0.5">
              {result.already_existed
                ? 'This Transaction ID has already been recorded — see Transactions.'
                : 'A new transaction has been created and is now in your Transactions list.'}
            </p>

            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">TxnID</dt>
                <dd className="font-mono text-slate-900 truncate">{t.txnid_submitted}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">Amount</dt>
                <dd className="font-semibold text-slate-900">{formatMoney(t.amount, currency)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">Gateway</dt>
                <dd className="text-slate-900 flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded ${p.bg} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>{p.initials}</span>
                  {p.name} <span className="text-xs text-slate-500">· {labelVariant(t.variant)}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700/80">Account</dt>
                <dd className="text-slate-900">{t.account_number}{t.gateway_label && <span className="text-slate-500"> · {t.gateway_label}</span>}</dd>
              </div>
            </dl>

            <div className="mt-4 flex gap-2">
              <Link href="/dashboard/transactions" className="btn-primary !py-1.5 text-sm">
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
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <XIcon />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-rose-900">Could not verify</h3>
          <p className="text-sm text-rose-800/90 mt-0.5">{result.message}</p>

          {result.sms && (
            <div className="mt-3 rounded-md bg-white border border-rose-200 p-3 text-xs">
              <div className="text-rose-700/80 font-semibold mb-1">SMS that matched the TxnID:</div>
              <div className="text-slate-700 break-words">{result.sms.body}</div>
              <div className="text-slate-400 mt-1">From {result.sms.sender}</div>
            </div>
          )}

          {result.reason === 'no_gateways' && (
            <Link href="/dashboard/gateways" className="btn-primary !py-1.5 text-sm mt-3 inline-flex">
              Configure a gateway →
            </Link>
          )}
          {result.reason === 'no_gateway_match' && (
            <Link href="/dashboard/gateways" className="btn-primary !py-1.5 text-sm mt-3 inline-flex">
              Adjust gateway account →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── SMS row ─── */
function SmsRow({ s }) {
  const isMatched = !!s.matched_tx_id;
  return (
    <div className={`card p-3.5 ${isMatched ? 'border-emerald-200' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
          isMatched ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          <MessageIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">{s.sender}</span>
            {isMatched ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                Matched
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-semibold">
                Unmatched
              </span>
            )}
            <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{timeAgo(s.received_at)}</span>
          </div>
          <p className="text-sm text-slate-700 mt-1 break-words">{s.body}</p>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─── icons ─── */
function I(props) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function MessageIcon() { return <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></I>; }
function CheckIcon()   { return <I strokeWidth="3"><polyline points="20 6 9 17 4 12"/></I>; }
function XIcon()       { return <I strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
function Spinner()     { return <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>; }
