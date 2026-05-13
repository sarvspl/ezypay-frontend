'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLES = {
  '/dashboard':              'Overview',
  '/dashboard/brands':       'Brands',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/devices':      'Devices',
  '/dashboard/gateways':     'Gateways',
  '/dashboard/sms':          'Verify Payment',
  '/dashboard/profile':      'Profile',
};

export default function Topbar({ merchant, onOpenSidebar }) {
  const pathname = usePathname();
  const title = TITLES[pathname] || 'Dashboard';

  const initial = (merchant?.name || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="md:hidden text-slate-500 hover:text-slate-900 -ml-1 p-1"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
        </div>

        {merchant ? (
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-slate-50 transition-colors group"
            title="View profile"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-brand-700">{merchant.name}</div>
              <div className="text-xs text-slate-500 leading-tight">{merchant.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              {initial}
            </div>
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
        )}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
