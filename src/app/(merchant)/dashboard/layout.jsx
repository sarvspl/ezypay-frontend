'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { merchantAuth } from '@/lib/auth';
import { useGuard } from '@/lib/guard';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

const MerchantContext = createContext(null);
export const useMerchant = () => useContext(MerchantContext);

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const ready = useGuard('merchant');
  const [merchant, setMerchant] = useState(null);
  const [error, setError] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const token = merchantAuth.get();
    api.merchantMe(token)
      .then((r) => setMerchant(r.merchant))
      .catch((e) => {
        if (e.status === 401) {
          merchantAuth.clear();
          router.replace('/login');
        } else {
          setError(e.message);
        }
      });
  }, [ready, router]);

  if (!ready) return null;

  return (
    <MerchantContext.Provider value={{ merchant, error }}>
      <div className="min-h-screen flex bg-slate-50">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar (overlay) */}
        {mobileSidebar && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="bg-black/40 absolute inset-0" onClick={() => setMobileSidebar(false)} />
            <div className="relative">
              <Sidebar onClose={() => setMobileSidebar(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar merchant={merchant} onOpenSidebar={() => setMobileSidebar(true)} />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </MerchantContext.Provider>
  );
}
