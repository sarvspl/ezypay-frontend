import Logo from '@/components/Logo';

export const metadata = {
  title: 'Secure Checkout · PayVerify',
};

export default function PayLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size="sm" href="/" />
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <LockIcon /> Secured by PayVerify
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PayVerify</span>
          <span className="flex items-center gap-1.5"><LockIcon /> Encrypted &amp; verified</span>
        </div>
      </footer>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
