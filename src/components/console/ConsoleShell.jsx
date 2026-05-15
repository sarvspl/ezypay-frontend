'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/auth';
import { LogoMark } from '@/components/Logo';

const NAV = [
  { href: '/console/merchants',        label: 'Merchants', icon: <UsersIcon /> },
  { href: '/console/providers',        label: 'Providers', icon: <GridIcon /> },
  { href: '/console/platform-account', label: 'Platform',  icon: <ServerIcon /> },
  { href: '/console/support',          label: 'Support',   icon: <HelpIcon /> },
];

export default function ConsoleShell({ children, action }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const logout = () => { adminAuth.clear(); router.replace('/console/login'); };

  const activeSection = NAV.find((n) => pathname.startsWith(n.href));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/console/merchants" className="flex items-center gap-2 shrink-0">
            <span className="text-brand-600"><LogoMark className="w-7 h-7" /></span>
            <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
              Pay<span className="text-brand-600">Verify</span>
            </span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-300 rounded px-1.5 py-0.5">
              Console
            </span>
          </Link>

          {/* Section pill nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {NAV.map((n) => {
              const isActive = activeSection?.href === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-1.5 rounded-full text-sm font-medium transition px-3 py-1.5 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>{n.icon}</span>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {action}
            <button
              onClick={logout}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile nav (horizontal scroll) */}
        <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
          {NAV.map((n) => {
            const isActive = activeSection?.href === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-1.5 rounded-full text-xs font-medium px-3 py-1.5 whitespace-nowrap ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}

/* ── tiny inline icons ── */
function I(props) { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function UsersIcon()  { return <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>; }
function GridIcon()   { return <I><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></I>; }
function ServerIcon() { return <I><rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><line x1="6" y1="7" x2="6.01" y2="7"/><line x1="6" y1="17" x2="6.01" y2="17"/></I>; }
function HelpIcon()   { return <I><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></I>; }
