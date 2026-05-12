const MERCHANT_KEY = 'pv_merchant_token';
const ADMIN_KEY    = 'pv_admin_token';

export const merchantAuth = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(MERCHANT_KEY)),
  set: (t) => localStorage.setItem(MERCHANT_KEY, t),
  clear: () => localStorage.removeItem(MERCHANT_KEY),
};

export const adminAuth = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(ADMIN_KEY)),
  set: (t) => localStorage.setItem(ADMIN_KEY, t),
  clear: () => localStorage.removeItem(ADMIN_KEY),
};
