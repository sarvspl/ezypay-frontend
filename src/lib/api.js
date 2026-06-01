const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Base origin for building absolute URLs to backend-served files (e.g. payment
// proof screenshots stored under /uploads/proofs/...).
export const API_BASE = API_URL;

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    // Global handler: a logged-in merchant whose account just got suspended
    // gets booted back to login with a banner explaining why.
    if (res.status === 403 && data && data.suspended && typeof window !== 'undefined') {
      try {
        const m = require('./auth');
        if (m && m.merchantAuth) m.merchantAuth.clear();
      } catch {}
      const reason = data.error ? `?suspended=${encodeURIComponent(data.error)}` : '?suspended=1';
      // Only redirect if we're inside the merchant dashboard (don't trash the public/admin flow).
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.replace('/login' + reason);
      }
    }
    // 402 insufficient balance — push the merchant to the wallet page where
    // they can top up. Not destructive (no logout); just redirect.
    if (
      res.status === 402 && data && data.insufficient_balance &&
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/dashboard') &&
      !window.location.pathname.startsWith('/dashboard/wallet')
    ) {
      window.location.replace('/dashboard/wallet?low_balance=1');
    }
    const err = new Error((data && data.error) || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Merchant
  merchantRegister:      (body) => request('/api/merchant/register', { method: 'POST', body }),
  merchantLogin:         (body) => request('/api/merchant/login',    { method: 'POST', body }),
  merchantCheckUsername: (username) => request(`/api/merchant/check-username?username=${encodeURIComponent(username)}`),
  merchantMe:            (token) => request('/api/merchant/me', { token }),
  merchantUpdateMe:      (token, body) => request('/api/merchant/me', { method: 'PATCH', body, token }),
  merchantChangePassword:(token, body) => request('/api/merchant/me/password', { method: 'POST', body, token }),

  // Brands
  merchantUnlockKeys:   (token) => request('/api/merchant/keys/unlock', { method: 'POST', token }),
  merchantListBrands:   (token) => request('/api/merchant/brands', { token }),
  merchantCreateBrand:  (token, body) => request('/api/merchant/brands', { method: 'POST', body, token }),
  merchantUnlockBrand:  (token, id) => request(`/api/merchant/brands/${id}/unlock`, { method: 'POST', token }),
  merchantDeleteBrand:  (token, id) => request(`/api/merchant/brands/${id}`, { method: 'DELETE', token }),

  // Accounts (receiving units: own device key + up to 8 gateways)
  merchantListAccounts:  (token) => request('/api/merchant/accounts', { token }),
  merchantCreateAccount: (token, body) => request('/api/merchant/accounts', { method: 'POST', body, token }),
  merchantUnlockAccount: (token, id) => request(`/api/merchant/accounts/${id}/unlock`, { method: 'POST', token }),

  // Devices
  merchantListDevices:        (token) => request('/api/merchant/devices', { token }),
  merchantListDeviceHistory:  (token) => request('/api/merchant/devices/history', { token }),
  merchantUpdateDevice:       (token, id, body) => request(`/api/merchant/devices/${id}`, { method: 'PATCH', body, token }),
  merchantDeleteDevice:       (token, id) => request(`/api/merchant/devices/${id}`, { method: 'DELETE', token }),

  // Gateways
  merchantListGateways:   (token) => request('/api/merchant/gateways', { token }),
  merchantCreateGateway:  (token, body) => request('/api/merchant/gateways', { method: 'POST', body, token }),
  merchantUpdateGateway:  (token, id, body) => request(`/api/merchant/gateways/${id}`, { method: 'PATCH', body, token }),
  merchantToggleGateway:  (token, id) => request(`/api/merchant/gateways/${id}/toggle`, { method: 'POST', token }),
  merchantDeleteGateway:  (token, id) => request(`/api/merchant/gateways/${id}`, { method: 'DELETE', token }),

  // Transactions (merchant dashboard)
  merchantListTransactions: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/merchant/transactions${qs ? '?' + qs : ''}`, { token });
  },
  merchantResolveTransaction: (token, id, result, reason) =>
    request(`/api/merchant/transactions/${id}/resolve`, { method: 'POST', body: { result, reason }, token }),

  // SMS (merchant dashboard)
  merchantListSms: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/merchant/sms${qs ? '?' + qs : ''}`, { token });
  },
  merchantVerifyTxnId: (token, txnid) =>
    request('/api/merchant/verify', { method: 'POST', body: { txnid }, token }),

  // Wallet (merchant dashboard)
  merchantGetWallet:        (token) => request('/api/merchant/wallet', { token }),
  merchantListRecharges:    (token) => request('/api/merchant/wallet/recharges', { token }),
  merchantStartRecharge:    (token, amount) => request('/api/merchant/wallet/recharge', { method: 'POST', body: { amount }, token }),

  // Support tickets (merchant)
  merchantListTickets:      (token) => request('/api/merchant/tickets', { token }),
  merchantCreateTicket:     (token, body) => request('/api/merchant/tickets', { method: 'POST', body, token }),
  merchantGetTicket:        (token, id) => request(`/api/merchant/tickets/${id}`, { token }),
  merchantReplyTicket:      (token, id, body) => request(`/api/merchant/tickets/${id}/messages`, { method: 'POST', body: { body }, token }),

  // Public checkout (no auth, by session id)
  checkoutSession:  (id) => request(`/api/checkout/${id}`),
  checkoutGateways: (id) => request(`/api/checkout/${id}/gateways`),
  checkoutSubmit:   (id, body) => request(`/api/checkout/${id}/submit`, { method: 'POST', body }),
  checkoutStatus:   (id) => request(`/api/checkout/${id}/status`),
  checkoutCancel:   (id) => request(`/api/checkout/${id}/cancel`, { method: 'POST' }),

  // Admin
  adminLogin:        (body) => request('/api/admin/login', { method: 'POST', body }),
  adminListMerchants:(token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/merchants${qs ? '?' + qs : ''}`, { token });
  },
  adminGetMerchant:  (token, id) => request(`/api/admin/merchants/${id}`, { token }),
  adminCreateMerchant:(token, body) => request('/api/admin/merchants', { method: 'POST', body, token }),
  adminSuspendMerchant:   (token, id, body) => request(`/api/admin/merchants/${id}/suspend`, { method: 'POST', body: body || {}, token }),
  adminUnsuspendMerchant: (token, id) => request(`/api/admin/merchants/${id}/unsuspend`, { method: 'POST', token }),
  adminAdjustWallet:      (token, id, body) => request(`/api/admin/merchants/${id}/wallet`, { method: 'POST', body, token }),
  adminGetMerchantLedger:    (token, id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/merchants/${id}/wallet/ledger${qs ? '?' + qs : ''}`, { token });
  },
  adminGetMerchantRecharges: (token, id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/merchants/${id}/wallet/recharges${qs ? '?' + qs : ''}`, { token });
  },
  adminResetMerchantPassword: (token, id, body) =>
    request(`/api/admin/merchants/${id}/reset-password`, { method: 'POST', body: body || {}, token }),

  // Providers (public for merchant catalog, admin CRUD for console)
  listProviders:         () => request('/api/providers'),
  adminListProviders:    (token) => request('/api/admin/providers', { token }),
  adminCreateProvider:   (token, body) => request('/api/admin/providers', { method: 'POST', body, token }),
  adminUpdateProvider:   (token, id, body) => request(`/api/admin/providers/${id}`, { method: 'PATCH', body, token }),
  adminDeleteProvider:   (token, id) => request(`/api/admin/providers/${id}`, { method: 'DELETE', token }),

  // Support contact config
  getSupport:             () => request('/api/support'),
  adminGetSupport:        (token) => request('/api/admin/support', { token }),
  adminUpdateSupport:     (token, body) => request('/api/admin/support', { method: 'PUT', body, token }),

  // Platform merchant (admin-managed receiving accounts for wallet topups)
  adminGetPlatform:           (token) => request('/api/admin/platform', { token }),
  adminGetPlatformSettings:   (token) => request('/api/admin/platform/settings', { token }),
  adminUpdatePlatformSettings:(token, body) => request('/api/admin/platform/settings', { method: 'PUT', body, token }),
  adminListMerchantTransactions: (token, id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/merchants/${id}/transactions${qs ? '?' + qs : ''}`, { token });
  },
  adminListPlatformRecharges: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/platform/recharges${qs ? '?' + qs : ''}`, { token });
  },
  adminGetPlatformRevenue:    (token) => request('/api/admin/platform/revenue', { token }),
  adminListPlatformGateways:   (token) => request('/api/admin/platform/gateways', { token }),
  adminCreatePlatformGateway:  (token, body) => request('/api/admin/platform/gateways', { method: 'POST', body, token }),
  adminUpdatePlatformGateway:  (token, id, body) => request(`/api/admin/platform/gateways/${id}`, { method: 'PATCH', body, token }),
  adminTogglePlatformGateway:  (token, id) => request(`/api/admin/platform/gateways/${id}/toggle`, { method: 'POST', token }),
  adminDeletePlatformGateway:  (token, id) => request(`/api/admin/platform/gateways/${id}`, { method: 'DELETE', token }),
  adminListPlatformDevices:        (token) => request('/api/admin/platform/devices', { token }),
  adminDeletePlatformDevice:       (token, id) => request(`/api/admin/platform/devices/${id}`, { method: 'DELETE', token }),
  adminListPlatformTransactions:   (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/platform/transactions${qs ? '?' + qs : ''}`, { token });
  },
  adminResolvePlatformTransaction: (token, id, result, reason) =>
    request(`/api/admin/platform/transactions/${id}/resolve`, { method: 'POST', body: { result, reason }, token }),

  // Support tickets (admin)
  adminListTickets:    (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/tickets${qs ? '?' + qs : ''}`, { token });
  },
  adminGetTicket:      (token, id) => request(`/api/admin/tickets/${id}`, { token }),
  adminReplyTicket:    (token, id, body) => request(`/api/admin/tickets/${id}/messages`, { method: 'POST', body: { body }, token }),
  adminUpdateTicket:   (token, id, body) => request(`/api/admin/tickets/${id}`, { method: 'PATCH', body, token }),
};
