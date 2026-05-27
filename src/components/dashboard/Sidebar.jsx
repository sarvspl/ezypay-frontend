'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { merchantAuth } from '@/lib/auth';
import Logo from '@/components/Logo';

const NAV = [
  {
    section: 'Main',
    items: [
      { label: 'Overview',     href: '/dashboard',              icon: <GridIcon /> },
      { label: 'Transactions', href: '/dashboard/transactions', icon: <SwapIcon /> },
      { label: 'Wallet',       href: '/dashboard/wallet',       icon: <WalletIcon /> },
    ],
  },
  {
    section: 'Integration',
    items: [
      { label: 'Accounts', href: '/dashboard/accounts', icon: <StoreIcon /> },
      { label: 'Devices',  href: '/dashboard/devices',  icon: <PhoneIcon /> },
      { label: 'Gateways', href: '/dashboard/gateways', icon: <CardIcon /> },
    ],
  },
  {
    section: 'Account',
    items: [
      { label: 'Profile',  href: '/dashboard/profile',  icon: <UserIcon /> },
      { label: 'Support',  href: '/dashboard/support',  icon: <LifeBuoyIcon /> },
    ],
  },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    merchantAuth.clear();
    router.replace('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <Logo size="lg" href="/dashboard" />
        {onClose && (
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-700">
            <CloseIcon />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map((section) => (
          <div key={section.section}>
            <div className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
              {section.section}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const base = 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors';
                if (item.soon) {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => alert(`${item.label} page is coming soon.`)}
                        className={`${base} w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50`}
                      >
                        <span className="text-slate-400 group-hover:text-slate-500">{item.icon}</span>
                        <span>{item.label}</span>
                        <span className="ml-auto text-[9px] font-semibold tracking-wider rounded bg-slate-100 text-slate-500 px-1.5 py-0.5">
                          SOON
                        </span>
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`${base} ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={active ? 'text-brand-600' : 'text-slate-400'}>{item.icon}</span>
                      <span>{item.label}</span>
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogoutIcon /> Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ─── Icons ─── */
function I(props) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />; }
function GridIcon()    { return <I><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></I>; }
function SwapIcon()    { return <I><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></I>; }
function StoreIcon()   { return <I><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M3 9h18"/><path d="M9 22V12h6v10"/></I>; }
function CardIcon()    { return <I><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></I>; }
function MessageIcon() { return <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></I>; }
function PhoneIcon()   { return <I><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></I>; }
function LogoutIcon()  { return <I><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></I>; }
function WalletIcon()  { return <I><path d="M20 12V7a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13"/><path d="M2 9v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H4a2 2 0 0 1-2-2z"/><circle cx="17" cy="14" r="1"/></I>; }
function UserIcon()    { return <I><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></I>; }
function LifeBuoyIcon(){ return <I><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></I>; }
function CloseIcon()   { return <I><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></I>; }
