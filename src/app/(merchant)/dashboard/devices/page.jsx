'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { useMerchant } from '../layout';

export default function DevicesPage() {
  const router = useRouter();
  const { merchant } = useMerchant();
  const [devices, setDevices] = useState(null);
  const [pastCount, setPastCount] = useState(0);
  const [pastDevices, setPastDevices] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantListDevices(token);
      setDevices(r.devices);
      setPastCount(r.past_count || 0);
    } catch (e) {
      if (e.status === 401) {
        merchantAuth.clear();
        router.replace('/login');
      } else {
        setError(e.message);
      }
    }
  };

  const loadHistory = async () => {
    const token = merchantAuth.get();
    try {
      const r = await api.merchantListDeviceHistory(token);
      setPastDevices(r.devices);
    } catch (e) { setError(e.message); }
  };

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next && pastDevices === null) loadHistory();
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 15s so online/offline status stays current.
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDelete = async (device) => {
    const label = device.model || device.device_id.slice(0, 8);
    if (!confirm(`Unbind device "${label}"? It will stop receiving verification requests.`)) return;
    const token = merchantAuth.get();
    try {
      await api.merchantDeleteDevice(token, device.id);
      setDevices((d) => d.filter((x) => x.id !== device.id));
    } catch (e) {
      alert(e.message);
    }
  };

  const stats = computeStats(devices || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bound devices</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Android phones currently linked to your account. Each device reads incoming wallet SMS and
          reports back when a transaction is verified.
        </p>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"   value={stats.total}   icon={<PhoneIcon />}  tone="slate" />
        <StatCard label="Online"  value={stats.online}  icon={<SignalIcon />} tone="emerald" />
        <StatCard label="Active"  value={stats.active}  icon={<PulseIcon />}  tone="brand" />
        <StatCard label="Offline" value={stats.offline} icon={<OffIcon />}    tone="rose" />
      </section>

      {error && (
        <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>
      )}

      {!devices && !error && (
        <div className="card p-10 text-center text-slate-500">Loading devices…</div>
      )}

      {devices && devices.length === 0 && (
        <EmptyState merchant={merchant} />
      )}

      {devices && devices.length > 0 && (
        <div className="grid gap-3">
          {devices.map((d) => (
            <DeviceCard key={d.id} device={d} onDelete={() => onDelete(d)} />
          ))}
        </div>
      )}

      {pastCount > 0 && (
        <section className="mt-4">
          <button
            onClick={toggleHistory}
            className="w-full card px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <ClockIcon />
              <span className="text-sm font-medium text-slate-700">
                Past devices — {pastCount} previously unbound
              </span>
            </div>
            <ChevronIcon className={showHistory ? 'rotate-180' : ''} />
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2">
              {pastDevices === null ? (
                <div className="card p-5 text-center text-sm text-slate-500">Loading…</div>
              ) : pastDevices.length === 0 ? (
                <div className="card p-5 text-center text-sm text-slate-500">No past devices.</div>
              ) : (
                pastDevices.map((d) => <PastDeviceCard key={d.id} device={d} />)
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ─── past device row ─── */
function PastDeviceCard({ device }) {
  const title = device.model
    ? `${device.manufacturer ? device.manufacturer + ' ' : ''}${device.model}`
    : 'Unknown device';
  const reason = {
    apk_unbind:        'Disconnected from app',
    merchant_delete:   'Removed from dashboard',
    admin:             'Removed by admin',
  }[device.unbound_reason] || 'Unbound';
  return (
    <div className="card p-4 opacity-75">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
            <PhoneIcon />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-slate-700 truncate">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {reason} · {timeAgo(device.unbound_at)}
              {device.os_version && <span> · Android {device.os_version}</span>}
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{device.device_id}</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap">
          Unbound
        </span>
      </div>
    </div>
  );
}
function ChevronIcon({ className = '' }) { return <svg className={`w-4 h-4 transition-transform ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>; }

/* ─── stat card ─── */
function StatCard({ label, value, icon, tone }) {
  const tones = {
    slate:   'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    brand:   'bg-brand-100 text-brand-600',
    rose:    'bg-rose-100 text-rose-500',
  };
  return (
    <div className="card p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        {icon}
      </div>
      <div className="mt-3 text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

/* ─── device card ─── */
function DeviceCard({ device, onDelete }) {
  const isOnline = device.is_online;
  const title = device.model
    ? `${device.manufacturer ? device.manufacturer + ' ' : ''}${device.model}`
    : 'Unknown device';

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isOnline ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <SignalIcon />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {device.os_version && <span>Android {device.os_version} · </span>}
              Last seen {timeAgo(device.last_seen_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge online={isOnline} enabled={device.is_enabled} />
          <button
            onClick={onDelete}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition"
            aria-label="Unbind device"
            title="Unbind device"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-slate-50/70 border border-slate-200 px-3 py-2.5">
        <div className="text-xs text-slate-500 mb-0.5">Device ID</div>
        <div className="flex items-center gap-2">
          <code className="text-xs text-slate-700 font-mono truncate flex-1">{device.device_id}</code>
          <CopyButton value={device.device_id} />
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        Bound {new Date(device.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}

function StatusBadge({ online, enabled }) {
  if (!enabled) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">Disabled</span>;
  }
  if (online) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
    </span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold">Offline</span>;
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
      }}
      className={`p-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200 transition ${copied ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}
      aria-label="Copy device ID"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/* ─── empty state ─── */
function EmptyState({ merchant }) {
  const authKey = merchant?.device_auth_key;
  return (
    <div className="card p-8 sm:p-10">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <PhoneIcon />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No devices bound yet</h3>
        <p className="text-sm text-slate-600 mt-2">
          Install the EzyPay APK on the Android phone receiving your wallet SMS, then open the
          app and paste your <strong>Device Auth Key</strong>.
        </p>

        <a
          href="/ezypay.apk"
          download
          className="inline-flex items-center gap-2 mt-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 shadow-sm shadow-brand-500/20"
        >
          <DownloadIcon /> Download APK
        </a>
        <div className="text-[11px] text-slate-400 mt-1.5">Android only · ~12&nbsp;MB</div>

        {authKey && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Your Device Auth Key:</span>
            <code className="text-sm font-mono font-semibold text-slate-800">{authKey}</code>
            <CopyButton value={authKey} />
          </div>
        )}

        <div className="mt-6 text-xs text-slate-500 text-left bg-slate-50 rounded-md p-4 border border-slate-200">
          <div className="font-semibold text-slate-700 mb-1">Testing without the APK?</div>
          You can simulate a device binding with curl from any terminal:
          <pre className="mt-2 bg-slate-900 text-slate-100 rounded p-3 overflow-x-auto text-[11px]">{`curl -X POST http://localhost:4000/api/device/bind \\
  -H "Content-Type: application/json" \\
  -d '{
    "auth_key": "${authKey || 'YOUR_AUTH_KEY'}",
    "device_id": "test-device-001",
    "model": "OPPO CPH1937",
    "manufacturer": "OPPO",
    "os_version": "11"
  }'`}</pre>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */
function computeStats(devices) {
  const total = devices.length;
  const online = devices.filter((d) => d.is_online).length;
  const active = devices.filter((d) => d.is_enabled).length;
  const offline = total - online;
  return { total, online, active, offline };
}

function timeAgo(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)     return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)     return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)     return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)     return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─── icons ─── */
function I(props) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function PhoneIcon()  { return <I><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></I>; }
function SignalIcon() { return <I><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></I>; }
function PulseIcon()  { return <I><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></I>; }
function OffIcon()    { return <I><line x1="2" y1="2" x2="22" y2="22"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 12.55a10 10 0 0 1 5.17-2.39"/><line x1="12" y1="20" x2="12.01" y2="20"/></I>; }
function TrashIcon()  { return <I><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></I>; }
function CopyIcon()   { return <I width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></I>; }
function CheckIcon()  { return <I width="14" height="14"><polyline points="20 6 9 17 4 12"/></I>; }
function ClockIcon()  { return <I width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></I>; }
function DownloadIcon() { return <I width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></I>; }
