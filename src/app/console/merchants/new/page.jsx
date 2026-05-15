'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { COUNTRIES } from '@/lib/countries';
import Combobox from '@/components/Combobox';
import ConsoleShell from '@/components/console/ConsoleShell';
import { useGuard } from '@/lib/guard';

export default function ConsoleCreateMerchantPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [form, setForm] = useState({
    name: '', password: '', mobile: '', email: '', domain: '',
    industry: '', country: '', state: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const token = adminAuth.get();
    if (!token) { router.replace('/console/login'); return; }
    try {
      const res = await api.adminCreateMerchant(token, form);
      setCreated(res.merchant);
    } catch (err) {
      if (err.status === 401) {
        adminAuth.clear();
        router.replace('/console/login');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <ConsoleShell
      action={
        <Link href="/console/merchants" className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100">
          ← Back to list
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Create merchant</h1>
        <p className="text-sm text-slate-600 mt-1">Manually onboard a merchant. Their keys will be shown once after creation — copy and share them.</p>

        {created ? (
          <div className="card p-6 mt-6 space-y-4">
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">
              Merchant <strong>{created.name}</strong> created successfully. Save these credentials now — they won&apos;t be shown again in full.
            </div>
            <Field label="Username"       value={created.username} />
            <Field label="API Key"        value={created.api_key} mono />
            <Field label="Device Auth Key" value={created.device_auth_key} mono />
            <div className="flex gap-3 pt-2">
              <Link href="/console/merchants" className="btn-primary">Done</Link>
              <button onClick={() => { setCreated(null); setForm({ name:'',password:'',mobile:'',email:'',domain:'',industry:'',country:'',state:'' }); }} className="btn-secondary">
                Create another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card p-6 mt-6 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Name / Business Name</label>
              <input name="name" required value={form.name} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Mobile</label>
              <input name="mobile" required value={form.mobile} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required value={form.email} onChange={onChange} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Password</label>
              <input name="password" type="password" required minLength={6} value={form.password} onChange={onChange} className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Domain</label>
              <input name="domain" required value={form.domain} onChange={onChange} className="input" />
            </div>
            <div>
              <label className="label">Industry</label>
              <input
                name="industry" required value={form.industry} onChange={onChange}
                className="input" placeholder="e.g. Fashion, Electronics, SaaS"
              />
            </div>
            <div>
              <label className="label">Country</label>
              <Combobox
                value={form.country}
                onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                options={COUNTRIES}
                placeholder="Type or select country"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">State / Region</label>
              <input name="state" required value={form.state} onChange={onChange} className="input" />
            </div>

            {error && (
              <div className="md:col-span-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
            )}

            <div className="md:col-span-2 flex justify-end pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Creating…' : 'Create merchant'}
              </button>
            </div>
          </form>
        )}
      </div>
    </ConsoleShell>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-slate-900 ${mono ? 'font-mono text-sm bg-slate-50 border border-slate-200 rounded px-3 py-2' : ''}`}>{value}</div>
    </div>
  );
}
