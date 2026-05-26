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
  const [settings, setSettings] = useState(null);
  const [revenue, setRevenue] = useState(null);

  const reload = async () => {
    const token = adminAuth.get();
    try {
      const [i, g, d, r, p, s, rev] = await Promise.all([
        api.adminGetPlatform(token),
        api.adminListPlatformGateways(token),
        api.adminListPlatformDevices(token),
        api.adminListPlatformRecharges(token, { limit: 30 }),
        api.listProviders(),
        api.adminGetPlatformSettings(token),
        api.adminGetPlatformRevenue(token),
      ]);
      setInfo(i.platform);
      setGateways(g.gateways || []);
      setDevices(d.devices || []);
      setRecharges(r.recharges || []);
      setProviders(p.providers || []);
      setSettings(s.settings || null);
      setRevenue(rev || null);
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
            <Field label="Wallet balance" value={`${currencySymbol(info.currency || 'BDT')}${Number(info.wallet_balance || 0).toFixed(2)}`} />
            <Field label="Active gateways" value={`${info.active_gateway_count}`} />
            <Field label="Bound devices" value={`${info.bound_device_count}`} />
            <div className="sm:col-span-2">
              <label className="label">Device Auth Key (paste into APK to bind your phone)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 break-all font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
                  {showKey ? info.device_auth_key : '••••••' + (info.device_auth_key || '').slice(-4)}
                </code>
                <button onClick={() => setShowKey((s) => !s)} className="btn-secondary !py-1.5 text-xs shrink-0">
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(info.device_auth_key || '')}
                  className="btn-secondary !py-1.5 text-xs shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin wallet / earnings */}
        <EarningsSection revenue={revenue} />

        {/* Pricing */}
        <PricingSection
          settings={settings}
          onSaved={(next) => setSettings(next)}
          currency={info?.currency || 'BDT'}
        />

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
            <div className="card overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
          <div className="card overflow-x-auto">
            {!devices || devices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">
                  No phones bound yet. Install the EzyPay APK on your phone and paste the device auth key above.
                </p>
                <a
                  href="/ezypay.apk"
                  download
                  className="inline-flex items-center gap-2 mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg px-4 py-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download APK
                </a>
                <div className="text-[11px] text-slate-400 mt-1.5">Android only · ~50&nbsp;MB</div>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[640px]">
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
                      <td className="px-4 py-3 text-slate-600">{new Date(d.created_at).toLocaleDateString(undefined, { timeZone: 'Asia/Dhaka' })}</td>
                      <td className="px-4 py-3 text-slate-600">{d.last_seen_at ? new Date(d.last_seen_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) : '—'}</td>
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
                      <td className="px-4 py-3 text-slate-600">{new Date(r.session_created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}</td>
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
      <div className={`text-slate-900 ${mono ? 'font-mono text-sm break-all' : 'font-semibold'}`}>{value}</div>
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

function EarningsSection({ revenue }) {
  const cur = revenue?.currency || 'BDT';
  const money = (n) => `${currencySymbol(cur)}${Number(n || 0).toFixed(2)}`;

  return (
    <div>
      <div className="mb-3">
        <h2 className="font-semibold text-slate-900">Admin wallet — earnings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Platform income from verification fees and wallet top-up fees, and where it came from.
        </p>
      </div>

      {!revenue ? (
        <div className="card p-6 text-slate-500 text-sm">Loading earnings…</div>
      ) : (
        <div className="space-y-4">
          {/* Summary tiles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Total earned" value={money(revenue.total)} accent />
            <StatTile label="Verification fees" value={money(revenue.verify_fee_total)} />
            <StatTile label="Top-up fees" value={money(revenue.topup_fee_total)} />
            <StatTile label="This month" value={money(revenue.this_month)} sub={`Today ${money(revenue.today)}`} />
          </div>

          {/* Recent income */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-medium">
              Recent income
            </div>
            {(!revenue.recent || revenue.recent.length === 0) ? (
              <div className="p-8 text-center text-slate-500 text-sm">No earnings yet.</div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">When</th>
                    <th className="px-4 py-2.5 text-left font-medium">Source</th>
                    <th className="px-4 py-2.5 text-left font-medium">From merchant</th>
                    <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenue.recent.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 text-slate-600">{new Date(row.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}</td>
                      <td className="px-4 py-2.5">
                        {row.type === 'topup_fee'
                          ? <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 text-[11px] font-semibold">Top-up fee</span>
                          : <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">Verification fee</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">{row.merchant_name || <span className="text-slate-400 italic">unknown</span>}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-700 tabular-nums">
                        +{currencySymbol(row.currency || cur)}{Number(row.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className={`card p-4 ${accent ? 'bg-brand-50 border-brand-200' : ''}`}>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-xl font-bold tabular-nums ${accent ? 'text-brand-900' : 'text-slate-900'}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function PricingSection({ settings, onSaved, currency: defaultCurrency }) {
  const [form, setForm] = useState({
    verify_charge_enabled: false,
    verify_charge_type: 'fixed',
    verify_charge_amount: '',
    verify_charge_percent: '',
    verify_charge_currency: defaultCurrency || 'BDT',
    low_balance_threshold: '',
    topup_fee_enabled: false,
    topup_fee_percent: '',
    key_unlock_fee: '',
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!settings) return;
    setForm({
      verify_charge_enabled: !!settings.verify_charge_enabled,
      verify_charge_type: settings.verify_charge_type === 'percent' ? 'percent' : 'fixed',
      verify_charge_amount: settings.verify_charge_amount != null ? String(settings.verify_charge_amount) : '',
      verify_charge_percent: trimNum(settings.verify_charge_percent),
      verify_charge_currency: settings.verify_charge_currency || defaultCurrency || 'BDT',
      low_balance_threshold: settings.low_balance_threshold != null ? String(settings.low_balance_threshold) : '',
      topup_fee_enabled: !!settings.topup_fee_enabled,
      topup_fee_percent: trimNum(settings.topup_fee_percent),
      key_unlock_fee: settings.key_unlock_fee != null ? String(settings.key_unlock_fee) : '',
    });
  }, [settings, defaultCurrency]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSavedAt(null);
    try {
      const token = adminAuth.get();
      const r = await api.adminUpdatePlatformSettings(token, {
        verify_charge_enabled: form.verify_charge_enabled,
        verify_charge_type: form.verify_charge_type,
        verify_charge_amount: Number(form.verify_charge_amount) || 0,
        verify_charge_percent: Number(form.verify_charge_percent) || 0,
        verify_charge_currency: form.verify_charge_currency,
        low_balance_threshold: Number(form.low_balance_threshold) || 0,
        topup_fee_enabled: form.topup_fee_enabled,
        topup_fee_percent: Number(form.topup_fee_percent) || 0,
        key_unlock_fee: Number(form.key_unlock_fee) || 0,
      });
      onSaved?.(r.settings);
      setSavedAt(new Date());
    } catch (e2) {
      setError(e2.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="card p-6 text-slate-500 text-sm">Loading pricing…</div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="font-semibold text-slate-900">Pricing</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Per-verification fee debited from each merchant's wallet on a successful payment verification.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card p-5 sm:p-6 space-y-5">
        {/* Enable toggle */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.verify_charge_enabled}
            onChange={(e) => setForm({ ...form, verify_charge_enabled: e.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="font-semibold text-slate-900">Charge merchants per verification</span>
            <span className="block text-xs text-slate-500 mt-0.5">
              When enabled, every successful payment verification debits the configured fee from the merchant's wallet.
            </span>
          </span>
        </label>

        {/* Charge type — flat amount vs % of the payment */}
        <div>
          <label className="label">Charge type</label>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
            {[
              { v: 'fixed',   label: 'Fixed amount' },
              { v: 'percent', label: 'Percentage of payment' },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setForm({ ...form, verify_charge_type: opt.v })}
                disabled={!form.verify_charge_enabled}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  form.verify_charge_type === opt.v
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {form.verify_charge_type === 'percent'
              ? 'Debit a percentage of each verified payment amount.'
              : 'Debit the same flat fee on every verification, regardless of payment size.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            {form.verify_charge_type === 'percent' ? (
              <>
                <label className="label">Fee percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.verify_charge_percent}
                    onChange={(e) => setForm({ ...form, verify_charge_percent: e.target.value })}
                    placeholder="1.50"
                    className="input !pr-8"
                    disabled={!form.verify_charge_enabled}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">0 means free — same as leaving it disabled.</p>
              </>
            ) : (
              <>
                <label className="label">Fee per verification</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {currencySymbol(form.verify_charge_currency)}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={form.verify_charge_amount}
                    onChange={(e) => setForm({ ...form, verify_charge_amount: e.target.value })}
                    placeholder="0.50"
                    className="input !pl-8"
                    disabled={!form.verify_charge_enabled}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">0 means free — same as leaving it disabled.</p>
              </>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="label">Currency</label>
            <select
              value={form.verify_charge_currency}
              onChange={(e) => setForm({ ...form, verify_charge_currency: e.target.value })}
              className="input"
              disabled={!form.verify_charge_enabled}
            >
              <option value="BDT">BDT — Bangladeshi Taka</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound Sterling</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="label">Low balance warning</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {currencySymbol(form.verify_charge_currency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.low_balance_threshold}
                onChange={(e) => setForm({ ...form, low_balance_threshold: e.target.value })}
                placeholder="50"
                className="input !pl-8"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Merchants below this are flagged on their dashboard.</p>
          </div>
        </div>

        {/* Preview */}
        {form.verify_charge_enabled && form.verify_charge_type === 'fixed' && Number(form.verify_charge_amount) > 0 && (
          <div className="rounded-lg bg-brand-50 border border-brand-200 p-3 text-sm">
            <span className="font-semibold text-brand-900">Preview: </span>
            <span className="text-brand-800">
              Each verification will deduct{' '}
              <strong>{fmtMoney(form.verify_charge_amount, form.verify_charge_currency)}</strong>{' '}
              from the merchant's wallet. So 1,000 successful verifications cost{' '}
              <strong>{fmtMoney(Number(form.verify_charge_amount) * 1000, form.verify_charge_currency)}</strong>.
            </span>
          </div>
        )}
        {form.verify_charge_enabled && form.verify_charge_type === 'percent' && Number(form.verify_charge_percent) > 0 && (
          <div className="rounded-lg bg-brand-50 border border-brand-200 p-3 text-sm">
            <span className="font-semibold text-brand-900">Preview: </span>
            <span className="text-brand-800">
              Each verification will deduct{' '}
              <strong>{trimNum(form.verify_charge_percent)}%</strong>{' '}
              of the payment amount. A{' '}
              <strong>{fmtMoney(10000, form.verify_charge_currency)}</strong> payment costs{' '}
              <strong>{fmtMoney(Number(form.verify_charge_percent) * 10000 / 100, form.verify_charge_currency)}</strong>;
              a <strong>{fmtMoney(500, form.verify_charge_currency)}</strong> payment costs{' '}
              <strong>{fmtMoney(Number(form.verify_charge_percent) * 500 / 100, form.verify_charge_currency)}</strong>.
            </span>
          </div>
        )}

        {/* ─── Wallet top-up fee ─── */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.topup_fee_enabled}
              onChange={(e) => setForm({ ...form, topup_fee_enabled: e.target.checked })}
              className="mt-1"
            />
            <span>
              <span className="font-semibold text-slate-900">Charge a wallet top-up fee</span>
              <span className="block text-xs text-slate-500 mt-0.5">
                A percentage added on top of every recharge. The merchant pays the amount they want credited plus this fee; you keep the fee.
              </span>
            </span>
          </label>

          <div className="sm:max-w-xs">
            <label className="label">Top-up fee percentage</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="100"
                value={form.topup_fee_percent}
                onChange={(e) => setForm({ ...form, topup_fee_percent: e.target.value })}
                placeholder="1.00"
                className="input !pr-8"
                disabled={!form.topup_fee_enabled}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">0 means free top-ups — same as leaving it disabled.</p>
          </div>

          {form.topup_fee_enabled && Number(form.topup_fee_percent) > 0 && (
            <div className="rounded-lg bg-brand-50 border border-brand-200 p-3.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-2">
                Preview · on a {fmtMoney(1000, form.verify_charge_currency)} recharge
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-brand-800">
                  <dt>Merchant receives</dt>
                  <dd className="tabular-nums font-medium">{fmtMoney(1000, form.verify_charge_currency)}</dd>
                </div>
                <div className="flex justify-between text-brand-800">
                  <dt>Top-up fee ({trimNum(form.topup_fee_percent)}%) — you earn</dt>
                  <dd className="tabular-nums font-medium">{fmtMoney(Number(form.topup_fee_percent) * 1000 / 100, form.verify_charge_currency)}</dd>
                </div>
                <div className="flex justify-between font-semibold text-brand-900 pt-1.5 border-t border-brand-200">
                  <dt>Merchant pays</dt>
                  <dd className="tabular-nums">{fmtMoney(1000 + Number(form.topup_fee_percent) * 1000 / 100, form.verify_charge_currency)}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* ─── Integration key unlock fee ─── */}
        <div className="pt-5 border-t border-slate-100 space-y-3">
          <div>
            <span className="font-semibold text-slate-900">Integration key unlock fee</span>
            <span className="block text-xs text-slate-500 mt-0.5">
              One-time charge debited from a merchant's wallet before their API key / device auth key can be revealed. 0 = keys are free to view.
            </span>
          </div>
          <div className="sm:max-w-xs">
            <label className="label">Unlock fee</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                {currencySymbol(form.verify_charge_currency)}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.key_unlock_fee}
                onChange={(e) => setForm({ ...form, key_unlock_fee: e.target.value })}
                placeholder="100000.00"
                className="input !pl-8"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Charged once per merchant; afterward their keys stay unlocked.</p>
          </div>
        </div>

        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>}
        {savedAt && !error && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">Saved.</div>}

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {settings?.updated_at ? `Last updated ${new Date(settings.updated_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}` : 'Not yet saved'}
          </div>
          <button type="submit" disabled={saving} className="btn-primary !py-2">
            {saving ? 'Saving…' : 'Save pricing'}
          </button>
        </div>
      </form>
    </div>
  );
}

function currencySymbol(code) {
  return ({ BDT: '৳', INR: '₹', USD: '$', EUR: '€', GBP: '£' })[code] || code + ' ';
}

// Money with thousands separators + 2 decimals, e.g. ৳1,010.00
function fmtMoney(n, code) {
  return `${currencySymbol(code)}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Trim trailing zeros off a stored numeric so 1.0000 shows as "1", 1.5000 as "1.5".
function trimNum(v) {
  return v == null ? '' : String(Number(v));
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
