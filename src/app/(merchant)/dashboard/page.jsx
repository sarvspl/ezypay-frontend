'use client';

import { useState } from 'react';
import { useMerchant } from './layout';
import { formatMoney, currencySymbol } from '@/lib/money';

/* ─────────────────────────────────────────────────────────────────
   Static configuration. Replace with API-driven data in Phase 2.
   ───────────────────────────────────────────────────────────────── */
const PLAN = {
  name: 'Starter',
  status: 'ACTIVE',
  expiresAt: '2026-12-31',
  limits: { devices: 1, verifications: 100 },
};

const USAGE = {
  devices: 0,
  verifications: 0,
};

const STATS = {
  today: 0,
  pending: 0,
  successRate: null,
  totalVerifications: 0,
  successCount: 0,
  failedCount: 0,
  smsRead: 0,
  avgTime: null,
  walletsMonitored: 0,
  refunds: 0,
};

const LAST_7_DAYS = [
  { day: 'Mon', count: 0 },
  { day: 'Tue', count: 0 },
  { day: 'Wed', count: 0 },
  { day: 'Thu', count: 0 },
  { day: 'Fri', count: 0 },
  { day: 'Sat', count: 0 },
  { day: 'Sun', count: 0 },
];

const RECENT_VERIFICATIONS = []; // empty until APK is wired
const ACTIVITY = [];             // empty until events are logged
const LAST_VERIFICATION = null;  // null shows empty state

/* ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { merchant, error } = useMerchant();

  if (!merchant && !error) return <FullPageMessage>Loading…</FullPageMessage>;
  if (error) return <FullPageMessage tone="error">{error}</FullPageMessage>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <PlanSection merchant={merchant} />
      <CredentialsAndApk merchant={merchant} />
      <KeyStatsRow />
      <MiniStatsRow />
      <ChartAndLastVerification />
      <RecentAndActivity />
      <AccountDetails merchant={merchant} />
    </div>
  );
}

/* ─────────────────────────────────────────── PLAN HERO + USAGE */
function PlanSection({ merchant }) {
  const plan = PLAN;
  const balance = Number(merchant.wallet_balance || 0);

  const usagePct = (used, limit) =>
    Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      {/* Hero (2/3) */}
      <div className="lg:col-span-2 rounded-2xl p-6 sm:p-7 text-white relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-600 shadow-lg shadow-brand-500/20">
        <div aria-hidden className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70">Current Plan</span>
            <div className="mt-1 text-3xl sm:text-4xl font-bold">{plan.name}</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {plan.status}
          </span>
        </div>

        <div className="relative mt-8 sm:mt-12 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/70">Wallet Balance</div>
            <div className="mt-1 text-3xl sm:text-4xl font-extrabold">
              {formatMoney(balance, merchant.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-white/70">Expires On</div>
            <div className="text-sm font-semibold">{formatDate(plan.expiresAt)}</div>
          </div>
        </div>
      </div>

      {/* Plan Usage (1/3) */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Plan Usage</h3>
          <span className="text-xs text-slate-400">{plan.name}</span>
        </div>

        <div className="mt-4 space-y-4">
          <UsageBar
            label="Devices" used={USAGE.devices} limit={plan.limits.devices}
            pct={usagePct(USAGE.devices, plan.limits.devices)}
          />
          <UsageBar
            label="Verifications / mo" used={USAGE.verifications} limit={plan.limits.verifications}
            pct={usagePct(USAGE.verifications, plan.limits.verifications)}
          />
        </div>

        <button
          onClick={() => alert('Upgrade plans will be available soon.')}
          className="btn-primary w-full mt-5 !py-2.5"
        >
          Upgrade Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </section>
  );
}

function UsageBar({ label, used, limit, pct }) {
  const color =
    pct >= 90 ? 'bg-rose-500'
      : pct >= 70 ? 'bg-amber-500'
      : 'bg-brand-500';
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{used} <span className="text-slate-400 font-normal">/ {limit}</span></span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── CREDENTIALS + APK */
function CredentialsAndApk({ merchant }) {
  return (
    <section className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Integration credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">Keep secret. Read-only. Copy when needed.</p>
          </div>
          <KeyIcon className="text-slate-300" />
        </div>
        <div className="mt-4 space-y-4">
          <CopyField label="API Key (server integration)" value={merchant.api_key} />
          <CopyField label="Device Auth Key (APK binding)" value={merchant.device_auth_key} />
        </div>
      </div>

      <div className="card p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">PayVerify APK</h3>
          <PhoneIcon className="text-slate-300" />
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Install on the Android phone receiving your wallet SMS. Open the app and paste your Device Auth Key to bind it.
        </p>
        <div className="mt-auto pt-4 space-y-2">
          <button
            onClick={() => alert('APK will be available once the Flutter build is ready. (Phase 2)')}
            className="btn-primary w-full"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download APK
          </button>
          <p className="text-xs text-slate-400 text-center">Universal build · ARM64 / ARM32 / x86_64 coming soon</p>
        </div>
      </div>
    </section>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex gap-2">
        <input readOnly value={value} className="input font-mono text-sm bg-slate-50/70" />
        <button onClick={onCopy} className={`btn-secondary whitespace-nowrap ${copied ? '!text-emerald-600 !border-emerald-300' : ''}`}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── 3 KEY STATS ROW */
function KeyStatsRow() {
  const items = [
    {
      title: 'Today',
      value: STATS.today,
      sub: 'Verifications',
      icon: <SunIcon />,
      tone: 'amber',
    },
    {
      title: 'Success Rate',
      value: STATS.successRate == null ? '—' : `${STATS.successRate}%`,
      sub: 'Last 30 days',
      icon: <TrendIcon />,
      tone: 'emerald',
    },
    {
      title: 'Pending',
      value: STATS.pending,
      sub: 'Awaiting SMS match',
      icon: <ClockIcon />,
      tone: 'brand',
    },
  ];
  return (
    <section className="grid sm:grid-cols-3 gap-5">
      {items.map((s) => (
        <div key={s.title} className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneClasses(s.tone)}`}>
              {s.icon}
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">{s.title}</span>
          </div>
          <div className="mt-4 text-3xl font-bold text-slate-900">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.sub}</div>
        </div>
      ))}
    </section>
  );
}

/* ─────────────────────────────────────────── MINI STATS GRID */
function MiniStatsRow() {
  const items = [
    { label: 'Total',     value: STATS.totalVerifications, icon: <ListIcon /> },
    { label: 'Success',   value: STATS.successCount,       icon: <CheckIcon /> },
    { label: 'Failed',    value: STATS.failedCount,        icon: <XIcon /> },
    { label: 'SMS Read',  value: STATS.smsRead,            icon: <MessageIcon /> },
    { label: 'Devices',   value: USAGE.devices,            icon: <PhoneIcon className="w-4 h-4" /> },
    { label: 'Wallets',   value: STATS.walletsMonitored,   icon: <WalletIcon /> },
    { label: 'Avg Time',  value: STATS.avgTime == null ? '—' : `${STATS.avgTime}s`, icon: <TimerIcon /> },
    { label: 'Refunds',   value: STATS.refunds,            icon: <ReturnIcon /> },
  ];
  return (
    <section className="card p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {items.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
              {s.icon}
            </div>
            <div className="mt-2 text-base font-bold text-slate-900">{s.value}</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── 7-DAY CHART + LAST VERIFICATION */
function ChartAndLastVerification() {
  const max = Math.max(...LAST_7_DAYS.map((d) => d.count), 1);
  const allZero = LAST_7_DAYS.every((d) => d.count === 0);

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Last 7 Days</h3>
          <span className="text-xs text-slate-400">Verification volume</span>
        </div>

        {allZero ? (
          <div className="h-44 mt-4 flex flex-col items-center justify-center text-center text-slate-400">
            <BarChartIcon className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No verifications yet.</p>
            <p className="text-xs mt-1">Bind your APK and integrate the API to see live activity here.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-7 gap-3 items-end h-44">
            {LAST_7_DAYS.map((d) => (
              <div key={d.day} className="flex flex-col items-center justify-end h-full">
                <div className="w-full rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400 transition-all"
                     style={{ height: `${(d.count / max) * 100}%` }} />
                <span className="mt-2 text-xs text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="font-semibold text-slate-900">Last Verification</h3>
        {LAST_VERIFICATION ? (
          <dl className="mt-4 space-y-2.5 text-sm">
            <DetailRow k="Amount"  v={LAST_VERIFICATION.amount} />
            <DetailRow k="Wallet"  v={LAST_VERIFICATION.wallet} />
            <DetailRow k="TxnID"   v={LAST_VERIFICATION.txnid} mono />
            <DetailRow k="Status"  v={<StatusBadge value={LAST_VERIFICATION.status} />} />
          </dl>
        ) : (
          <div className="mt-6 text-center text-slate-400 py-8">
            <PulseIcon className="w-7 h-7 mx-auto opacity-40" />
            <p className="text-sm mt-2">No recent verifications</p>
          </div>
        )}
        <button
          onClick={() => alert('Transactions page coming soon.')}
          className="mt-5 w-full text-sm text-brand-600 hover:underline font-medium"
        >
          View All Transactions →
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── RECENT TX + ACTIVITY */
function RecentAndActivity() {
  return (
    <section className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200/70">
          <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          <button onClick={() => alert('Transactions page coming soon.')} className="text-sm text-brand-600 hover:underline">View All →</button>
        </div>

        {RECENT_VERIFICATIONS.length === 0 ? (
          <div className="px-5 sm:px-6 py-10 text-center text-slate-400">
            <InboxIcon className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm mt-2">No transactions to show yet</p>
            <p className="text-xs mt-1">Integrate the API and they&apos;ll appear here in real time.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-medium">TxnID</th>
                <th className="px-5 py-3 font-medium">Wallet</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RECENT_VERIFICATIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs">{tx.txnid}</td>
                  <td className="px-5 py-3 text-slate-700">{tx.wallet}</td>
                  <td className="px-5 py-3 font-semibold">{tx.amount}</td>
                  <td className="px-5 py-3"><StatusBadge value={tx.status} /></td>
                  <td className="px-5 py-3 text-slate-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Activity</h3>
          <button onClick={() => alert('Activity page coming soon.')} className="text-sm text-brand-600 hover:underline">View All →</button>
        </div>
        {ACTIVITY.length === 0 ? (
          <div className="mt-6 text-center text-slate-400 py-8">
            <PulseIcon className="w-7 h-7 mx-auto opacity-40" />
            <p className="text-sm mt-2">No activity yet</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3 text-sm">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                <div>
                  <div className="text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────── ACCOUNT DETAILS */
function AccountDetails({ merchant }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Account details</h3>
        <span className="text-xs text-slate-400">Read-only</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-8 text-sm">
        <Detail k="Username" v={merchant.username} />
        <Detail k="Email"    v={merchant.email} />
        <Detail k="Mobile"   v={merchant.mobile} />
        <Detail k="Domain"   v={merchant.domain} />
        <Detail k="Industry" v={merchant.industry} />
        <Detail k="Country"  v={merchant.country} />
        <Detail k="State"    v={merchant.state} />
        <Detail k="Joined"   v={formatDate(merchant.created_at)} />
      </dl>
    </section>
  );
}

function Detail({ k, v }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
      <dd className="mt-0.5 text-slate-900">{v}</dd>
    </div>
  );
}

function DetailRow({ k, v, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className={`text-slate-900 ${mono ? 'font-mono text-xs' : 'font-medium'} text-right`}>{v}</span>
    </div>
  );
}

function StatusBadge({ value }) {
  const styles =
    value === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
    value === 'FAILED'  ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles}`}>
      {value}
    </span>
  );
}

function FullPageMessage({ children, tone = 'slate' }) {
  const color = tone === 'error' ? 'text-rose-600' : 'text-slate-500';
  return <main className={`min-h-screen flex items-center justify-center ${color}`}>{children}</main>;
}

function toneClasses(t) {
  if (t === 'amber')   return 'bg-amber-100 text-amber-600';
  if (t === 'emerald') return 'bg-emerald-100 text-emerald-600';
  return 'bg-brand-100 text-brand-600';
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─────────────────────────────────────────── ICONS */
function ArrowRight({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function KeyIcon({ className = '' }) {
  return <svg className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}
function PhoneIcon({ className = 'w-6 h-6' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}
function DownloadIcon({ className = 'w-5 h-5' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function SunIcon()   { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function TrendIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>; }
function ClockIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function ListIcon()  { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function CheckIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function XIcon()     { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function MessageIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function WalletIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>; }
function TimerIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/></svg>; }
function ReturnIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>; }
function BarChartIcon({ className = '' }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>; }
function InboxIcon({ className = '' }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>; }
function PulseIcon({ className = '' }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
