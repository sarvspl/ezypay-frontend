'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/money';

const REDIRECT_SECONDS = 5;

export default function CheckoutResultPage() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    (async () => {
      try {
        const [sess, st] = await Promise.all([api.checkoutSession(sessionId), api.checkoutStatus(sessionId)]);
        setData({
          session: sess.session,
          status: st.status,
          transaction: st.transaction,
          redirect_url: st.redirect_url,
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!data || !data.redirect_url) return;
    if (data.status === 'pending') return; // don't auto-redirect on pending
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [data]);

  useEffect(() => {
    if (seconds === 0 && data?.redirect_url && data.status !== 'pending') {
      window.location.href = withParams(data.redirect_url, { session_id: sessionId, status: data.status });
    }
  }, [seconds, data, sessionId]);

  if (error) return <div className="max-w-xl mx-auto px-6 py-16 text-center text-rose-600">{error}</div>;
  if (!data)  return <div className="max-w-xl mx-auto px-6 py-16 text-center text-slate-400">Loading…</div>;

  const { session, status, transaction, redirect_url } = data;
  const variant = STATES[status] || STATES.pending;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="card p-8 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${variant.iconBg}`}>
          {variant.icon}
        </div>
        <h1 className={`mt-5 text-2xl font-bold ${variant.titleColor}`}>{variant.title}</h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">{variant.message}</p>

        <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-left text-sm space-y-2">
          <Row k="Amount"   v={formatMoney(session.amount, session.currency)} />
          <Row k="Order ID" v={session.order_id} />
          <Row k="Merchant" v={session.merchant_name} />
          {transaction && <Row k="Transaction ID" v={transaction.txnid_submitted} mono />}
          {transaction?.failure_reason && <Row k="Reason" v={transaction.failure_reason} />}
        </div>

        {redirect_url && status !== 'pending' && (
          <div className="mt-6 text-sm text-slate-500">
            Redirecting you back to <span className="font-semibold text-slate-700">{safeHost(redirect_url)}</span> in {seconds}s…
          </div>
        )}

        {redirect_url && (
          <a
            href={withParams(redirect_url, { session_id: sessionId, status })}
            className="btn-primary mt-4"
          >
            {status === 'success' ? 'Continue to merchant →' : 'Return to merchant'}
          </a>
        )}
      </div>
    </div>
  );
}

const STATES = {
  success: {
    iconBg: 'bg-emerald-100',
    icon:   <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    title:  'Payment Successful',
    titleColor: 'text-emerald-700',
    message: 'Your payment has been verified. The merchant has been notified and your order will be processed.',
  },
  failed: {
    iconBg: 'bg-rose-100',
    icon:   <svg className="w-8 h-8 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    title:  'Payment Failed',
    titleColor: 'text-rose-700',
    message: "We couldn't match your Transaction ID to any received SMS. If you did pay, please contact the merchant — they can manually verify.",
  },
  cancelled: {
    iconBg: 'bg-slate-200',
    icon:   <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
    title:  'Payment Cancelled',
    titleColor: 'text-slate-700',
    message: 'You cancelled the checkout. No payment was made.',
  },
  expired: {
    iconBg: 'bg-amber-100',
    icon:   <svg className="w-8 h-8 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title:  'Session Expired',
    titleColor: 'text-amber-700',
    message: 'This checkout link has expired. Start a new payment from the merchant&apos;s site.',
  },
  pending: {
    iconBg: 'bg-brand-50',
    icon:   <svg className="w-8 h-8 text-brand-600 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>,
    title:  'Verifying…',
    titleColor: 'text-slate-900',
    message: "We're matching your Transaction ID against the merchant's bound device. This usually takes a few seconds.",
  },
};

function Row({ k, v, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className={`text-slate-900 font-medium text-right ${mono ? 'font-mono text-xs' : ''}`}>{v}</span>
    </div>
  );
}

function withParams(url, params) {
  try {
    const u = new URL(url);
    Object.entries(params).forEach(([k, v]) => v != null && u.searchParams.set(k, v));
    return u.toString();
  } catch { return url; }
}
function safeHost(url) {
  try { return new URL(url).host; } catch { return url; }
}
