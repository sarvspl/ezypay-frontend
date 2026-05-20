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
                  {merchant.suspended_at && <span className="text-rose-600/70"> · {new Date(merchant.suspended_at).toLocaleString(undefined, { timeZone: 'Asia/Dhaka' })}</span>}
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
              <Field label="Joined"          value={new Date(merchant.created_at).toLocaleString(undefined, { timeZone: 'Asia/Dhaka' })} />
            </section>

            <section className="card p-6 mt-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">Credentials</h2>
                  <p className="text-xs text-slate-500 mt-1">Masked for security. Only last 4 characters shown.</p>
                </div>
                <PasswordResetButton merchantId={id} merchantName={merchant.name} />
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="API Key"          value={merchant.api_key_masked} mono />
                <Field label="Device Auth Key"  value={merchant.device_auth_key_masked} mono />
              </div>
            </section>

            <WalletSection merchantId={id} />
          </>
        )}
      </div>
    </ConsoleShell>
  );
}

/* ─── Wallet section: balance, recharge history, ledger — each paginated ─── */
function WalletSection({ merchantId }) {
  const [recharges, setRecharges] = useState(null);
  const [ledger, setLedger]       = useState(null);
  const [rPage, setRPage]         = useState(0);
  const [lPage, setLPage]         = useState(0);
  const [rTotal, setRTotal]       = useState(0);
  const [lTotal, setLTotal]       = useState(0);
  const [balance, setBalance]     = useState(null);
  const [currency, setCurrency]   = useState('BDT');
  const LIMIT = 20;

  useEffect(() => {
    const token = adminAuth.get();
    api.adminGetMerchantRecharges(token, merchantId, { limit: LIMIT, offset: rPage * LIMIT })
      .then((r) => { setRecharges(r.recharges); setRTotal(r.total); })
      .catch(() => setRecharges([]));
  }, [merchantId, rPage]);

  useEffect(() => {
    const token = adminAuth.get();
    api.adminGetMerchantLedger(token, merchantId, { limit: LIMIT, offset: lPage * LIMIT })
      .then((r) => { setLedger(r.ledger); setLTotal(r.total); setBalance(r.balance); setCurrency(r.currency); })
      .catch(() => setLedger([]));
  }, [merchantId, lPage]);

  return (
    <section className="mt-6 space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-slate-900">Wallet</h2>
          {balance != null && (
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current balance</div>
              <div className="text-2xl font-bold text-slate-900">{currency} {Number(balance).toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900">Recharge history</h3>
        <p className="text-xs text-slate-500 mt-0.5">Wallet top-ups by this merchant, newest first.</p>
        {!recharges ? (
          <div className="mt-4 text-slate-500 text-sm">Loading…</div>
        ) : recharges.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No recharges yet.</div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-left text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2">When</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Method</th>
                    <th className="py-2 px-2">TxnID</th>
                    <th className="py-2 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recharges.map((r) => (
                    <tr key={r.session_id}>
                      <td className="py-2 px-2 text-slate-600">{new Date(r.created_at).toLocaleString(undefined, { timeZone: 'Asia/Dhaka' })}</td>
                      <td className="py-2 px-2 font-semibold">{r.currency} {Number(r.amount).toFixed(2)}</td>
                      <td className="py-2 px-2 text-slate-700">{r.provider ? `${r.provider}${r.variant ? ' · ' + r.variant : ''}` : <span className="text-slate-400">—</span>}</td>
                      <td className="py-2 px-2 font-mono text-xs text-slate-700">{r.txnid_submitted || <span className="text-slate-400">—</span>}</td>
                      <td className="py-2 px-2 text-right">
                        <SmallStatusPill tx={r.tx_status} session={r.session_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={rPage} total={rTotal} limit={LIMIT} onChange={setRPage} />
          </>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900">Ledger</h3>
        <p className="text-xs text-slate-500 mt-0.5">Every credit and debit on this merchant's wallet.</p>
        {!ledger ? (
          <div className="mt-4 text-slate-500 text-sm">Loading…</div>
        ) : ledger.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">No ledger entries yet.</div>
        ) : (
          <>
            <div className="mt-4 divide-y divide-slate-100">
              {ledger.map((row) => {
                const credit = Number(row.amount) >= 0;
                return (
                  <div key={row.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{prettyKind(row.kind)}</div>
                      <div className="text-xs text-slate-500">{new Date(row.created_at).toLocaleString(undefined, { timeZone: 'Asia/Dhaka' })}{row.note ? ` · ${row.note}` : ''}</div>
                    </div>
                    <div className={`font-semibold tabular-nums ${credit ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {credit ? '+' : ''}{currency} {Math.abs(Number(row.amount)).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <Pager page={lPage} total={lTotal} limit={LIMIT} onChange={setLPage} />
          </>
        )}
      </div>
    </section>
  );
}

function Pager({ page, total, limit, onChange }) {
  if (total <= limit) return null;
  const last = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="mt-4 flex items-center justify-between text-xs">
      <div className="text-slate-500">
        Showing <strong>{page * limit + 1}</strong>–<strong>{Math.min(total, (page + 1) * limit)}</strong> of <strong>{total}</strong>
      </div>
      <div className="inline-flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onChange(Math.max(0, page - 1))}
          className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">← Prev</button>
        <span className="px-2 text-slate-600">{page + 1} / {last}</span>
        <button disabled={(page + 1) * limit >= total} onClick={() => onChange(page + 1)}
          className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50">Next →</button>
      </div>
    </div>
  );
}

function SmallStatusPill({ tx, session }) {
  if (tx === 'success' || session === 'success')
    return <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">Credited</span>;
  if (tx === 'failed')
    return <span className="inline-flex rounded-full bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-[10px] font-semibold">Rejected</span>;
  if (session === 'expired')
    return <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">Expired</span>;
  if (session === 'cancelled')
    return <span className="inline-flex rounded-full bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-semibold">Cancelled</span>;
  return <span className="inline-flex rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">Pending</span>;
}

function prettyKind(k) {
  switch (k) {
    case 'topup':        return 'Wallet topup';
    case 'debit_verify': return 'Verification charge';
    case 'refund':       return 'Refund';
    case 'adjustment':   return 'Adjustment';
    default:             return k;
  }
}

/* ─── Reset password button + modal ─── */
function PasswordResetButton({ merchantId, merchantName }) {
  const [open, setOpen]           = useState(false);
  const [mode, setMode]           = useState('generate'); // 'generate' | 'custom'
  const [custom, setCustom]       = useState('');
  const [reveal, setReveal]       = useState(false);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState(null);
  const [issued, setIssued]       = useState(null); // { password, generated }
  const [copied, setCopied]       = useState(false);

  const close = () => {
    setOpen(false);
    setMode('generate'); setCustom(''); setReveal(false);
    setError(null); setIssued(null); setCopied(false);
  };

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const token = adminAuth.get();
      const body = mode === 'custom' ? { new_password: custom } : {};
      const r = await api.adminResetMerchantPassword(token, merchantId, body);
      setIssued({ password: r.password, generated: r.generated });
    } catch (e) {
      setError(e.message || 'Failed to reset password');
    } finally { setBusy(false); }
  };

  const doCopy = async () => {
    try { await navigator.clipboard.writeText(issued.password); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary !py-1.5 text-sm !text-amber-700 hover:!bg-amber-50 hover:!border-amber-300">
        Reset password
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900">Reset password</h2>
            <p className="mt-1 text-sm text-slate-600">
              For <span className="font-semibold">{merchantName}</span>. We can&apos;t show the existing password — it&apos;s stored as a hash. You can set a new one or have one generated.
            </p>

            {!issued ? (
              <>
                <div className="mt-5 inline-flex bg-slate-100 rounded-lg p-1">
                  {[['generate','Generate random'],['custom','Set custom']].map(([k, label]) => (
                    <button key={k} onClick={() => setMode(k)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${mode === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {mode === 'custom' && (
                  <div className="mt-4">
                    <label className="label">New password</label>
                    <div className="relative">
                      <input
                        type={reveal ? 'text' : 'password'}
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        placeholder="At least 6 characters"
                        className="input pr-20"
                        minLength={6}
                      />
                      <button type="button" onClick={() => setReveal((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 px-2">
                        {reveal ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {error && <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}

                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={close} disabled={busy} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">Cancel</button>
                  <button onClick={submit} disabled={busy || (mode === 'custom' && custom.length < 6)} className="btn-primary !py-2">
                    {busy ? 'Resetting…' : 'Reset password'}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-semibold">Copy this now — it won&apos;t be shown again.</div>
                  <div className="mt-0.5 text-amber-800">Share it securely with the merchant. They can change it after logging in.</div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <code className="flex-1 font-mono text-base bg-slate-50 border border-slate-200 rounded px-3 py-2 select-all">
                    {reveal ? issued.password : '•'.repeat(issued.password.length)}
                  </code>
                  <button onClick={() => setReveal((s) => !s)} className="btn-secondary !py-2 !px-3 text-xs">
                    {reveal ? 'Hide' : 'View'}
                  </button>
                  <button onClick={doCopy} className={`btn-secondary !py-2 !px-3 text-xs ${copied ? '!text-emerald-700 !border-emerald-300' : ''}`}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <div className="mt-5 flex justify-between gap-2">
                  <button onClick={() => { setIssued(null); setReveal(false); }} className="text-sm text-amber-700 hover:text-amber-900 px-3 py-2">
                    Reset again
                  </button>
                  <button onClick={close} className="btn-primary !py-2">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
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
