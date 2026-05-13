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

/* Icon + wordmark together. Used in nav bars, headers, sidebars.
 * Uses the brand logo PNG from /public/logo-payverify.png. */
export default function Logo({ size = 'md', href = '/', className = '' }) {
  const sizes = {
    sm: 'h-7',   // ~28px tall
    md: 'h-9',   // ~36px tall
    lg: 'h-12',  // ~48px tall
  };
  const heightClass = sizes[size] || sizes.md;

  const img = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/logo-payverify.png"
      alt="PayVerify"
      className={`${heightClass} w-auto ${className}`}
    />
  );

  if (href) {
    return <Link href={href} className="inline-flex items-center" aria-label="PayVerify home">{img}</Link>;
  }
  return img;
}
