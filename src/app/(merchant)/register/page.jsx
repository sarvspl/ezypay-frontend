'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { COUNTRIES } from '@/lib/countries';
import { slugifyUsername, USERNAME_RE } from '@/lib/slug';
import Combobox from '@/components/Combobox';
import Logo, { LogoMark } from '@/components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    username: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    domain: '',
    industry: '',
    country: '',
    state: '',
  });
  const [userEditedUsername, setUserEditedUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' });
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep username in sync with name until the user edits it manually.
  useEffect(() => {
    if (!userEditedUsername) {
      const auto = slugifyUsername(form.name);
      setForm((f) => (f.username === auto ? f : { ...f, username: auto }));
    }
  }, [form.name, userEditedUsername]);

  // Debounced uniqueness check whenever username changes.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const u = form.username.trim();
    if (!u) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }
    if (!USERNAME_RE.test(u)) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Use 3–40 lowercase letters, numbers, or underscores.',
      });
      return;
    }
    setUsernameStatus({ state: 'checking', message: 'Checking availability…' });
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await api.merchantCheckUsername(u);
        if (r.available) {
          setUsernameStatus({ state: 'available', message: 'Available' });
        } else if (r.reason === 'invalid_format') {
          setUsernameStatus({ state: 'invalid', message: 'Invalid format' });
        } else {
          setUsernameStatus({ state: 'taken', message: 'This username is already taken' });
        }
      } catch (e) {
        setUsernameStatus({ state: 'idle', message: '' });
      }
    }, 400);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [form.username]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUserEditedUsername(true);
      setForm({ ...form, username: value.toLowerCase().replace(/\s+/g, '_') });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const passwordsMatch =
    form.password.length > 0 && form.password === form.confirmPassword;
  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const canSubmit =
    !loading &&
    form.name.trim() &&
    USERNAME_RE.test(form.username) &&
    usernameStatus.state === 'available' &&
    form.mobile.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    passwordsMatch &&
    form.domain.trim() &&
    form.industry.trim() &&
    form.country.trim() &&
    form.state.trim();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await api.merchantRegister(payload);
      merchantAuth.set(res.token);
      router.push('/dashboard');
    } catch (err) {
      if (err.data && err.data.field === 'username') {
        setUsernameStatus({ state: 'taken', message: err.message });
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <Link href="/login" className="text-sm text-slate-600 hover:text-brand-600">
            Have an account? Sign in
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create your merchant account</h1>
            <p className="text-sm text-slate-600 mt-1">
              You&apos;ll receive your API Key and Device Auth Key on the next screen.
            </p>
          </div>
          <div className="hidden sm:flex shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 items-center justify-center text-brand-600 shadow-sm">
            <LogoMark className="w-10 h-10" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="card p-6 mt-6 grid md:grid-cols-2 gap-4">
          {/* Name + Username */}
          <div className="md:col-span-2">
            <label className="label">Name / Business Name</label>
            <input
              name="name" required value={form.name} onChange={onChange}
              className="input" placeholder="Acme Traders"
            />
            <div className="mt-3">
              <label className="label flex items-center justify-between">
                <span>Username <span className="text-slate-400 font-normal">(auto-generated, editable)</span></span>
                <UsernameBadge status={usernameStatus} />
              </label>
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                className={`input font-mono ${usernameBorderClass(usernameStatus)}`}
                placeholder="acme_traders"
                autoComplete="off"
                spellCheck={false}
              />
              {usernameStatus.message && (
                <p className={`mt-1.5 text-xs ${usernameTextClass(usernameStatus)}`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Mobile + Email */}
          <div>
            <label className="label">Mobile</label>
            <input name="mobile" required value={form.mobile} onChange={onChange} className="input" placeholder="+1 555 555 5555" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" required value={form.email} onChange={onChange} className="input" placeholder="you@business.com" />
          </div>

          {/* Password + Confirm */}
          <div>
            <label className="label">Password</label>
            <input
              name="password" type="password" required minLength={6}
              value={form.password} onChange={onChange} className="input"
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              name="confirmPassword" type="password" required minLength={6}
              value={form.confirmPassword} onChange={onChange}
              className={`input ${
                passwordMismatch ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                : passwordsMatch  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                : ''
              }`}
              placeholder="Re-enter password"
            />
            {passwordMismatch && (
              <p className="mt-1.5 text-xs text-rose-600">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="mt-1.5 text-xs text-emerald-600">Passwords match</p>
            )}
          </div>

          {/* Domain + Industry */}
          <div className="md:col-span-2">
            <label className="label">Domain</label>
            <input name="domain" required value={form.domain} onChange={onChange} className="input" placeholder="yourstore.com" />
          </div>
          <div>
            <label className="label">Industry</label>
            <input
              name="industry" required value={form.industry} onChange={onChange}
              className="input" placeholder="e.g. Fashion, Electronics, SaaS, Food delivery"
            />
          </div>

          {/* Country + State */}
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
            <input name="state" required value={form.state} onChange={onChange} className="input" placeholder="California" />
          </div>

          {error && (
            <div className="md:col-span-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">By registering you agree to the terms of service.</p>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {loading ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function UsernameBadge({ status }) {
  if (status.state === 'available') {
    return <span className="text-xs text-emerald-600 font-semibold">✓ Available</span>;
  }
  if (status.state === 'taken' || status.state === 'invalid') {
    return <span className="text-xs text-rose-600 font-semibold">✗ Unavailable</span>;
  }
  if (status.state === 'checking') {
    return <span className="text-xs text-slate-500">Checking…</span>;
  }
  return null;
}

function usernameBorderClass(status) {
  if (status.state === 'taken' || status.state === 'invalid') {
    return 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30';
  }
  if (status.state === 'available') {
    return 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/30';
  }
  return '';
}

function usernameTextClass(status) {
  if (status.state === 'taken' || status.state === 'invalid') return 'text-rose-600';
  if (status.state === 'available') return 'text-emerald-600';
  return 'text-slate-500';
}
