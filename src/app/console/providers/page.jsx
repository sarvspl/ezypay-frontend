'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import { LogoMark } from '@/components/Logo';
import { COLOR_TO_BG } from '@/lib/providers';

const PALETTE = ['pink', 'orange', 'purple', 'emerald', 'blue', 'indigo', 'red', 'amber', 'teal', 'rose', 'slate'];

export default function ConsoleProvidersPage() {
  const router = useRouter();
  const ready = useGuard('admin');
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setError(null);
    const token = adminAuth.get();
    try {
      const r = await api.adminListProviders(token);
      setProviders(r.providers);
    } catch (e) {
      if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
      else setError(e.message);
    }
  };
  useEffect(() => { if (ready) load(); }, [ready]); // eslint-disable-line

  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

  if (!ready) return null;

  const onDelete = async (p) => {
    if (p.gateway_count > 0) {
      alert(`Cannot delete: ${p.gateway_count} merchant gateway(s) reference this provider. Disable it instead.`);
      return;
    }
    if (!confirm(`Delete provider "${p.name}"? This cannot be undone.`)) return;
    const token = adminAuth.get();
    try {
      await api.adminDeleteProvider(token, p.id);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <Link href="/console/merchants" className="flex items-center gap-2">
            <span className="text-brand-600"><LogoMark className="w-7 h-7" /></span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Pay<span className="text-brand-600">Verify</span>
            </span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Console</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/console/merchants" className="text-slate-600 hover:text-slate-900">Merchants</Link>
            <Link href="/console/providers" className="text-brand-600 font-semibold">Providers</Link>
            <button onClick={logout} className="btn-secondary !py-1.5 ml-2">Logout</button>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Provider catalog</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              The list of wallet/bank providers merchants can pick from when adding a gateway.
              Add a new provider here to make it available platform-wide.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <PlusIcon /> <span className="ml-2">Add Provider</span>
          </button>
        </div>

        {error && <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>}

        {!providers && !error && (
          <div className="card p-10 text-center text-slate-500">Loading providers…</div>
        )}

        {providers && providers.length === 0 && (
          <div className="card p-10 text-center text-slate-500">No providers yet. Add one to get started.</div>
        )}

        {providers && providers.length > 0 && (
          <div className="grid gap-3">
            {providers.map((p) => (
              <ProviderRow
                key={p.id}
                p={p}
                onEdit={() => setEditing(p)}
                onDelete={() => onDelete(p)}
              />
            ))}
          </div>
        )}

        {(showAdd || editing) && (
          <ProviderModal
            initial={editing}
            onClose={() => { setShowAdd(false); setEditing(null); }}
            onSaved={() => { setShowAdd(false); setEditing(null); load(); }}
          />
        )}
      </div>
    </>
  );
}

/* ─── Provider row ─── */
function ProviderRow({ p, onEdit, onDelete }) {
  const bg = COLOR_TO_BG[p.color] || 'bg-slate-500';
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`w-12 h-12 rounded-lg ${bg} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
          {p.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{p.name}</span>
            <code className="text-xs text-slate-500">{p.id}</code>
            {!p.is_enabled && <span className="text-[10px] font-semibold uppercase tracking-wider rounded bg-rose-100 text-rose-700 px-1.5 py-0.5">Disabled</span>}
            {p.gateway_count > 0 && (
              <span className="text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600 px-1.5 py-0.5">
                used by {p.gateway_count}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-1.5">
            {(p.variants || []).map((v) => (
              <span key={v} className="bg-slate-100 text-slate-700 rounded px-1.5 py-0.5">{v}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-slate-500 hover:text-slate-900 p-2 rounded hover:bg-slate-50" title="Edit">
            <EditIcon />
          </button>
          <button onClick={onDelete} className="text-slate-500 hover:text-rose-600 p-2 rounded hover:bg-rose-50" title="Delete">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add / Edit Modal ─── */
function ProviderModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    id:       initial?.id || '',
    name:     initial?.name || '',
    initials: initial?.initials || '',
    color:    initial?.color || 'slate',
    variantsText: (initial?.variants || []).join(', '),
    is_enabled: initial ? !!initial.is_enabled : true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const token = adminAuth.get();
    const variants = form.variantsText
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    const body = {
      name: form.name.trim(),
      initials: form.initials.trim(),
      color: form.color,
      variants,
      is_enabled: form.is_enabled,
    };
    try {
      if (isEdit) {
        await api.adminUpdateProvider(token, initial.id, body);
      } else {
        await api.adminCreateProvider(token, { ...body, id: form.id.trim().toLowerCase() });
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">{isEdit ? `Edit ${initial.name}` : 'Add Provider'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label className="label">Slug / ID</label>
              <input required value={form.id} onChange={(e) => setForm({...form, id: e.target.value})}
                     className="input font-mono" placeholder="e.g. upay" />
              <p className="text-xs text-slate-500 mt-1">Lowercase letters/digits/underscores. Used in API + DB. Cannot be changed later.</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Display Name</label>
              <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                     className="input" placeholder="e.g. Upay" />
            </div>
            <div>
              <label className="label">Initials</label>
              <input required maxLength={4} value={form.initials} onChange={(e) => setForm({...form, initials: e.target.value})}
                     className="input" placeholder="e.g. Up" />
              <p className="text-xs text-slate-500 mt-1">2 characters work best on the badge.</p>
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({...form, color: c})}
                  className={`w-9 h-9 rounded-lg ${COLOR_TO_BG[c]} flex items-center justify-center text-white text-xs font-bold transition ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-slate-900' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c}
                >
                  {form.color === c && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Variants</label>
            <input required value={form.variantsText} onChange={(e) => setForm({...form, variantsText: e.target.value})}
                   className="input font-mono" placeholder="personal, agent" />
            <p className="text-xs text-slate-500 mt-1">Comma-separated slugs. Examples: <code>personal, agent</code> · <code>standard</code> · <code>retail, wholesale</code></p>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({...form, is_enabled: e.target.checked})} />
              <span className="text-sm text-slate-700">Enabled (visible to merchants)</span>
            </label>
          )}

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create provider')}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── icons ─── */
function I(props) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function PlusIcon()  { return <I><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>; }
function CloseIcon() { return <I><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
function EditIcon()  { return <I><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></I>; }
function TrashIcon() { return <I><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></I>; }
