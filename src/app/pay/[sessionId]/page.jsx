'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getProvider, labelVariant } from '@/lib/providers';
import { formatMoney } from '@/lib/money';

export default function CheckoutSessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [gateways, setGateways] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('mobile');

  useEffect(() => {
    (async () => {
      try {
        const [s, g, st] = await Promise.all([
          api.checkoutSession(sessionId),
          api.checkoutGateways(sessionId),
          api.checkoutStatus(sessionId),
        ]);
        setSession(s.session);
        setGateways(g.gateways);
        // Block re-picking a method once a TxnID has been submitted (any tx exists),
        // and jump to the result screen if the session is already finalised.
        if (s.session.status !== 'pending' || st.transaction) {
          router.replace(`/pay/${sessionId}/result`);
        }
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [sessionId, router]);

  if (error) return <CheckoutError msg={error} />;
  if (!session || !gateways) return <CheckoutLoading />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <MerchantHero session={session} />
      <AmountBanner session={session} />

      <Tabs tab={tab} onChange={setTab} />

      <GatewayGrid
        gateways={gateways}
        sessionId={sessionId}
        category={tab}
        onCancel={async () => {
          try { await api.checkoutCancel(sessionId); } catch {}
          window.location.href = withParams(session.redirect_url, { session_id: sessionId, status: 'cancelled' });
        }}
      />
    </div>
  );
}

/* ─── Sub-views ─── */
function MerchantHero({ session }) {
  // The site the customer was actually on when they clicked Pay — derived from
  // the redirect_url xyz.com set. Falls back to the brand's registered domain.
  const sourceHost = sourceHostFromSession(session);
  return (
    <div className="card p-4 sm:p-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0">
          {(session.merchant_name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 truncate">{session.merchant_name}</span>
            <VerifiedBadge />
          </div>
          <div className="text-xs text-slate-500 truncate">{sourceHost}</div>
        </div>
      </div>
      <button onClick={() => alert(`Contact ${session.merchant_name}`)} className="btn-secondary !py-1.5 !px-3 text-sm">
        <PhoneIcon /> <span className="ml-1.5 hidden sm:inline">Contact</span>
      </button>
    </div>
  );
}

// Pull the most accurate "where the customer came from" host:
// 1. redirect_url's hostname (port included if non-standard) — that's the URL
//    the integrator told us to send the customer back to. It's the actual site.
// 2. fall back to the brand's registered domain.
function sourceHostFromSession(session) {
  try {
    const u = new URL(session.redirect_url);
    const port = (u.port && u.port !== '80' && u.port !== '443') ? `:${u.port}` : '';
    return u.hostname + port;
  } catch { /* fallthrough */ }
  return session.brand_domain || '';
}

function AmountBanner({ session }) {
  return (
    <div className="rounded-2xl p-7 text-white text-center bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 relative overflow-hidden">
      <div aria-hidden className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="text-4xl sm:text-5xl font-extrabold">
          {formatMoney(session.amount, session.currency)}
        </div>
        <div className="mt-1 text-white/80 text-sm">Total Payment</div>
        <div className="mt-1 text-[11px] text-white/60">Order #{session.order_id}</div>
      </div>
    </div>
  );
}

function Tabs({ tab, onChange }) {
  const tabs = [
    { id: 'mobile', label: 'Mobile' },
    { id: 'bank',   label: 'Bank',   disabled: true },
    { id: 'global', label: 'Global', disabled: true },
  ];
  return (
    <div className="card p-1 inline-flex w-full sm:w-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          disabled={t.disabled}
          onClick={() => onChange(t.id)}
          className={[
            'flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-md transition',
            tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-900',
            t.disabled ? 'opacity-40 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function GatewayGrid({ gateways, sessionId, category, onCancel }) {
  if (category !== 'mobile') {
    return <div className="card p-8 text-center text-slate-500 text-sm">Coming soon.</div>;
  }
  if (gateways.length === 0) {
    return <div className="card p-8 text-center text-slate-500 text-sm">No gateways configured for this merchant yet.</div>;
  }
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {gateways.map((g) => <GatewayCard key={g.id} g={g} sessionId={sessionId} />)}
      </div>
      <div className="text-center pt-2">
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-rose-600">Cancel Payment</button>
      </div>
    </>
  );
}

function GatewayCard({ g, sessionId }) {
  const p = getProvider(g.provider);
  return (
    <a
      href={`/pay/${sessionId}/${g.id}`}
      className="card p-4 hover:shadow-md hover:border-brand-200 transition flex flex-col items-center text-center relative"
    >
      <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wider rounded bg-slate-900 text-white px-1.5 py-0.5">
        {labelVariant(g.variant).toUpperCase()}
      </span>
      <div className={`w-12 h-12 rounded-xl ${p.bg} text-white font-bold flex items-center justify-center text-base`}>
        {p.initials}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{p.name}</div>
    </a>
  );
}

function VerifiedBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1f7ae0" aria-label="Verified">
      <path d="M12 2l2.39 2.91 3.76.59L19.5 9l1.5 3-1.5 3-1.35 3.5-3.76.59L12 22l-2.39-2.91-3.76-.59L4.5 15 3 12l1.5-3 1.35-3.5 3.76-.59z"/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

/* ─── Shared loading + error ─── */
export function CheckoutLoading() {
  return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-slate-400">Loading checkout…</div>;
}
export function CheckoutError({ msg }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <div className="card p-8 inline-block">
        <div className="text-rose-600 font-semibold">Couldn&apos;t load checkout</div>
        <div className="text-sm text-slate-500 mt-1">{msg}</div>
      </div>
    </div>
  );
}

export function withParams(url, params) {
  try {
    const u = new URL(url);
    Object.entries(params).forEach(([k, v]) => v != null && u.searchParams.set(k, v));
    return u.toString();
  } catch {
    return url;
  }
}
