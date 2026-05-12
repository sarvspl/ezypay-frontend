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

  useEffect(() => {
    if (!ready) return;
    const token = adminAuth.get();
    api.adminListMerchants(token)
      .then((r) => setMerchants(r.merchants))
      .catch((e) => {
        if (e.status === 401) {
          adminAuth.clear();
          router.replace('/console/login');
        } else {
          setError(e.message);
        }
      });
  }, [ready, router]);

  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

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
          <div className="flex items-center gap-3">
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
          <div className="card mt-6 overflow-hidden">
            <table className="w-full text-sm">
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
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-[11px] font-semibold">Suspended</span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
