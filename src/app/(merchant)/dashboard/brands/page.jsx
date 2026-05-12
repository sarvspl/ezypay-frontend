'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState(null);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantListBrands(token);
      setBrands(r.brands);
    } catch (e) {
      if (e.status === 401) {
        merchantAuth.clear();
        router.replace('/login');
      } else {
        setError(e.message);
      }
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDelete = async (brand) => {
    if (!confirm(`Delete brand "${brand.name}" (${brand.domain})? Its API key will stop working immediately.`)) return;
    const token = merchantAuth.get();
    try {
      await api.merchantDeleteBrand(token, brand.id);
      setBrands((b) => b.filter((x) => x.id !== brand.id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your brands</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Each brand is a separate website / domain with its own API key. Use one brand per site
            so you can track verifications, rotate keys, and revoke access independently.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <PlusIcon /> <span className="ml-2">Add brand</span>
        </button>
      </div>

      {showAdd && (
        <AddBrandForm
          onCancel={() => setShowAdd(false)}
          onCreated={(brand) => {
            setBrands((b) => [...(b || []), brand]);
            setShowAdd(false);
          }}
        />
      )}

      {error && (
        <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>
      )}

      {!brands && !error && (
        <div className="card p-10 text-center text-slate-500">Loading brands…</div>
      )}

      {brands && brands.length === 0 && (
        <div className="card p-10 text-center text-slate-500">
          You haven&apos;t added any brand yet.
        </div>
      )}

      {brands && brands.length > 0 && (
        <div className="grid gap-4">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} onDelete={() => onDelete(b)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Add Brand inline form ─── */
function AddBrandForm({ onCancel, onCreated }) {
  const [form, setForm] = useState({ name: '', domain: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantCreateBrand(token, form);
      onCreated(r.brand);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6 space-y-4 border-brand-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Add a new brand</h3>
          <p className="text-xs text-slate-500 mt-0.5">A fresh API Key + Secret Key will be generated for it.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-700" aria-label="Cancel">
          <CloseIcon />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Brand name</label>
          <input
            required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" placeholder="Fashion Store"
          />
        </div>
        <div>
          <label className="label">Domain</label>
          <input
            required value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            className="input" placeholder="fashionhub.com"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating…' : 'Create brand'}
        </button>
      </div>
    </form>
  );
}

/* ─── Brand card ─── */
function BrandCard({ brand, onDelete }) {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-slate-900">{brand.name}</h3>
            {brand.is_default && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[11px] font-semibold">
                <StarIcon /> Default
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <GlobeIcon /> {brand.domain}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!brand.is_default && (
            <button onClick={onDelete} className="btn-secondary !text-rose-600 hover:!bg-rose-50 hover:!border-rose-300">
              <TrashIcon /> <span className="ml-1.5">Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <SecretField label="API Key" value={brand.api_key} />
        <SecretField label="Secret Key" value={brand.secret_key} muted />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Created {new Date(brand.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span className="font-mono">id: {brand.id.slice(0, 8)}…</span>
      </div>
    </div>
  );
}

function SecretField({ label, value, muted }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const display = show ? value : '•'.repeat(Math.max(8, value.length - 4)) + value.slice(-4);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <button type="button" onClick={() => setShow((s) => !s)} className="text-xs text-slate-500 hover:text-brand-600">
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={display}
          className={`input font-mono text-sm ${muted ? 'bg-slate-50/70' : 'bg-slate-50/70'}`}
        />
        <button type="button" onClick={onCopy} className={`btn-secondary whitespace-nowrap ${copied ? '!text-emerald-600 !border-emerald-300' : ''}`}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

/* ─── Icons ─── */
function I(props) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function PlusIcon()  { return <I><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>; }
function TrashIcon() { return <I><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></I>; }
function CloseIcon() { return <I><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
function StarIcon()  { return <I><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></I>; }
function GlobeIcon() { return <I><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z"/></I>; }
