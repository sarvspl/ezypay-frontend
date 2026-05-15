'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suspendedNotice, setSuspendedNotice] = useState(null);
  const [support, setSupport] = useState(null);

  useEffect(() => {
    const s = searchParams.get('suspended');
    if (s) setSuspendedNotice(s === '1' ? 'Your account has been suspended. Contact support.' : s);
  }, [searchParams]);

  // Only fetch support details when the suspended banner is showing — no point
  // hitting the API on every login impression.
  useEffect(() => {
    if (!suspendedNotice) return;
    api.getSupport()
      .then((r) => setSupport(r?.support || null))
      .catch(() => setSupport(null));
  }, [suspendedNotice]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuspendedNotice(null);
    setLoading(true);
    try {
      const res = await api.merchantLogin({
        username: form.identifier,
        password: form.password,
      });
      merchantAuth.set(res.token);
      router.push('/dashboard');
    } catch (err) {
      // A 403 with suspended:true should show the support panel, not the plain
      // error banner. Everything else is a regular auth error.
      if (err?.status === 403 && err?.data?.suspended) {
        setSuspendedNotice(err.message || 'Your account is suspended. Contact support.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
      <Logo size="lg" href="/" />

      <h1 className="mt-6 text-slate-600">Sign in to your account</h1>

      <div className="mt-6 w-full max-w-md card p-6 sm:p-8 shadow-md">
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Username or Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <UserIcon />
              </span>
              <input
                name="identifier"
                required
                value={form.identifier}
                onChange={onChange}
                className="input pl-10"
                placeholder="you@example.com or username"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <LockIcon />
              </span>
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                required
                value={form.password}
                onChange={onChange}
                className="input pl-10 pr-10"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {suspendedNotice && !error && (
            <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded p-4">
              <div className="font-semibold text-amber-900">Account suspended</div>
              <div className="mt-1">{suspendedNotice}</div>
              {support && (support.message || support.email || support.phone || support.whatsapp) && (
                <div className="mt-3 pt-3 border-t border-amber-200/70">
                  {support.message && <div className="text-amber-800 mb-2">{support.message}</div>}
                  <ul className="space-y-1.5 text-amber-900">
                    {support.email && (
                      <li className="flex items-start gap-2">
                        <MailIcon /> <a href={`mailto:${support.email}`} className="font-medium hover:underline">{support.email}</a>
                      </li>
                    )}
                    {support.phone && (
                      <li className="flex items-start gap-2">
                        <PhoneIcon /> <a href={`tel:${support.phone.replace(/\s+/g, '')}`} className="font-medium hover:underline">{support.phone}</a>
                      </li>
                    )}
                    {support.whatsapp && (
                      <li className="flex items-start gap-2">
                        <ChatIcon /> <a href={`https://wa.me/${support.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">WhatsApp: {support.whatsapp}</a>
                      </li>
                    )}
                    {support.hours && (
                      <li className="flex items-start gap-2">
                        <ClockIcon /> <span>{support.hours}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 text-base font-semibold shadow-sm shadow-brand-500/20"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-600 font-semibold hover:underline">
          Register Now
        </Link>
      </p>
    </main>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
