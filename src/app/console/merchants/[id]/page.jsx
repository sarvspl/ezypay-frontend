'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import ConsoleShell from '@/components/console/ConsoleShell';

export default function ConsoleMerchantDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const ready = useGuard('admin');
  const [merchant, setMerchant] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    const token = adminAuth.get();
    api.adminGetMerchant(token, id)
      .then((r) => setMerchant(r.merchant))
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else setError(e.message);
      });
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, router, id]); // eslint-disable-line


  const onSuspend = async () => {
    const reason = prompt(`Suspend ${merchant.name}? Reason (optional, shown to the merchant):`, '');
    if (reason === null) return; // cancelled
    setBusy(true);
    try {
      const token = adminAuth.get();
      await api.adminSuspendMerchant(token, id, reason.trim() || null);
      load();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };
  const onUnsuspend = async () => {
    if (!confirm(`Reactivate ${merchant.name}?`)) return;
    setBusy(true);
    try {
      const token = adminAuth.get();
      await api.adminUnsuspendMerchant(token, id);
      load();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };

  if (!ready) return null;

  return (
    <ConsoleShell>
      <div className="max-w-5xl mx-auto">
        <Link href="/console/merchants" className="text-sm text-slate-600 hover:text-brand-600">← All merchants</Link>

        {error && (
          <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
        )}

        {!merchant && !error && <div className="mt-6 text-slate-500">Loading…</div>}

        {merchant && (
          <>
            <div className="flex items-start justify-between flex-wrap gap-3 mt-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-slate-900">{merchant.name}</h1>
                  {merchant.is_suspended
                    ? <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-semibold">Suspended</span>
                    : <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold">Active</span>}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">@{merchant.username} &middot; {merchant.domain}</p>
              </div>
              {merchant.is_suspended
                ? <button disabled={busy} onClick={onUnsuspend} className="btn-primary !py-1.5 text-sm">Reactivate</button>
                : <button disabled={busy} onClick={onSuspend} className="btn-secondary !py-1.5 text-sm !text-rose-600 hover:!bg-rose-50 hover:!border-rose-300">Suspend merchant</button>}
            </div>

            {merchant.is_suspended && (
              <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
                <div className="font-semibold">This merchant is suspended.</div>
                <div className="text-rose-700/90 mt-0.5">
                  {merchant.suspended_reason || 'No reason provided.'}
                  {merchant.suspended_at && <span className="text-rose-600/70"> · {new Date(merchant.suspended_at).toLocaleString()}</span>}
                </div>
                <div className="text-xs text-rose-600/80 mt-1">Login, API key requests, and APK polls are blocked while suspended.</div>
              </div>
            )}

            <section className="card p-6 mt-6 grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <Field label="Email"           value={merchant.email} />
              <Field label="Mobile"          value={merchant.mobile} />
              <Field label="Industry"        value={merchant.industry} />
              <Field label="Country"         value={merchant.country} />
              <Field label="State"           value={merchant.state} />
              <Field label="Wallet balance"  value={Number(merchant.wallet_balance).toFixed(2)} />
              <Field label="Joined"          value={new Date(merchant.created_at).toLocaleString()} />
            </section>

            <section className="card p-6 mt-6">
              <h2 className="font-semibold text-slate-900">Credentials</h2>
              <p className="text-xs text-slate-500 mt-1">Masked for security. Only last 4 characters shown.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="API Key"          value={merchant.api_key_masked} mono />
                <Field label="Device Auth Key"  value={merchant.device_auth_key_masked} mono />
              </div>
            </section>
          </>
        )}
      </div>
    </ConsoleShell>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-slate-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</div>
    </div>
  );
}
