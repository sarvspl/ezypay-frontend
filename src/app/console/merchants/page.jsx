'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import { LogoMark } from '@/components/Logo';

export default function ConsoleMerchantsPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [merchants, setMerchants] = useState(null);
  const [error, setError] = useState(null);
  const [suspendTarget, setSuspendTarget]     = useState(null); // merchant being suspended
  const [activateTarget, setActivateTarget]   = useState(null); // merchant being reactivated
  const [working, setWorking]                 = useState(false);
  const [actionError, setActionError]         = useState(null);

  const reload = () => {
    const token = adminAuth.get();
    return api.adminListMerchants(token)
      .then((r) => setMerchants(r.merchants))
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else setError(e.message);
      });
  };

  useEffect(() => { if (ready) reload(); /* eslint-disable-next-line */ }, [ready]);

  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

  const doSuspend = async (reason, forceUnbind) => {
    setWorking(true);
    setActionError(null);
    try {
      const token = adminAuth.get();
      await api.adminSuspendMerchant(token, suspendTarget.id, { reason, force_unbind: forceUnbind });
      setSuspendTarget(null);
      await reload();
    } catch (e) {
      setActionError(e.message || 'Failed to suspend');
    } finally {
      setWorking(false);
    }
  };

  const doActivate = async () => {
    setWorking(true);
    setActionError(null);
    try {
      const token = adminAuth.get();
      await api.adminUnsuspendMerchant(token, activateTarget.id);
      setActivateTarget(null);
      await reload();
    } catch (e) {
      setActionError(e.message || 'Failed to activate');
    } finally {
      setWorking(false);
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
            <Link href="/console/merchants" className="text-brand-600 font-semibold text-sm">Merchants</Link>
            <Link href="/console/providers" className="text-slate-600 hover:text-slate-900 text-sm">Providers</Link>
            <Link href="/console/platform-account" className="text-slate-600 hover:text-slate-900 text-sm">Platform</Link>
            <Link href="/console/support" className="text-slate-600 hover:text-slate-900 text-sm">Support</Link>
            <Link href="/console/merchants/new" className="btn-primary">+ Create merchant</Link>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Merchants</h1>
        <p className="text-sm text-slate-600 mt-1">All registered merchants. Read-only.</p>

        {error && (
          <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
        )}

        {!merchants && !error && (
          <div className="mt-6 text-slate-500">Loading…</div>
        )}

        {merchants && merchants.length === 0 && (
          <div className="card p-10 mt-6 text-center text-slate-500">
            No merchants yet. <Link href="/console/merchants/new" className="text-brand-600 hover:underline">Create one</Link>.
          </div>
        )}

        {merchants && merchants.length > 0 && (
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Mobile</th>
                  <th className="px-4 py-3 font-medium">Domain</th>
                  <th className="px-4 py-3 font-medium">API Key</th>
                  <th className="px-4 py-3 font-medium">Auth Key</th>
                  <th className="px-4 py-3 font-medium text-right">Wallet</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right sticky right-0 bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.08)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {merchants.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/console/merchants/${m.id}`} className="text-brand-600 hover:underline font-medium">
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {m.is_suspended
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[11px] font-semibold" title={m.suspended_reason || ''}>Suspended</span>
                        : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{m.username}</td>
                    <td className="px-4 py-3 text-slate-700">{m.email}</td>
                    <td className="px-4 py-3 text-slate-700">{m.mobile}</td>
                    <td className="px-4 py-3 text-slate-700">{m.domain}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.api_key_masked}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{m.device_auth_key_masked}</td>
                    <td className="px-4 py-3 text-right text-slate-900">{Number(m.wallet_balance).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.08)]">
                      {m.is_suspended ? (
                        <button
                          onClick={() => setActivateTarget(m)}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline whitespace-nowrap"
                        >Activate</button>
                      ) : (
                        <button
                          onClick={() => setSuspendTarget(m)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline whitespace-nowrap"
                        >Suspend</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {suspendTarget && (
        <SuspendModal
          merchant={suspendTarget}
          working={working}
          error={actionError}
          onCancel={() => { setSuspendTarget(null); setActionError(null); }}
          onConfirm={doSuspend}
        />
      )}
      {activateTarget && (
        <ActivateModal
          merchant={activateTarget}
          working={working}
          error={actionError}
          onCancel={() => { setActivateTarget(null); setActionError(null); }}
          onConfirm={doActivate}
        />
      )}
    </>
  );
}

function SuspendModal({ merchant, working, error, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [forceUnbind, setForceUnbind] = useState(false);
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-900">Suspend merchant</h2>
        <p className="mt-1 text-sm text-slate-600">
          Block <span className="font-semibold">{merchant.name}</span> from logging in, creating new payment sessions, and using their bound devices. Existing in-flight sessions complete normally.
        </p>

        <label className="block text-xs font-semibold text-slate-700 mt-5 mb-1 uppercase tracking-wider">Reason (optional)</label>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Shown to the merchant on their next login attempt"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
          disabled={working}
        />

        <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={forceUnbind}
            onChange={(e) => setForceUnbind(e.target.checked)}
            disabled={working}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Also unbind all devices</span>
            <span className="block text-xs text-slate-500 mt-0.5">Force every bound phone to re-bind with the auth_key after reactivation. Use for serious cases (fraud, hard suspension).</span>
          </span>
        </label>

        {error && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={working} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          <button
            onClick={() => onConfirm(reason.trim() || null, forceUnbind)}
            disabled={working}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            {working ? 'Suspending…' : 'Suspend merchant'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivateModal({ merchant, working, error, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-900">Activate merchant</h2>
        <p className="mt-1 text-sm text-slate-600">
          Restore access for <span className="font-semibold">{merchant.name}</span>. They can log in immediately, and any bound phones still listed under their account will resume working.
        </p>
        {merchant.suspended_reason && (
          <p className="mt-3 text-xs text-slate-500">Previously suspended with reason: <span className="italic">"{merchant.suspended_reason}"</span></p>
        )}

        {error && <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={working} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={working}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            {working ? 'Activating…' : 'Activate merchant'}
          </button>
        </div>
      </div>
    </div>
  );
}
