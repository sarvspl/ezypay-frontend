'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { useMerchant } from '../layout';

export default function SupportTicketsPage() {
  const router = useRouter();
  const { merchant } = useMerchant();
  const [tickets, setTickets] = useState(null);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState(null); // ticket object (with messages)
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    try {
      const token = merchantAuth.get();
      const r = await api.merchantListTickets(token);
      setTickets(r.tickets || []);
    } catch (e) {
      if (e.status === 401) { merchantAuth.clear(); router.replace('/login'); }
      else setError(e.message);
    }
  };

  useEffect(() => { reload(); }, []); // eslint-disable-line

  const openTicket = async (id) => {
    try {
      const token = merchantAuth.get();
      const r = await api.merchantGetTicket(token, id);
      setSelected({ ticket: r.ticket, messages: r.messages });
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Support</h2>
          <p className="text-sm text-slate-600 mt-1">Open a ticket and our team will get back to you.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="btn-primary !py-2 whitespace-nowrap"
        >
          + New ticket
        </button>
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
      )}

      {/* List */}
      {!tickets && <div className="card p-10 text-center text-slate-400">Loading…</div>}
      {tickets && tickets.length === 0 && (
        <div className="card p-12 text-center">
          <InboxIcon className="w-10 h-10 mx-auto text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No tickets yet</p>
          <p className="mt-1 text-sm text-slate-500">Need help? Open your first ticket and we&apos;ll reply soon.</p>
          <button onClick={() => setCreating(true)} className="mt-4 btn-primary !py-2">+ New ticket</button>
        </div>
      )}
      {tickets && tickets.length > 0 && (
        <div className="card divide-y divide-slate-100">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => openTicket(t.id)}
              className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3"
            >
              <StatusDot status={t.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-semibold text-slate-500">{t.ticket_number}</span>
                  <StatusPill status={t.status} />
                  {t.priority !== 'normal' && <PriorityPill priority={t.priority} />}
                </div>
                <div className="mt-1 font-medium text-slate-900 truncate">{t.subject}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {t.message_count} {t.message_count === 1 ? 'message' : 'messages'}
                  {t.last_reply_at && (
                    <> · Last reply {new Date(t.last_reply_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} by {t.last_reply_by}</>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {creating && (
        <CreateTicketModal
          merchant={merchant}
          onCancel={() => setCreating(false)}
          onCreated={(payload) => {
            setCreating(false);
            setSelected(payload);
            reload();
          }}
        />
      )}

      {selected && (
        <TicketDetailModal
          ticket={selected.ticket}
          messages={selected.messages}
          merchant={merchant}
          onClose={() => { setSelected(null); reload(); }}
          onReplied={(payload) => setSelected(payload)}
        />
      )}
    </div>
  );
}

/* ─────────────── CREATE MODAL ─────────────── */
function CreateTicketModal({ merchant, onCancel, onCreated }) {
  const [subject, setSubject]         = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]       = useState('normal');
  const [busy, setBusy]               = useState(false);
  const [error, setError]             = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setBusy(true); setError(null);
    try {
      const token = merchantAuth.get();
      const r = await api.merchantCreateTicket(token, {
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });
      onCreated({ ticket: r.ticket, messages: r.messages });
    } catch (e) {
      setError(e.message || 'Failed to create ticket.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4">
      <form onSubmit={submit} className="bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">New support ticket</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your contact details below are pulled from your profile and shared with our team.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3">
              <div className="text-slate-500 uppercase tracking-wider font-semibold">Email</div>
              <div className="mt-0.5 text-slate-800 break-all">{merchant?.email || '—'}</div>
            </div>
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3">
              <div className="text-slate-500 uppercase tracking-wider font-semibold">Phone</div>
              <div className="mt-0.5 text-slate-800">{merchant?.mobile || '—'}</div>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="Short summary of the issue"
              className="input"
              disabled={busy}
              required
              autoFocus
            />
          </div>

          <div className="mt-3">
            <label className="label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input"
              disabled={busy}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              rows={6}
              placeholder="Describe what's happening, what you expected, and any error messages."
              className="input"
              disabled={busy}
              required
            />
            <div className="text-[11px] text-slate-400 mt-1 text-right">{description.length}/4000</div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
          <button type="button" onClick={onCancel} disabled={busy} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Creating…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────── DETAIL MODAL ─────────────── */
function TicketDetailModal({ ticket, messages, merchant, onClose, onReplied }) {
  const [reply, setReply] = useState('');
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true); setError(null);
    try {
      const token = merchantAuth.get();
      const r = await api.merchantReplyTicket(token, ticket.id, reply.trim());
      setReply('');
      onReplied({ ticket: r.ticket, messages: r.messages });
    } catch (e) {
      setError(e.message || 'Failed to send reply.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-slate-900/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-slate-500">{ticket.ticket_number}</span>
                <StatusPill status={ticket.status} />
                {ticket.priority !== 'normal' && <PriorityPill priority={ticket.priority} />}
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900 break-words">{ticket.subject}</h2>
            </div>
            <button onClick={onClose} className="shrink-0 text-slate-400 hover:text-slate-700">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/60">
          {messages.map((m) => {
            const mine = m.author_type === 'merchant';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                  mine
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                    {mine ? 'You' : 'Support'} · {new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {ticket.status === 'closed' ? (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-100 text-sm text-slate-600 text-center">
            This ticket is closed. Open a new ticket if you need further help.
          </div>
        ) : (
          <form onSubmit={send} className="p-3 sm:p-4 border-t border-slate-200 space-y-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              maxLength={4000}
              placeholder="Type your reply…"
              className="input"
              disabled={busy}
            />
            {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
            <div className="flex justify-end">
              <button type="submit" disabled={busy || !reply.trim()} className="btn-primary !py-2">
                {busy ? 'Sending…' : 'Send reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────── ICONS / BADGES ─────────────── */
function StatusDot({ status }) {
  const map = {
    open:        'bg-amber-400',
    in_progress: 'bg-blue-500',
    resolved:    'bg-emerald-500',
    closed:      'bg-slate-300',
  };
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${map[status] || 'bg-slate-300'}`} />;
}

function StatusPill({ status }) {
  const map = {
    open:        { label: 'Open',        cls: 'bg-amber-100 text-amber-700' },
    in_progress: { label: 'In progress', cls: 'bg-blue-100 text-blue-700' },
    resolved:    { label: 'Resolved',    cls: 'bg-emerald-100 text-emerald-700' },
    closed:      { label: 'Closed',      cls: 'bg-slate-200 text-slate-700' },
  };
  const s = map[status] || map.open;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function PriorityPill({ priority }) {
  const map = {
    low:  'bg-slate-100 text-slate-600',
    high: 'bg-rose-100 text-rose-700',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[priority] || 'bg-slate-100 text-slate-600'}`}>
    {priority.toUpperCase()}
  </span>;
}

function InboxIcon({ className = '' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>;
}
function CloseIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
