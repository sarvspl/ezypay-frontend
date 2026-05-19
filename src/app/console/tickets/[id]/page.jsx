'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { adminAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import ConsoleShell from '@/components/console/ConsoleShell';

export default function ConsoleTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const ready = useGuard('admin');

  const [data, setData] = useState(null); // { ticket, messages }
  const [error, setError] = useState(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const reload = () => {
    if (!ready) return;
    const token = adminAuth.get();
    return api.adminGetTicket(token, id)
      .then((r) => setData({ ticket: r.ticket, messages: r.messages }))
      .catch((e) => {
        if (e.status === 401) { adminAuth.clear(); router.replace('/console/login'); }
        else if (e.status === 404) setError('Ticket not found.');
        else setError(e.message);
      });
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [ready, id]);

  if (!ready) return null;

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy(true);
    try {
      const token = adminAuth.get();
      const r = await api.adminReplyTicket(token, id, reply.trim());
      setData({ ticket: r.ticket, messages: r.messages });
      setReply('');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const updateStatus = async (newStatus) => {
    setStatusBusy(true);
    try {
      const token = adminAuth.get();
      const r = await api.adminUpdateTicket(token, id, { status: newStatus });
      setData((d) => ({ ...d, ticket: r.ticket }));
    } catch (e) { setError(e.message); }
    finally { setStatusBusy(false); }
  };

  const updatePriority = async (newPriority) => {
    setStatusBusy(true);
    try {
      const token = adminAuth.get();
      const r = await api.adminUpdateTicket(token, id, { priority: newPriority });
      setData((d) => ({ ...d, ticket: r.ticket }));
    } catch (e) { setError(e.message); }
    finally { setStatusBusy(false); }
  };

  if (error) {
    return (
      <ConsoleShell>
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded p-3">{error}</div>
        <Link href="/console/tickets" className="mt-4 inline-block text-brand-600 hover:underline">← Back to tickets</Link>
      </ConsoleShell>
    );
  }

  if (!data) {
    return <ConsoleShell><div className="text-slate-500 text-sm">Loading…</div></ConsoleShell>;
  }

  const { ticket, messages } = data;

  return (
    <ConsoleShell>
      <Link href="/console/tickets" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
        ← Back to tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Thread column */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col min-h-[60vh]">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-slate-500">{ticket.ticket_number}</span>
              <StatusPill status={ticket.status} />
              <PriorityPill priority={ticket.priority} />
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900 break-words">{ticket.subject}</h1>
            <div className="mt-1 text-xs text-slate-500">
              Created {new Date(ticket.created_at).toLocaleString()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/60">
            {messages.map((m) => {
              const isAdmin = m.author_type === 'admin';
              return (
                <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                    isAdmin
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">
                      {isAdmin ? 'You (Admin)' : ticket.merchant_name} · {new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {ticket.status === 'closed' ? (
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-100 text-sm text-slate-600 text-center">
              This ticket is closed. Reopen it to reply.
            </div>
          ) : (
            <form onSubmit={sendReply} className="p-3 sm:p-4 border-t border-slate-200 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder="Reply to the merchant…"
                className="input"
                disabled={busy}
              />
              <div className="flex justify-end">
                <button type="submit" disabled={busy || !reply.trim()} className="btn-primary !py-2">
                  {busy ? 'Sending…' : 'Send reply'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar: merchant + actions */}
        <aside className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Merchant</div>
            <div className="mt-2 font-semibold text-slate-900 break-words">{ticket.merchant_name}</div>

            <div className="mt-3 space-y-2 text-sm">
              {ticket.contact_email && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Email</div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-slate-800 break-all">{ticket.contact_email}</span>
                    <a
                      href={`mailto:${ticket.contact_email}?subject=${encodeURIComponent('[' + ticket.ticket_number + '] ' + ticket.subject)}`}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md px-2.5 py-1"
                      title="Send email"
                    >
                      <MailIcon /> Mail
                    </a>
                  </div>
                </div>
              )}
              {ticket.contact_phone && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Phone</div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-slate-800 font-mono">{ticket.contact_phone}</span>
                    <a
                      href={`tel:${ticket.contact_phone}`}
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md px-2.5 py-1"
                      title="Call merchant"
                    >
                      <PhoneIcon /> Call
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`/console/merchants/${ticket.merchant_id}`}
              className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              View merchant profile →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Status</div>
            <select
              value={ticket.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="input"
              disabled={statusBusy}
            >
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-4 mb-2">Priority</div>
            <select
              value={ticket.priority}
              onChange={(e) => updatePriority(e.target.value)}
              className="input"
              disabled={statusBusy}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </aside>
      </div>
    </ConsoleShell>
  );
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
    low:    'bg-slate-100 text-slate-600',
    normal: 'bg-slate-100 text-slate-600',
    high:   'bg-rose-100 text-rose-700',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[priority] || 'bg-slate-100 text-slate-600'}`}>
    {priority.toUpperCase()}
  </span>;
}

function MailIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>;
}
function PhoneIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>;
}
