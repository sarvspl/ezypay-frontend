'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';

const LINKS = [
  { id: 'how',      label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'compare',  label: 'Why us' },
  { id: 'faq',      label: 'FAQ' },
];

export default function LandingNav() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const sections = LINKS
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    if (sections.length === 0) return;

    // Track which section's top is closest to the viewport top offset (just below nav).
    const NAV_OFFSET = 96;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY + NAV_OFFSET + 1;
      let current = null;
      for (const sec of sections) {
        if (sec.offsetTop <= y) current = sec.id;
      }
      // Clear active when scrolled back near the top (hero visible)
      if (window.scrollY < 80) current = null;
      setActive(current);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo size="md" />

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {LINKS.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'relative px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'text-brand-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                {l.label}
                <span
                  className={[
                    'pointer-events-none absolute left-3 right-3 -bottom-[1px] h-0.5 rounded-full bg-brand-600 transition-all duration-200',
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-50',
                  ].join(' ')}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex btn-secondary !py-1.5 !px-3 text-sm">Merchant Login</Link>
          <Link href="/register" className="btn-primary !py-1.5 !px-3 text-sm">Get started</Link>
        </div>
      </div>
    </header>
  );
}

