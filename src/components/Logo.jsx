import Link from 'next/link';

/* Just the chat-bubble + check icon. Inherits color via `currentColor` — wrap in `text-brand-600` to brand it. */
export function LogoMark({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
        fill="currentColor" opacity=".15"
      />
      <path
        d="M9 10.5l2 2 4-4"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
        stroke="currentColor" strokeWidth="1.5"
      />
    </svg>
  );
}

/* Just the wordmark — "Pay" in slate-900, "Verify" in brand color. */
export function Wordmark({ className = 'text-lg' }) {
  return (
    <span className={`font-bold tracking-tight text-slate-900 ${className}`}>
      Pay<span className="text-brand-600">Verify</span>
    </span>
  );
}

/* Icon + wordmark together. Used in nav bars, headers, sidebars. */
export default function Logo({ size = 'md', href = '/', className = '' }) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;

  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="text-brand-600 shrink-0">
        <LogoMark className={s.icon} />
      </span>
      <Wordmark className={s.text} />
    </span>
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center" aria-label="PayVerify home">{inner}</Link>;
  }
  return inner;
}
