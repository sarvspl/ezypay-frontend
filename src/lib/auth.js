// Session presence markers for the browser dashboard.
//
// SECURITY: the real JWT is NO LONGER stored here. It now lives in an httpOnly
// cookie the backend sets at login, which page JavaScript cannot read — so an
// injected/third-party script can't steal it out of localStorage. We keep only
// a non-secret "logged in" flag so the existing route guards (guard.js) and the
// api plumbing keep working unchanged; the browser attaches the cookie itself.
//
// `set()` ignores whatever token value is passed and stores just the flag.
// `clear()` removes the flag AND asks the backend to clear the cookie.

const MERCHANT_KEY = 'pv_merchant_token';
const ADMIN_KEY    = 'pv_admin_token';
const FLAG = '1';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Best-effort server-side logout: clears the httpOnly cookie. Fire-and-forget
// so callers (guard/logout button) stay synchronous like before.
function serverLogout(path) {
  try {
    fetch(`${API_URL}${path}`, { method: 'POST', credentials: 'include' }).catch(() => {});
  } catch {}
}

export const merchantAuth = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(MERCHANT_KEY)),
  set: () => localStorage.setItem(MERCHANT_KEY, FLAG),
  clear: () => {
    try { localStorage.removeItem(MERCHANT_KEY); } finally { serverLogout('/api/merchant/logout'); }
  },
};

export const adminAuth = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(ADMIN_KEY)),
  set: () => localStorage.setItem(ADMIN_KEY, FLAG),
  clear: () => {
    try { localStorage.removeItem(ADMIN_KEY); } finally { serverLogout('/api/admin/logout'); }
  },
};
