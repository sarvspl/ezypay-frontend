'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { useMerchant } from '../layout';

const PLAN = { name: 'Starter', expiresAt: '2026-12-31' };

export default function ProfilePage() {
  const router = useRouter();
  const { merchant } = useMerchant();

  if (!merchant) {
    return <div className="px-6 py-10 text-slate-500">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <ProfileSummaryCard merchant={merchant} />
        <div className="lg:col-span-2 space-y-6">
          <PersonalInfoCard merchant={merchant} />
          <SecurityCard router={router} />
        </div>
      </div>
    </div>
  );
}

/* ─── Left summary card ─── */
function ProfileSummaryCard({ merchant }) {
  const initial = (merchant.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="card p-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-white text-3xl font-bold flex items-center justify-center shadow">
        {initial}
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">{merchant.name}</h2>
      <p className="text-sm text-slate-500 mt-1 break-words">{merchant.email}</p>

      <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50/70 px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-brand-700">
          <ShieldIcon /> <span className="font-semibold text-sm">{PLAN.name}</span>
        </div>
        <div className="text-xs text-brand-700/70 mt-1">Expires {formatDate(PLAN.expiresAt)}</div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200 space-y-2.5 text-sm text-left">
        <div className="flex items-center gap-2 text-slate-600 min-w-0">
          <MailIcon className="text-slate-400 shrink-0" />
          <span className="truncate">{merchant.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <PhoneIcon className="text-slate-400 shrink-0" />
          <span>{merchant.mobile}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <GlobeIcon className="text-slate-400 shrink-0" />
          <span className="truncate">{merchant.domain}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <CoinIcon className="text-slate-400 shrink-0" />
          <span>{merchant.currency} <span className="text-slate-400">· {merchant.country}</span></span>
        </div>
      </div>
    </div>
  );
}

/* ─── Personal info form ─── */
function PersonalInfoCard({ merchant }) {
  const [form, setForm] = useState({ name: merchant.name, mobile: merchant.mobile });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const dirty = form.name !== merchant.name || form.mobile !== merchant.mobile;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const token = merchantAuth.get();
      await api.merchantUpdateMe(token, form);
      setMsg({ tone: 'ok', text: 'Profile updated. Refresh to see changes everywhere.' });
    } catch (err) {
      setMsg({ tone: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <header className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <UserIcon />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Personal Information</h3>
          <p className="text-sm text-slate-500">Update your name and contact details</p>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Name / Business Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" required minLength={2}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Email Address</label>
          <input value={merchant.email} readOnly disabled className="input bg-slate-50/70 text-slate-500" />
          <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Phone Number</label>
          <input
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="input" required
          />
        </div>
      </div>

      {msg && (
        <div className={`mt-4 text-sm rounded-md p-3 border ${
          msg.tone === 'ok'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={!dirty || loading} className="btn-primary">
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

/* ─── Security / password change ─── */
function SecurityCard({ router }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const passwordsMatch = form.next.length > 0 && form.next === form.confirm;
  const passwordsMismatch = form.confirm.length > 0 && form.next !== form.confirm;
  const canSubmit = form.current && form.next.length >= 6 && passwordsMatch && !loading;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const token = merchantAuth.get();
      await api.merchantChangePassword(token, {
        current_password: form.current,
        new_password:     form.next,
      });
      setMsg({ tone: 'ok', text: 'Password updated successfully.' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setMsg({ tone: 'err', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <header className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <LockIcon />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Security</h3>
          <p className="text-sm text-slate-500">Change your password to keep your account secure</p>
        </div>
      </header>

      <div className="space-y-4">
        <PasswordField
          label="Current Password"
          value={form.current}
          onChange={(v) => setForm({ ...form, current: v })}
          show={show.current}
          onToggleShow={() => setShow({ ...show, current: !show.current })}
          placeholder="Enter current password"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <PasswordField
            label="New Password"
            value={form.next}
            onChange={(v) => setForm({ ...form, next: v })}
            show={show.next}
            onToggleShow={() => setShow({ ...show, next: !show.next })}
            placeholder="Min 6 characters"
            hint={form.next.length > 0 && form.next.length < 6 ? 'Too short' : null}
          />
          <PasswordField
            label="Confirm New Password"
            value={form.confirm}
            onChange={(v) => setForm({ ...form, confirm: v })}
            show={show.confirm}
            onToggleShow={() => setShow({ ...show, confirm: !show.confirm })}
            placeholder="Re-enter new password"
            tone={passwordsMatch ? 'ok' : passwordsMismatch ? 'err' : null}
            hint={passwordsMismatch ? 'Passwords do not match' : passwordsMatch ? 'Passwords match' : null}
          />
        </div>

        <p className="text-xs text-slate-400">Leave blank to keep your current password.</p>
      </div>

      {msg && (
        <div className={`mt-4 text-sm rounded-md p-3 border ${
          msg.tone === 'ok'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

function PasswordField({ label, value, onChange, show, onToggleShow, placeholder, hint, tone }) {
  const borderClass =
    tone === 'ok'  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/30' :
    tone === 'err' ? 'border-rose-400    focus:border-rose-500    focus:ring-rose-500/30'    :
    '';
  const hintColor =
    tone === 'ok'  ? 'text-emerald-600' :
    tone === 'err' ? 'text-rose-600'    :
    'text-slate-500';

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input pr-10 ${borderClass}`}
          placeholder={placeholder}
          autoComplete={label.toLowerCase().includes('current') ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && <p className={`text-xs mt-1.5 ${hintColor}`}>{hint}</p>}
    </div>
  );
}

/* ─── helpers ─── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── icons ─── */
function I(props) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function UserIcon()   { return <I><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></I>; }
function LockIcon()   { return <I><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></I>; }
function MailIcon({ className = '' }) { return <I className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></I>; }
function PhoneIcon({ className = '' }) { return <I className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></I>; }
function GlobeIcon({ className = '' }) { return <I className={className}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z"/></I>; }
function CoinIcon({ className = '' })  { return <I className={className}><circle cx="12" cy="12" r="10"/><path d="M16 8H10.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H8"/><line x1="12" y1="6" x2="12" y2="18"/></I>; }
function ShieldIcon() { return <I width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>; }
function EyeIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
