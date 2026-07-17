'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { formatMoney } from '@/lib/money';
import { labelVariant } from '@/lib/providers';
import { formatDay } from '@/lib/dates';
import DateRangeFilter from '@/components/dashboard/DateRangeFilter';
import { useMerchant } from '../layout';
import UnlockKeysModal from '@/components/dashboard/UnlockKeysModal';

export default function AccountsPage() {
  const router = useRouter();
  const { merchant, refreshMerchant } = useMerchant();
  const [accounts, setAccounts] = useState(null);
  const [fees, setFees] = useState({ full: 0, account: 0 });
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [range, setRange] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const params = {};
      if (from) params.from = from;
      if (to)   params.to = to;
      const r = await api.merchantListAccounts(token, params);
      setAccounts(r.accounts || []);
      setFees({ full: Number(r.key_unlock_fee || 0), account: Number(r.account_unlock_fee || 0) });
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };
  // Refetch whenever the range changes — the totals are computed server-side.
  useEffect(() => { load(); }, [from, to]); // eslint-disable-line

  const applyRange = ({ range: r, from: f, to: t }) => {
    if (r !== undefined) setRange(r);
    if (f !== undefined) setFrom(f);
    if (t !== undefined) setTo(t);
  };
  const ranged = !!(from || to);

  const addAccount = async () => {
    setCreating(true);
    try {
      const token = merchantAuth.get();
      await api.merchantCreateAccount(token, { label: newName.trim() || undefined });
      setShowAdd(false);
      setNewName('');
      await load();
    } catch (e) { alert(e.message); }
    finally { setCreating(false); }
  };

  // Issue a new device key for an account. Returns the new key so the card can
  // reveal it. Refreshes the account list (and merchant profile for the default
  // account, whose key is mirrored on the dashboard home).
  const regenerate = async (accountId, isDefault) => {
    const token = merchantAuth.get();
    const r = await api.merchantRegenerateAccountKey(token, accountId);
    await load();
    if (isDefault) await refreshMerchant?.();
    return r.device_auth_key;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Accounts</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Each account has its own <strong>device auth key</strong> and up to <strong>8 gateways</strong>. Your domain
            {merchant?.domain ? <> (<span className="font-medium">{merchant.domain}</span>)</> : null} and API key are shared across all accounts.
            An extra account unlocks for {fees.account > 0 ? formatMoney(fees.account, merchant?.currency) : 'free'} and gives you a new device key.
          </p>
        </div>
        {!showAdd && (
          <button onClick={() => { setShowAdd(true); setNewName(''); }} className="btn-primary whitespace-nowrap">
            + Add account
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card p-4 sm:p-5">
          <label className="label">Account name</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !creating) addAccount(); }}
              maxLength={120}
              placeholder="e.g. Counter 2 / Branch — Dhanmondi"
              className="input flex-1"
            />
            <div className="flex gap-2">
              <button onClick={addAccount} disabled={creating} className="btn-primary whitespace-nowrap">
                {creating ? 'Creating…' : 'Create account'}
              </button>
              <button onClick={() => { setShowAdd(false); setNewName(''); }} disabled={creating} className="btn-secondary">Cancel</button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Optional — you can rename it later. The new account starts locked; unlock it to get its device key.</p>
        </div>
      )}

      <div className="card p-3 sm:p-4">
        <DateRangeFilter range={range} from={from} to={to} onChange={applyRange} />
      </div>

      {error && <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>}
      {!accounts && !error && <div className="card p-10 text-center text-slate-500">Loading accounts…</div>}

      {accounts && (
        <div className="space-y-3">
          {accounts.map((a, i) => (
            <AccountCard
              key={a.id}
              account={a}
              index={i}
              unlockFee={a.is_default ? fees.full : fees.account}
              currency={merchant?.currency}
              ranged={ranged}
              onUnlock={() => setUnlockTarget(a)}
              onRegenerate={() => regenerate(a.id, a.is_default)}
            />
          ))}
        </div>
      )}

      {unlockTarget && (
        <UnlockKeysModal
          open
          onClose={() => setUnlockTarget(null)}
          merchant={merchant}
          accountId={unlockTarget.is_default ? null : unlockTarget.id}
          brandId={null}
          fee={unlockTarget.is_default ? fees.full : fees.account}
          title={unlockTarget.is_default ? 'Unlock integration keys' : 'Unlock account'}
          onUnlocked={async () => { await refreshMerchant?.(); await load(); }}
        />
      )}
    </div>
  );
}

function AccountCard({ account, index, unlockFee, currency, ranged, onUnlock, onRegenerate }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const locked = !account.keys_unlocked;
  const title = account.label || (account.is_default ? 'Primary' : `Account ${index + 1}`);

  const copy = async () => {
    try { await navigator.clipboard.writeText(account.device_auth_key); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const regenerate = async () => {
    const ok = window.confirm(
      'Generate a new device key for this account?\n\n' +
      'The phone currently bound to this account will STOP working until you ' +
      'open the app on that phone and enter the new key. Your old key will no ' +
      'longer be accepted.'
    );
    if (!ok) return;
    setRegenerating(true);
    try {
      await onRegenerate();
      setShow(true); // reveal the freshly issued key so it can be copied
    } catch (e) {
      alert(e?.message || 'Could not regenerate the key.');
    } finally {
      setRegenerating(false);
    }
  };

  const c = account.tx_counts || { total: 0, success: 0, failed: 0, pending: 0, success_volume: 0 };

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {account.is_default && (
            <span className="inline-flex rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[11px] font-semibold">Default</span>
          )}
        </div>
        <span className="text-xs text-slate-400">{(account.gateways || []).length}/8 gateways</span>
      </div>

      {/* Per-account transaction stats — which device did how much */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Total</div>
          <div className="text-base font-bold text-slate-900 tabular-nums">{c.total}</div>
        </div>
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700">Done</div>
          <div className="text-base font-bold text-emerald-700 tabular-nums">{c.success}</div>
        </div>
        <div className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-amber-700">Pending</div>
          <div className="text-base font-bold text-amber-700 tabular-nums">{c.pending}</div>
        </div>
        <div className="rounded-md bg-rose-50 border border-rose-200 px-2 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-rose-700">Failed</div>
          <div className="text-base font-bold text-rose-700 tabular-nums">{c.failed}</div>
        </div>
      </div>
      {c.success > 0 && (
        <div className="mt-1.5 text-xs text-slate-500">
          Volume confirmed{ranged ? ' in range' : ''}:{' '}
          <strong className="text-slate-800 tabular-nums">{formatMoney(c.success_volume, currency)}</strong>
        </div>
      )}

      {/* Device auth key */}
      <div className="mt-4">
        <label className="label">Device Auth Key (APK binding)</label>
        {locked ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-slate-600">Locked — unlock to reveal this account's device key.</span>
            <button onClick={onUnlock} className="btn-secondary !py-1.5 text-xs shrink-0">
              {Number(unlockFee) > 0 ? `Unlock — ${formatMoney(unlockFee, currency)}` : 'Unlock'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <code className="flex-1 min-w-0 break-all font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2">
              {show ? account.device_auth_key : '••••••' + String(account.device_auth_key || '').slice(-4)}
            </code>
            <button onClick={() => setShow((s) => !s)} className="btn-secondary !py-1.5 text-xs shrink-0">{show ? 'Hide' : 'Show'}</button>
            <button onClick={copy} className={`btn-secondary !py-1.5 text-xs shrink-0 ${copied ? '!text-emerald-600 !border-emerald-300' : ''}`}>{copied ? '✓' : 'Copy'}</button>
            <button
              onClick={regenerate}
              disabled={regenerating}
              title="Issue a new, stronger device key (disconnects the currently bound phone)"
              className="btn-secondary !py-1.5 text-xs shrink-0"
            >
              {regenerating ? 'Regenerating…' : 'Regenerate'}
            </button>
          </div>
        )}
        {!locked && (
          <p className="mt-1.5 text-xs text-slate-500">
            Regenerating issues a new key and disconnects the bound phone — re-open the app and enter the new key to reconnect.
          </p>
        )}
      </div>

      {/* Gateways — each expands to its day-by-day confirmed money in */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            Gateways <span className="text-slate-400 normal-case font-normal">· click one for its daily breakdown</span>
          </span>
          <Link href="/dashboard/gateways" className="text-xs text-brand-600 hover:underline">Manage →</Link>
        </div>
        {(account.gateways || []).length === 0 ? (
          <p className="text-sm text-slate-400">No gateways yet{locked ? ' (unlock first)' : ''}.</p>
        ) : (
          <div className="space-y-1.5">
            {account.gateways.map((g) => (
              <GatewayRow key={g.id} gateway={g} currency={currency} ranged={ranged} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One gateway, collapsed to its range total. Expanding reveals which day the
 * money arrived on — the figures to reconcile against the provider's own
 * statement. Only days with a confirmed payment are listed.
 */
function GatewayRow({ gateway: g, currency, ranged }) {
  const [open, setOpen] = useState(false);
  const days = g.days || [];
  const hasDays = days.length > 0;

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={() => hasDays && setOpen((o) => !o)}
        aria-expanded={hasDays ? open : undefined}
        className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs text-left ${
          hasDays ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'
        }`}
      >
        <ChevronIcon
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-90' : ''} ${
            hasDays ? 'text-slate-400' : 'text-transparent'
          }`}
        />
        <span className="font-semibold capitalize">{g.provider}</span>
        <span className="text-slate-400">{labelVariant(g.variant)}</span>
        <span className="font-mono text-slate-700">{g.account_number}</span>
        {!g.is_enabled && <span className="text-rose-500">· off</span>}

        <span className="ml-auto flex items-center gap-2 shrink-0">
          {hasDays && (
            <span className="text-slate-400 hidden sm:inline">
              {days.length} {days.length === 1 ? 'day' : 'days'}
            </span>
          )}
          {g.success_volume > 0 ? (
            <span className="bg-emerald-50 text-emerald-700 font-semibold px-1 rounded border border-emerald-100 font-mono text-[10px]">
              {formatMoney(g.success_volume, currency)}
            </span>
          ) : (
            <span className="text-slate-400 text-[10px]">{ranged ? 'nothing in range' : 'nothing yet'}</span>
          )}
        </span>
      </button>

      {open && hasDays && (
        <div className="border-t border-slate-200 bg-white px-2.5 py-1.5">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              {days.map((d) => (
                <tr key={d.day}>
                  <td className="py-1.5 text-slate-700 whitespace-nowrap">{formatDay(d.day)}</td>
                  <td className="py-1.5 text-slate-400 text-right whitespace-nowrap pr-3">
                    {d.success_count} {d.success_count === 1 ? 'txn' : 'txns'}
                  </td>
                  <td className="py-1.5 text-right font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatMoney(d.success_volume, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className = 'w-4 h-4' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
