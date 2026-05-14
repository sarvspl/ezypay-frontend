const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  merchantListBrands:   (token) => request('/api/merchant/brands', { token }),
  merchantCreateBrand:  (token, body) => request('/api/merchant/brands', { method: 'POST', body, token }),
  merchantDeleteBrand:  (token, id) => request(`/api/merchant/brands/${id}`, { method: 'DELETE', token }),

  // Devices
  merchantListDevices:        (token) => request('/api/merchant/devices', { token }),
  merchantListDeviceHistory:  (token) => request('/api/merchant/devices/history', { token }),
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

  // Public checkout (no auth, by session id)
  checkoutSession:  (id) => request(`/api/checkout/${id}`),
  checkoutGateways: (id) => request(`/api/checkout/${id}/gateways`),
  checkoutSubmit:   (id, body) => request(`/api/checkout/${id}/submit`, { method: 'POST', body }),
  checkoutStatus:   (id) => request(`/api/checkout/${id}/status`),
  checkoutCancel:   (id) => request(`/api/checkout/${id}/cancel`, { method: 'POST' }),

  // Admin
  adminLogin:        (body) => request('/api/admin/login', { method: 'POST', body }),
  adminListMerchants:(token) => request('/api/admin/merchants', { token }),
  adminGetMerchant:  (token, id) => request(`/api/admin/merchants/${id}`, { token }),
  adminCreateMerchant:(token, body) => request('/api/admin/merchants', { method: 'POST', body, token }),
  adminSuspendMerchant:   (token, id, reason) => request(`/api/admin/merchants/${id}/suspend`, { method: 'POST', body: { reason }, token }),
  adminUnsuspendMerchant: (token, id) => request(`/api/admin/merchants/${id}/unsuspend`, { method: 'POST', token }),

  // Providers (public for merchant catalog, admin CRUD for console)
  listProviders:         () => request('/api/providers'),
  adminListProviders:    (token) => request('/api/admin/providers', { token }),
  adminCreateProvider:   (token, body) => request('/api/admin/providers', { method: 'POST', body, token }),
  adminUpdateProvider:   (token, id, body) => request(`/api/admin/providers/${id}`, { method: 'PATCH', body, token }),
  adminDeleteProvider:   (token, id) => request(`/api/admin/providers/${id}`, { method: 'DELETE', token }),
};
