'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import ConsoleShell from '@/components/console/ConsoleShell';

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
  const [showAddGateway, setShowAddGateway] = useState(false);

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
    <ConsoleShell>
      <div className="space-y-8">
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
            <div>
              <h2 className="font-semibold text-slate-900">Receiving gateways</h2>
              <p className="text-xs text-slate-500 mt-0.5">Wallet accounts merchants pay into when topping up their balance.</p>
            </div>
            {!showAddGateway && (gateways && gateways.length > 0) && (
              <button onClick={() => setShowAddGateway(true)} className="btn-primary !py-2">+ Add gateway</button>
            )}
          </div>

          {/* The add-form sits prominently at the top of the section when open. */}
          {showAddGateway && (
            <AddGatewayForm
              providers={providers}
              onCreated={() => { setShowAddGateway(false); reload(); }}
              onCancel={() => setShowAddGateway(false)}
            />
          )}

          {/* List / empty state */}
          {!gateways ? (
            <div className="card p-6 text-slate-500 text-sm">Loading…</div>
          ) : gateways.length === 0 ? (
            !showAddGateway && (
              <div className="card p-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div className="font-semibold text-slate-900">No receiving gateways yet</div>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Add at least one bKash / Nagad / Rocket / Upay account so merchants can top up their wallets.
                </p>
                <button onClick={() => setShowAddGateway(true)} className="btn-primary mt-5 !py-2">
                  + Add your first gateway
                </button>
              </div>
            )
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Provider</th>
                    <th className="px-4 py-3 text-left font-medium">Account</th>
                    <th className="px-4 py-3 text-left font-medium">Label</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gateways.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900 capitalize">{g.provider}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{g.account_number}</td>
                      <td className="px-4 py-3 text-slate-700">{g.label || <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-3">
                        {g.is_enabled
                          ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Active</span>
                          : <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 text-[11px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>Disabled</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={async () => { const token = adminAuth.get(); await api.adminTogglePlatformGateway(token, g.id); reload(); }}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-slate-100"
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
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-md hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </ConsoleShell>
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

function prettyVariant(v) {
  // Built-ins get a nicer label; anything custom an admin invented is title-cased.
  const map = { personal: 'Personal', agent: 'Agent', merchant: 'Merchant', business: 'Business' };
  return map[v] || (v ? v.charAt(0).toUpperCase() + v.slice(1) : '');
}

function AddGatewayForm({ providers, onCreated, onCancel }) {
  const [form, setForm] = useState({ provider: '', variant: '', account_number: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const selectedProvider = providers.find((p) => p.id === form.provider);
  const variants = selectedProvider?.variants?.length ? selectedProvider.variants : [];

  // When the provider changes, default the variant to the first one this
  // provider supports (so we never submit a variant that doesn't belong).
  const onProviderChange = (providerId) => {
    const p = providers.find((x) => x.id === providerId);
    const firstVariant = p?.variants?.[0] || '';
    setForm({ ...form, provider: providerId, variant: firstVariant });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const token = adminAuth.get();
      await api.adminCreatePlatformGateway(token, form);
      onCreated();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6 mb-4 border-brand-200/60 ring-1 ring-brand-500/10">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-slate-900">Add receiving gateway</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The wallet account merchants will pay into. Make sure the account number matches what appears in your wallet SMS.
          </p>
        </div>
        <button onClick={onCancel} type="button" className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-1">
          <label className="label">Provider</label>
          <select
            required
            value={form.provider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="input"
          >
            <option value="">Select a wallet…</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1">
          <label className="label">
            Account type
            {!selectedProvider && <span className="text-slate-400 font-normal ml-1">(pick a provider first)</span>}
          </label>
          {!selectedProvider ? (
            <div className="input bg-slate-50 text-slate-400 cursor-not-allowed flex items-center">—</div>
          ) : variants.length === 1 ? (
            // Single-variant provider: no choice to make, just show the label.
            <div className="input bg-slate-50 text-slate-700 flex items-center">
              {prettyVariant(variants[0])}
            </div>
          ) : variants.length <= 3 ? (
            // 2–3 variants render as inline pills.
            <div className="flex gap-2 flex-wrap">
              {variants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm({ ...form, variant: v })}
                  className={`flex-1 min-w-[100px] px-3 py-2 text-sm font-medium rounded-md border transition ${
                    form.variant === v
                      ? 'bg-brand-50 border-brand-300 text-brand-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {prettyVariant(v)}
                </button>
              ))}
            </div>
          ) : (
            // 4+ variants — too many for pills, fall back to a dropdown.
            <select
              value={form.variant}
              onChange={(e) => setForm({ ...form, variant: e.target.value })}
              className="input"
            >
              {variants.map((v) => (
                <option key={v} value={v}>{prettyVariant(v)}</option>
              ))}
            </select>
          )}
        </div>

        <div className="sm:col-span-1">
          <label className="label">Account number</label>
          <input
            required
            value={form.account_number}
            onChange={(e) => setForm({ ...form, account_number: e.target.value })}
            placeholder={selectedProvider?.id === 'bkash' || selectedProvider?.id === 'nagad' ? '01799999999' : 'Account / wallet number'}
            className="input font-mono"
            inputMode="numeric"
          />
          <p className="text-xs text-slate-500 mt-1">Use the exact format that appears in your wallet's confirmation SMS.</p>
        </div>

        <div className="sm:col-span-1">
          <label className="label">Label <span className="text-slate-400 font-normal">(optional)</span></label>
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Primary / Backup / Personal phone"
            className="input"
          />
        </div>

        {error && (
          <div className="sm:col-span-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">
            {error}
          </div>
        )}

        <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onCancel} disabled={saving} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">
            Cancel
          </button>
          <button type="submit" disabled={saving || !form.provider || !form.account_number.trim()} className="btn-primary !py-2">
            {saving ? 'Adding…' : 'Add gateway'}
          </button>
        </div>
      </form>
    </div>
  );
}
