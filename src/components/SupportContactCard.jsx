'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Renders the platform's support contact details (email, phone, WhatsApp,
 * hours) inside a coloured card. Fetches /api/support on mount; renders
 * nothing if nothing's configured.
 *
 * Use this anywhere a user is told to "contact support" — the user shouldn't
 * have to hunt for *how*.
 *
 * Props:
 *   tone   — 'amber' (default) | 'rose' | 'slate'
 *   title  — heading text (default: "Need help?")
 *   compact — slightly tighter padding
 */
export default function SupportContactCard({ tone = 'amber', title = 'Need help?', compact = false }) {
  const [support, setSupport] = useState(null);

  useEffect(() => {
    api.getSupport()
      .then((r) => setSupport(r?.support || null))
      .catch(() => setSupport(null));
  }, []);

  if (!support) return null;
  const hasAny = support.email || support.phone || support.whatsapp || support.telegram || support.hours;
  if (!hasAny) return null;

  // Build a t.me link whether the admin entered "@handle", "handle", or a full URL.
  const tgHandle = (support.telegram || '')
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '')
    .trim();
  const tgHref = /^https?:\/\//i.test(support.telegram || '') ? support.telegram : (tgHandle ? `https://t.me/${tgHandle}` : null);

  const tones = {
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: 'text-amber-900',
      text: 'text-amber-800',
      link: 'text-amber-900',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      title: 'text-rose-900',
      text: 'text-rose-800',
      link: 'text-rose-900',
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      title: 'text-slate-900',
      text: 'text-slate-700',
      link: 'text-slate-900',
    },
  };
  const t = tones[tone] || tones.amber;

  return (
    <div className={`${t.bg} ${t.border} border rounded-lg ${compact ? 'p-3' : 'p-4'} text-sm`}>
      <div className={`font-semibold ${t.title}`}>{title}</div>
      {support.message && <p className={`mt-1 ${t.text}`}>{support.message}</p>}
      <ul className={`mt-2 space-y-1.5 ${t.link}`}>
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
        {tgHref && (
          <li className="flex items-start gap-2">
            <TelegramIcon /> <a href={tgHref} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">Telegram: {tgHandle ? `@${tgHandle}` : support.telegram}</a>
          </li>
        )}
        {support.hours && (
          <li className="flex items-start gap-2">
            <ClockIcon /> <span>{support.hours}</span>
          </li>
        )}
      </ul>
    </div>
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
function TelegramIcon() {
  return (
    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.94 4.66a1.2 1.2 0 0 0-1.27-.18L3.4 11.3c-.86.34-.85 1.57.02 1.9l4.2 1.56 1.62 5.06c.2.62 1 .8 1.45.32l2.3-2.45 4.36 3.2c.55.4 1.34.1 1.49-.56l3.06-14.2a1.2 1.2 0 0 0-.46-1.27ZM9.7 14.13l-.6 3.74-1.27-3.96 8.9-5.6-7.03 5.82Z"/>
    </svg>
  );
}
