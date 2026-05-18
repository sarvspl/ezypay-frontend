'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getProvider, labelVariant } from '@/lib/providers';
import { formatMoney } from '@/lib/money';

const POLL_MS         = 2000;
const POLL_MAX_MS     = 90_000;   // total time we keep polling
const PATIENT_AFTER_MS = 20_000;  // switch to reassuring "we'll notify you" copy after this

export default function PayWithGatewayPage() {
  const { sessionId, gatewayId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [gateway, setGateway] = useState(null);
  const [error, setError] = useState(null);
  const [txnid, setTxnid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyPhase, setVerifyPhase] = useState('fast'); // 'fast' | 'patient'
  const [showHow, setShowHow] = useState(false);
  const [copied, setCopied] = useState(false);

  // After PATIENT_AFTER_MS of verifying, swap the spinner text to a calmer
  // "we'll update you when it's done — no need to wait here" message so the
  // customer doesn't think the page is stuck or suspect fraud.
  useEffect(() => {
    if (!verifying) {
      setVerifyPhase('fast');
      return;
    }
    const t = setTimeout(() => setVerifyPhase('patient'), PATIENT_AFTER_MS);
    return () => clearTimeout(t);
  }, [verifying]);

  useEffect(() => {
    (async () => {
      try {
        const [s, g] = await Promise.all([
          api.checkoutSession(sessionId),
          api.checkoutGateways(sessionId),
        ]);
        setSession(s.session);
        const found = g.gateways.find((x) => x.id === gatewayId);
        if (!found) throw new Error('Gateway not available for this checkout');
        setGateway(found);
        if (s.session.status !== 'pending') router.replace(`/pay/${sessionId}/result`);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [sessionId, gatewayId, router]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!txnid.trim()) {
      setError('Please enter the Transaction ID from your wallet SMS.');
      return;
    }
    setSubmitting(true);
    try {
      await api.checkoutSubmit(sessionId, { gateway_id: gatewayId, txnid: txnid.trim() });
      setVerifying(true);
      pollUntilResolved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pollUntilResolved = () => {
    const start = Date.now();
    const tick = async () => {
      try {
        const r = await api.checkoutStatus(sessionId);
        if (r.status !== 'pending') {
          router.replace(`/pay/${sessionId}/result`);
          return;
        }
        const txStatus = r.transaction?.status;
        if (txStatus === 'failed') {
          router.replace(`/pay/${sessionId}/result`);
          return;
        }
      } catch {}
      if (Date.now() - start < POLL_MAX_MS) {
        setTimeout(tick, POLL_MS);
      } else {
        // Stop polling but leave the session visible; merchant can resolve manually later.
        setVerifying(false);
        setError('Verification is taking longer than expected. You can close this page — your order will be updated once verified.');
      }
    };
    setTimeout(tick, POLL_MS);
  };

  if (error && !session) return <ErrorBox msg={error} />;
  if (!session || !gateway) return <Loading />;

  const p = getProvider(gateway.provider);

  // Total customer pays = session.amount + gateway charge − gateway discount.
  const charge   = computeFee(session.amount, gateway.charge_value,   gateway.charge_type);
  const discount = computeFee(session.amount, gateway.discount_value, gateway.discount_type);
  const total    = Math.max(0, Number(session.amount) + charge - discount);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <MerchantBar session={session} />
      <AmountHero session={session} total={total} charge={charge} discount={discount} />

      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${p.bg} text-white font-bold flex items-center justify-center`}>
            {p.initials}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{p.name}</div>
            <div className="text-xs text-slate-500">{labelVariant(gateway.variant)} Account</div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider">{labelVariant(gateway.variant)} Number</div>
            <div className="font-mono text-base sm:text-lg font-bold text-slate-900 truncate">{gateway.account_number}</div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try { await navigator.clipboard.writeText(gateway.account_number); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
            }}
            className={`btn-secondary !py-1.5 ${copied ? '!text-emerald-600 !border-emerald-300' : ''}`}
          >
            {copied ? '✓ Copied' : <><CopyIcon /><span className="ml-1.5">Copy</span></>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowHow((s) => !s)}
          className="mt-3 text-sm text-brand-600 hover:underline flex items-center gap-1"
        >
          <ChevronIcon className={showHow ? 'rotate-180' : ''} />
          How to pay with {p.name}
        </button>
        {showHow && (
          <ol className="mt-2 text-sm text-slate-600 list-decimal pl-5 space-y-1">
            <li>Open the {p.name} app on your phone.</li>
            <li>Choose <strong>Send Money</strong> ({labelVariant(gateway.variant)} number).</li>
            <li>Enter the number above and amount <strong>{formatMoney(total, session.currency)}</strong>.</li>
            <li>Confirm with your PIN.</li>
            <li>Copy the <strong>Transaction ID (TrxID)</strong> from the confirmation SMS and paste it below.</li>
          </ol>
        )}
      </div>

      <form onSubmit={submit} className="card p-5">
        <label className="block text-sm font-semibold text-slate-900 mb-2">Transaction ID</label>
        <div className="flex gap-2">
          <input
            value={txnid}
            onChange={(e) => setTxnid(e.target.value.toUpperCase())}
            disabled={submitting || verifying}
            className="input font-mono"
            placeholder="e.g. ABC12XY34Z"
          />
          <button
            type="submit"
            disabled={submitting || verifying || !txnid.trim()}
            className="btn-primary !px-5 whitespace-nowrap"
          >
            {submitting ? 'Submitting…' : verifying ? <><Spinner /> <span className="ml-2">Verifying…</span></> : 'Verify'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">From your {p.name} confirmation SMS</p>

        {error && (
          <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
        )}
        {verifying && !error && verifyPhase === 'fast' && (
          <div className="mt-3 text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded p-3 flex items-center gap-2">
            <Spinner /> Matching your TxnID against the SMS — this usually takes 2–10 seconds…
          </div>
        )}
        {verifying && !error && verifyPhase === 'patient' && (
          <div className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
            <span className="mt-0.5"><HourglassIcon /></span>
            <div>
              <div className="font-semibold">Your payment is being verified — nothing to worry about.</div>
              <div className="mt-0.5 text-amber-800">
                You can safely close this page. Once it's verified, your order status will update automatically and the merchant will be notified.
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="text-center pt-1">
        {verifying ? (
          (() => {
            // Once they've submitted, the gateway-picker isn't useful — they
            // can't change methods now. Send them back to the merchant site
            // WITH the same ?session_id=&status=pending query string PayVerify
            // would have used on its automatic redirect — so the merchant's
            // result page can still look up the order.
            let host = '';
            let href = session.redirect_url;
            try {
              const u = new URL(session.redirect_url);
              u.searchParams.set('session_id', sessionId);
              u.searchParams.set('status', 'pending');
              href = u.toString();
              const port = (u.port && u.port !== '80' && u.port !== '443') ? ':' + u.port : '';
              host = u.hostname + port;
            } catch {}
            return (
              <a href={href} className="text-sm text-slate-500 hover:text-slate-800">
                ← Back to {host || 'merchant site'}
              </a>
            );
          })()
        ) : (
          <a href={`/pay/${sessionId}`} className="text-sm text-slate-500 hover:text-slate-800">← Choose a different method</a>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-views ─── */
function MerchantBar({ session }) {
  // Show the actual site the customer came from (redirect_url host), not the
  // brand's static registered domain. Falls back to brand_domain.
  let sourceHost = session.brand_domain || '';
  try {
    const u = new URL(session.redirect_url);
    const port = (u.port && u.port !== '80' && u.port !== '443') ? `:${u.port}` : '';
    sourceHost = u.hostname + port;
  } catch {}
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm">
        {(session.merchant_name || '?').charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 text-sm truncate">{session.merchant_name}</div>
        <div className="text-xs text-slate-500 truncate">{sourceHost}</div>
      </div>
    </div>
  );
}

function AmountHero({ session, total, charge, discount }) {
  const hasAdjustment = (charge > 0) || (discount > 0);
  return (
    <div className="rounded-2xl p-6 text-white bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 relative overflow-hidden">
      <div className="text-center">
        <div className="text-3xl sm:text-4xl font-extrabold">
          {formatMoney(total, session.currency)}
        </div>
        <div className="mt-1 text-white/80 text-sm">Total to pay</div>
      </div>
      {hasAdjustment && (
        <div className="mt-4 pt-4 border-t border-white/20 text-sm space-y-1.5">
          <Row label="Bill amount"      value={formatMoney(session.amount, session.currency)} />
          {charge > 0   && <Row label="Gateway charge"  value={`+ ${formatMoney(charge,   session.currency)}`} />}
          {discount > 0 && <Row label="Discount"        value={`− ${formatMoney(discount, session.currency)}`} />}
          <div className="pt-1.5 border-t border-white/20 flex items-center justify-between font-semibold">
            <span className="text-white/90">Total</span>
            <span>{formatMoney(total, session.currency)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-white/85">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Mirror of computeFee in backend/payment.controller.js — keep in sync.
function computeFee(base, value, type) {
  const v = Number(value || 0);
  if (!v) return 0;
  if (String(type).toLowerCase() === 'percent') return Number(base) * (v / 100);
  return v;
}

function Loading() {
  return <div className="max-w-2xl mx-auto px-6 py-16 text-center text-slate-400">Loading…</div>;
}
function ErrorBox({ msg }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <div className="card p-8 inline-block">
        <div className="text-rose-600 font-semibold">{msg}</div>
      </div>
    </div>
  );
}

function ChevronIcon({ className = '' }) {
  return <svg className={`w-4 h-4 transition-transform ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function CopyIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/>
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
function HourglassIcon() {
  return (
    <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12M6 22h12M6 2v6a6 6 0 0 0 12 0V2M6 22v-6a6 6 0 0 1 12 0v6"/>
    </svg>
  );
}

