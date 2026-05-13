'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { PROVIDERS, PROVIDER_CATEGORIES, getProvider, labelVariant } from '@/lib/providers';

export default function GatewaysPage() {
  const router = useRouter();
  const [gateways, setGateways] = useState(null);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(null);          // { provider, variant }
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setError(null);
    const token = merchantAuth.get();
    try {
      const r = await api.merchantListGateways(token);
      setGateways(r.gateways);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const onPick = (provider, variant) => {
    setShowAdd(false);
    setAdding({ provider, variant });
  };

  const onCreate = async (form) => {
    const token = merchantAuth.get();
    const body = { provider: adding.provider, variant: adding.variant, ...form };
    const r = await api.merchantCreateGateway(token, body);
    setGateways((gs) => [...(gs || []), r.gateway]);
    setAdding(null);
    setExpandedId(r.gateway.id);
    if (r.retroactively_matched > 0) {
      // Small celebratory message — your SMS that were sitting unmatched got linked up.
      alert(`Gateway created. ${r.retroactively_matched} recent SMS auto-matched to this gateway and are now in Transactions.`);
    }
  };

  const onUpdate = async (id, form) => {
    const token = merchantAuth.get();
    const r = await api.merchantUpdateGateway(token, id, form);
    setGateways((gs) => gs.map((g) => (g.id === id ? r.gateway : g)));
    setExpandedId(null);
  };

  const onToggle = async (g) => {
    const token = merchantAuth.get();
    try {
      const r = await api.merchantToggleGateway(token, g.id);
      setGateways((gs) => gs.map((x) => (x.id === g.id ? { ...x, is_enabled: r.is_enabled } : x)));
    } catch (e) { alert(e.message); }
  };

  const onDelete = async (g) => {
    if (!confirm(`Delete ${getProvider(g.provider).name} ${labelVariant(g.variant)} (${g.account_number})?`)) return;
    const token = merchantAuth.get();
    try {
      await api.merchantDeleteGateway(token, g.id);
      setGateways((gs) => gs.filter((x) => x.id !== g.id));
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment gateways</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Wallet accounts where your customers send payments. Each gateway is matched against
            incoming SMS to verify the transaction.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <PlusIcon /> <span className="ml-2">Add Gateway</span>
        </button>
      </div>

      {error && (
        <div className="card p-4 text-sm text-rose-600 bg-rose-50 border-rose-200">{error}</div>
      )}

      {adding && (
        <GatewayCard
          isNew
          provider={adding.provider}
          variant={adding.variant}
          onSave={onCreate}
          onCancel={() => setAdding(null)}
        />
      )}

      {!gateways && !error && (
        <div className="card p-10 text-center text-slate-500">Loading gateways…</div>
      )}

      {gateways && gateways.length === 0 && !adding && (
        <div className="card p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <CardIcon />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">No gateways yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Add the wallet accounts that receive your customer payments.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
            <PlusIcon /> <span className="ml-2">Add your first gateway</span>
          </button>
        </div>
      )}

      {gateways && gateways.length > 0 && (
        <div className="space-y-3">
          {gateways.map((g) => (
            <GatewayCard
              key={g.id}
              gateway={g}
              provider={g.provider}
              variant={g.variant}
              expanded={expandedId === g.id}
              onExpand={() => setExpandedId(expandedId === g.id ? null : g.id)}
              onSave={(form) => onUpdate(g.id, form)}
              onCancel={() => setExpandedId(null)}
              onToggle={() => onToggle(g)}
              onDelete={() => onDelete(g)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddGatewayModal
          onClose={() => setShowAdd(false)}
          onPick={onPick}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Add Gateway Modal */
function AddGatewayModal({ onClose, onPick }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(PROVIDER_CATEGORIES[0].id);

  const cats = PROVIDER_CATEGORIES;
  const activeCat = cats.find((c) => c.id === cat);

  const filtered = useMemo(() => {
    if (!activeCat) return [];
    return activeCat.providers
      .map((id) => PROVIDERS[id])
      .filter(Boolean)
      .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  }, [activeCat, q]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
           className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-5 sm:p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Add Gateway</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search gateways…"
          className="input mt-4"
        />

        {cats.length > 1 && (
          <div className="mt-4 flex gap-1 bg-slate-100 rounded-lg p-1 self-start">
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  cat === c.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 overflow-y-auto pr-1 space-y-4 -mr-1">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No gateways match your search.</p>
          ) : filtered.map((p) => (
            <div key={p.id}>
              <div className="flex items-center gap-2.5">
                <ProviderBadge provider={p.id} size="md" />
                <span className="font-semibold text-slate-900">{p.name}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => onPick(p.id, v)}
                    className="px-4 py-2 text-sm rounded-md border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition font-medium text-slate-700"
                  >
                    {labelVariant(v)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Gateway Card (list item + inline form) */
function GatewayCard({ gateway, provider, variant, isNew, expanded, onExpand, onSave, onCancel, onToggle, onDelete }) {
  const open = isNew || expanded;
  const p = getProvider(provider);
  const accountDisplay = gateway?.account_number || (isNew ? 'Not configured' : '');

  return (
    <div className={`card overflow-hidden ${open ? 'ring-1 ring-brand-200' : ''}`}>
      {/* Header row */}
      <div className="p-4 sm:p-5 flex items-center gap-3">
        <ProviderBadge provider={provider} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{p.name}</span>
            <span className="text-xs font-medium rounded-md bg-slate-100 text-slate-600 px-2 py-0.5">
              {labelVariant(variant)}
            </span>
            {gateway && !gateway.is_enabled && (
              <span className="text-xs font-semibold rounded-md bg-rose-50 text-rose-600 px-2 py-0.5 inline-flex items-center gap-1">
                <DisableIcon /> Disabled
              </span>
            )}
            {gateway && gateway.is_enabled && (
              <span className="text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5">Active</span>
            )}
          </div>
          <div className="text-sm text-slate-500 mt-0.5 truncate">
            {accountDisplay || <span className="italic text-slate-400">Not configured</span>}
          </div>
        </div>

        {!isNew && (
          <div className="flex items-center gap-1">
            <button onClick={onToggle} className="text-slate-400 hover:text-slate-700 p-2 rounded hover:bg-slate-50"
                    title={gateway.is_enabled ? 'Disable' : 'Enable'}>
              {gateway.is_enabled ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={onDelete} className="text-slate-400 hover:text-rose-600 p-2 rounded hover:bg-rose-50"
                    title="Delete">
              <TrashIcon />
            </button>
            <button onClick={onExpand} className="text-slate-400 hover:text-slate-700 p-2 rounded hover:bg-slate-50"
                    aria-label={open ? 'Collapse' : 'Expand'}>
              <ChevronIcon className={open ? 'rotate-180' : ''} />
            </button>
          </div>
        )}
      </div>

      {open && (
        <GatewayForm
          gateway={gateway}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────── Gateway Form */
function GatewayForm({ gateway, onSave, onCancel }) {
  const [form, setForm] = useState({
    account_number: gateway?.account_number || '',
    label:          gateway?.label || '',
    min_amount:     gateway?.min_amount ?? '',
    max_amount:     gateway?.max_amount ?? '',
    charge_value:   gateway?.charge_value ?? '',
    charge_type:    gateway?.charge_type || 'fixed',
    discount_value: gateway?.discount_value ?? '',
    discount_type:  gateway?.discount_type || 'fixed',
    balance_check:  !!gateway?.balance_check,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSave({
        ...form,
        // Send empty strings as null so backend NULLs them out
        min_amount:     form.min_amount === '' ? null : form.min_amount,
        max_amount:     form.max_amount === '' ? null : form.max_amount,
        charge_value:   form.charge_value === '' ? null : form.charge_value,
        charge_type:    form.charge_value === '' ? null : form.charge_type,
        discount_value: form.discount_value === '' ? null : form.discount_value,
        discount_type:  form.discount_value === '' ? null : form.discount_type,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50/40 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Min Amount <span className="text-slate-400 font-normal">(optional)</span></label>
          <input type="number" step="0.01" value={form.min_amount} onChange={(e) => set({ min_amount: e.target.value })} className="input" placeholder="0.00" />
        </div>
        <div>
          <label className="label">Max Amount <span className="text-slate-400 font-normal">(optional)</span></label>
          <input type="number" step="0.01" value={form.max_amount} onChange={(e) => set({ max_amount: e.target.value })} className="input" placeholder="0.00" />
        </div>

        <div>
          <label className="label">Gateway Charge <span className="text-slate-400 font-normal">(optional)</span></label>
          <div className="flex gap-2">
            <input type="number" step="0.01" value={form.charge_value} onChange={(e) => set({ charge_value: e.target.value })} className="input" placeholder="0.00" />
            <select value={form.charge_type} onChange={(e) => set({ charge_type: e.target.value })} className="input !w-24">
              <option value="fixed">Fixed</option>
              <option value="percent">%</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Discount <span className="text-slate-400 font-normal">(optional)</span></label>
          <div className="flex gap-2">
            <input type="number" step="0.01" value={form.discount_value} onChange={(e) => set({ discount_value: e.target.value })} className="input" placeholder="0.00" />
            <select value={form.discount_type} onChange={(e) => set({ discount_type: e.target.value })} className="input !w-24">
              <option value="fixed">Fixed</option>
              <option value="percent">%</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Account Number</label>
        <input required value={form.account_number} onChange={(e) => set({ account_number: e.target.value })} className="input" placeholder="01XXXXXXXXX" />
      </div>

      <div>
        <label className="label">Label <span className="text-slate-400 font-normal">(optional)</span></label>
        <input value={form.label} onChange={(e) => set({ label: e.target.value })} className="input" placeholder="My primary number" />
      </div>

      <div className="flex items-center justify-between py-1">
        <div>
          <div className="text-sm font-medium text-slate-900">Balance Verification</div>
          <div className="text-xs text-slate-500">Track balance to detect fake SMS</div>
        </div>
        <Toggle on={form.balance_check} onChange={(v) => set({ balance_check: v })} />
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : (gateway ? 'Save' : 'Save Gateway')}
        </button>
      </div>
    </form>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-brand-500' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

/* ─────────────────────────────────────── Provider badge */
function ProviderBadge({ provider, size = 'md' }) {
  const p = getProvider(provider);
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
  };
  return (
    <div className={`${sizes[size]} rounded-lg ${p.bg} text-white font-bold flex items-center justify-center shrink-0`}>
      {p.initials}
    </div>
  );
}

/* ─────────────────────────────────────── icons */
function I(props) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function PlusIcon()    { return <I><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></I>; }
function CloseIcon()   { return <I><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
function ChevronIcon({ className = '' }) { return <I className={`transition-transform ${className}`}><polyline points="6 9 12 15 18 9"/></I>; }
function TrashIcon()   { return <I><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></I>; }
function PauseIcon()   { return <I><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></I>; }
function PlayIcon()    { return <I><polygon points="5 3 19 12 5 21 5 3"/></I>; }
function DisableIcon() { return <I width="13" height="13"><line x1="1" y1="1" x2="23" y2="23"/><path d="M10.7 5.6A10.1 10.1 0 0 1 12 5c7 0 11 7 11 7a13.2 13.2 0 0 1-1.7 2.7"/><path d="M6.1 6.1A13.6 13.6 0 0 0 1 12s4 7 11 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/></I>; }
function CardIcon()    { return <I><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></I>; }
