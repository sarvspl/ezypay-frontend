'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';

export default function SmsDataPage() {
  const router = useRouter();
  const [rows, setRows] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | matched | unmatched
  const [q, setQ] = useState('');

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const params = {};
      if (filter === 'matched')   params.matched = 'true';
      if (filter === 'unmatched') params.matched = 'false';
      if (q.trim())               params.q = q.trim();
      const r = await api.merchantListSms(token, params);
      setRows(r.sms);
      setStats(r.stats);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q, filter]); // eslint-disable-line

  // Auto-refresh every 5s
  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">SMS Data</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Every wallet SMS your bound device has forwarded here. When a customer submits a TxnID,
          we automatically match it against unmatched messages in this list.
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total"     value={stats?.total ?? '—'}     tone="slate"  icon={<MessageIcon />} />
        <Stat label="Matched"   value={stats?.matched ?? '—'}   tone="emerald" icon={<CheckIcon />} />
        <Stat label="Unmatched" value={stats?.unmatched ?? '—'} tone="amber"  icon={<HourglassIcon />} />
        <Stat label="Last 24h"  value={stats?.last_24h ?? '—'}  tone="brand"  icon={<ClockIcon />} />
      </section>

      <div className="card p-3 sm:p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            className="input pl-10"
            placeholder="Search sender or body…"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
          {[{ k: 'all', l: 'All' }, { k: 'matched', l: 'Matched' }, { k: 'unmatched', l: 'Unmatched' }].map((t) => (
            <button key={t.k} onClick={() => setFilter(t.k)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filter === t.k ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}>{t.l}</button>
          ))}
        </div>
      </div>

      {error && <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>}

      {!rows && !error && (
        <div className="card p-10 text-center text-slate-500">Loading…</div>
      )}

      {rows && rows.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <MessageIcon />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">No SMS forwarded yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Once your APK reads a wallet SMS and uploads it via{' '}
            <code className="bg-slate-100 rounded px-1 text-xs">POST /api/device/sms</code>,
            it will appear here within seconds.
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="space-y-2.5">
          {rows.map((s) => <SmsRow key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone, icon }) {
  const tones = {
    slate:   'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber:   'bg-amber-100 text-amber-600',
    brand:   'bg-brand-100 text-brand-600',
  };
  return (
    <div className="card p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <div className="mt-3 text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function SmsRow({ s }) {
  const isMatched = !!s.matched_tx_id;
  return (
    <div className={`card p-4 ${isMatched ? 'border-emerald-200' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isMatched ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
        }`}>
          <MessageIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{s.sender}</span>
            {isMatched ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">
                <CheckIcon /> Matched · {s.matched_txnid}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[11px] font-semibold">
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

function I(props) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function MessageIcon() { return <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></I>; }
function CheckIcon()   { return <I width="12" height="12" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></I>; }
function HourglassIcon(){ return <I><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></I>; }
function ClockIcon()   { return <I><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></I>; }
function SearchIcon()  { return <I width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></I>; }
