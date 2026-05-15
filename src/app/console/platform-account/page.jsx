'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import { LogoMark } from '@/components/Logo';

export default function ConsolePlatformAccountPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [info, setInfo] = useState(null);
  const [gateways, setGateways] = useState(null);
  const [devices, setDevices] = useState(null);
  const [recharges, setRecharges] = useState(null);
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [showKey, setShowKey] = useState(false);

  const reload = async () => {
    const token = adminAuth.get();
    try {
      const [i, g, d, r, p] = await Promise.all([
        api.adminGetPlatform(token),
        api.adminListPlatformGateways(token),
        api.adminListPlatformDevices(token),
        api.adminListPlatformRecharges(token, { limit: 30 }),
        api.listProviders(),
      ]);
      setInfo(i.platform);
      setGateways(g.gateways || []);
      setDevices(d.devices || []);
      setRecharges(r.recharges || []);
      setProviders(p.providers || []);
    } catch (e) {
      if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
      else setError(e.message);
    }
  };

  useEffect(() => { if (ready) reload(); /* eslint-disable-next-line */ }, [ready]);

  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

  const onResolveTx = async (id, result) => {
    const reason = result === 'failed' ? (prompt('Reason for rejection (shown to merchant):') || 'Rejected by admin') : null;
    try {
      const token = adminAuth.get();
      await api.adminResolvePlatformTransaction(token, id, result, reason);
      await reload();
    } catch (e) {
      alert(e.message || 'Failed to update');
    }
  };

  if (!ready) return null;

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/console/merchants" className="flex items-center gap-2">
            <span className="text-brand-600"><LogoMark className="w-7 h-7" /></span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Pay<span className="text-brand-600">Verify</span>
            </span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Console</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/console/merchants" className="text-slate-600 hover:text-slate-900 text-sm">Merchants</Link>
            <Link href="/console/providers" className="text-slate-600 hover:text-slate-900 text-sm">Providers</Link>
            <Link href="/console/platform-account" className="text-brand-600 font-semibold text-sm">Platform</Link>
            <Link href="/console/support" className="text-slate-600 hover:text-slate-900 text-sm">Support</Link>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Account</h1>
          <p className="text-sm text-slate-600 mt-1">
            This is the in-house "merchant" that receives wallet top-ups from real merchants. Configure receiving gateways here and bind your phone's APK to it.
          </p>
        </div>

        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>}

        {/* Info card */}
        {info && (
          <div className="card p-6 grid sm:grid-cols-2 gap-5">
            <Field label="Platform merchant ID" value={info.id} mono />
            <Field label="Wallet balance" value={`₹${Number(info.wallet_balance || 0).toFixed(2)}`} />
            <Field label="Active gateways" value={`${info.active_gateway_count}`} />
            <Field label="Bound devices" value={`${info.bound_device_count}`} />
            <div className="sm:col-span-2">
              <label className="label">Device Auth Key (paste into APK to bind your phone)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
                  {showKey ? info.device_auth_key : '••••••' + (info.device_auth_key || '').slice(-4)}
                </code>
                <button onClick={() => setShowKey((s) => !s)} className="btn-secondary !py-1.5 text-xs">
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(info.device_auth_key || '')}
                  className="btn-secondary !py-1.5 text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gateways */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900">Receiving gateways</h2>
            <AddGatewayInline
              providers={providers}
              onCreated={reload}
            />
          </div>
          <div className="card overflow-hidden">
            {!gateways ? (
              <div className="p-6 text-slate-500 text-sm">Loading…</div>
            ) : gateways.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No gateways yet. Add one above so merchants can pay into it.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Account</th>
                    <th className="px-4 py-3 font-medium">Label</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {gateways.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900 capitalize">{g.provider}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{g.account_number}</td>
                      <td className="px-4 py-3 text-slate-700">{g.label || <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-3">
                        {g.is_enabled
                          ? <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">Active</span>
                          : <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-semibold">Disabled</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button
                          onClick={async () => { const token = adminAuth.get(); await api.adminTogglePlatformGateway(token, g.id); reload(); }}
                          className="text-xs text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          {g.is_enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this gateway? Any pending recharges using it will need manual cleanup.')) return;
                            try {
                              const token = adminAuth.get();
                              await api.adminDeletePlatformGateway(token, g.id);
                              reload();
                            } catch (e) { alert(e.message); }
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Devices */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Bound APK devices</h2>
          <div className="card overflow-hidden">
            {!devices || devices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No phones bound yet. Install the PayVerify APK on your phone and paste the device auth key above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Bound</th>
                    <th className="px-4 py-3 font-medium">Last seen</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{d.manufacturer || ''} {d.model || ''} <span className="text-xs text-slate-500 font-mono">({d.device_id})</span></td>
                      <td className="px-4 py-3 text-slate-600">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">
                        {d.is_online
                          ? <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">Online</span>
                          : <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-semibold">Offline</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recharge queue */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Recent recharges</h2>
          <div className="card overflow-x-auto">
            {!recharges || recharges.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No recharge attempts yet.</div>
            ) : (
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Merchant</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Gateway</th>
                    <th className="px-4 py-3 font-medium">TxnID</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recharges.map((r) => (
                    <tr key={r.session_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{new Date(r.session_created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-900">{r.merchant_name || <span className="text-slate-400 italic">unknown</span>}</td>
                      <td className="px-4 py-3 font-semibold">{r.currency} {Number(r.amount).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">{r.provider ? `${r.provider} · ${r.account_number}` : <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{r.txnid_submitted || <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-3"><RechargeStatusPill tx={r.tx_status} session={r.session_status} /></td>
                      <td className="px-4 py-3 text-right">
                        {r.tx_status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onResolveTx(r.transaction_id, 'success')} className="text-xs font-semibold text-emerald-700 hover:underline">Approve</button>
                            <button onClick={() => onResolveTx(r.transaction_id, 'failed')}  className="text-xs font-semibold text-rose-600 hover:underline">Reject</button>
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className={`text-slate-900 ${mono ? 'font-mono text-sm' : 'font-semibold'}`}>{value}</div>
    </div>
  );
}

function RechargeStatusPill({ tx, session }) {
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

function AddGatewayInline({ providers, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ provider: '', variant: 'personal', account_number: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-primary !py-2">+ Add gateway</button>;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const token = adminAuth.get();
      await api.adminCreatePlatformGateway(token, form);
      setOpen(false);
      setForm({ provider: '', variant: 'personal', account_number: '', label: '' });
      onCreated();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card p-4 flex flex-wrap items-end gap-3 max-w-3xl">
      <div>
        <label className="label">Provider</label>
        <select
          required
          value={form.provider}
          onChange={(e) => setForm({ ...form, provider: e.target.value })}
          className="input !w-40"
        >
          <option value="">Select…</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Variant</label>
        <select
          value={form.variant}
          onChange={(e) => setForm({ ...form, variant: e.target.value })}
          className="input !w-32"
        >
          <option value="personal">Personal</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="label">Account number</label>
        <input
          required
          value={form.account_number}
          onChange={(e) => setForm({ ...form, account_number: e.target.value })}
          placeholder="01799999999"
          className="input"
        />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="label">Label (optional)</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Primary"
          className="input"
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} disabled={saving} className="btn-secondary !py-2">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary !py-2">{saving ? 'Adding…' : 'Add'}</button>
      </div>
      {error && <div className="basis-full text-sm text-rose-600">{error}</div>}
    </form>
  );
}
