'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import { LogoMark } from '@/components/Logo';

const FIELDS = [
  { name: 'email',    label: 'Support Email',    placeholder: 'support@yourcompany.com', type: 'email' },
  { name: 'phone',    label: 'Phone',            placeholder: '+91 98765 43210',         type: 'text' },
  { name: 'whatsapp', label: 'WhatsApp',         placeholder: '+91 98765 43210',         type: 'text' },
  { name: 'hours',    label: 'Support Hours',    placeholder: 'Mon–Fri 9am–6pm IST',     type: 'text' },
];

export default function ConsoleSupportPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [form, setForm]       = useState({ email: '', phone: '', whatsapp: '', hours: '', message: '' });
  const [loaded, setLoaded]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError]     = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!ready) return;
    const token = adminAuth.get();
    api.adminGetSupport(token)
      .then((r) => {
        const s = r.support || {};
        setForm({
          email:    s.email    || '',
          phone:    s.phone    || '',
          whatsapp: s.whatsapp || '',
          hours:    s.hours    || '',
          message:  s.message  || '',
        });
        setUpdatedAt(s.updated_at || null);
      })
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else setError(e.message);
      })
      .finally(() => setLoaded(true));
  }, [ready, router]);

  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      const token = adminAuth.get();
      const r = await api.adminUpdateSupport(token, form);
      setUpdatedAt(r.support.updated_at);
      setSavedAt(new Date());
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
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
            <Link href="/console/support" className="text-brand-600 font-semibold text-sm">Support</Link>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Support Contact</h1>
        <p className="text-sm text-slate-600 mt-1">
          These details appear on the merchant login page whenever a suspended merchant attempts to sign in. Leave a field blank to hide it.
        </p>

        {!loaded && <div className="mt-6 text-slate-500">Loading…</div>}

        {loaded && (
          <form onSubmit={onSave} className="card mt-6 p-6 space-y-5">
            {FIELDS.map((f) => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={onChange}
                  placeholder={f.placeholder}
                  className="input"
                  disabled={saving}
                />
              </div>
            ))}

            <div>
              <label className="label">Intro Message <span className="text-slate-400 font-normal">(shown above the contact list)</span></label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={2}
                placeholder="Need help with your account? Reach out to our support team."
                className="input"
                disabled={saving}
              />
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">
                {error}
              </div>
            )}
            {savedAt && !error && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">
                Saved.
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString()}` : 'Not yet saved'}
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-xs text-slate-500">
          Preview the merchant-facing view at <Link href="/login?suspended=Preview+mode" className="text-brand-600 hover:underline">/login?suspended=...</Link>
        </div>
      </div>
    </>
  );
}
