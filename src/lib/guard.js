'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { merchantAuth, adminAuth } from './auth';

/**
 * Protect a client page. Returns `true` only when an auth token exists.
 * If no token, redirects to the role's login route and returns `false`.
 *
 * Handles:
 *  - initial mount (back button / direct nav to a protected URL)
 *  - browser BFCache restore via `pageshow` (back/forward after logout)
 *  - cross-tab logout via `storage` event
 *  - tab refocus (token removed in another tab)
 */
export function useGuard(role) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const store = role === 'admin' ? adminAuth : merchantAuth;
    const loginPath = role === 'admin' ? '/console/login' : '/login';

    const check = () => {
      if (store.get()) {
        setReady(true);
      } else {
        setReady(false);
        router.replace(loginPath);
      }
    };

    check();

    const onPageShow = (e) => { if (e.persisted) check(); };
    const onFocus = () => check();
    const onStorage = (e) => {
      if (!e.key || e.key.startsWith('pv_')) check();
    };

    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [router, role]);

  return ready;
}
