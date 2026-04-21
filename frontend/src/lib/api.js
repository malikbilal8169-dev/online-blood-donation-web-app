const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('bloodlife_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
    ...(options.body && typeof options.body === 'object' && !(options.body instanceof FormData)
      ? { body: JSON.stringify(options.body) }
      : { body: options.body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const auth = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  registerDonor: (body) => api('/auth/register/donor', { method: 'POST', body }),
  registerReceiver: (body) => api('/auth/register/receiver', { method: 'POST', body }),
  getMe: () => api('/auth/me'),
};

export const donors = {
  getMe: () => api('/donors/me'),
  updateProfile: (body) => api('/donors/me', { method: 'PATCH', body }),
  deleteProfile: () => api('/donors/me', { method: 'DELETE' }),
  toggleAvailability: (isProfileEnabled) =>
    api('/donors/me/availability', { method: 'PATCH', body: { isProfileEnabled } }),
  getHistory: () => api('/donors/me/history'),
};

export const receivers = {
  search: (city, bloodGroup) =>
    api(`/receivers/search?city=${encodeURIComponent(city)}&bloodGroup=${encodeURIComponent(bloodGroup)}`),
  createRequest: (body) => api('/receivers/requests', { method: 'POST', body }),
  getMyRequests: () => api('/receivers/requests'),
};

export const requests = {
  listIncoming: () => api('/requests/incoming'),
  accept: (requestId) => api(`/requests/${requestId}/accept`, { method: 'POST' }),
  complete: (requestId) => api(`/requests/${requestId}/complete`, { method: 'POST' }),
  rate: (requestId, rating) => api(`/requests/${requestId}/rate`, { method: 'POST', body: { rating } }),
  cancel: (requestId) => api(`/requests/${requestId}/cancel`, { method: 'POST' }),
};

export const admin = {
  getStats: () => api('/admin/stats'),
  listUsers: (role) =>
    api(role ? `/admin/users?role=${encodeURIComponent(role)}` : '/admin/users'),
  updateUserFlags: (userId, body) =>
    api(`/admin/users/${userId}`, { method: 'PATCH', body }),
  listActiveRequests: () => api('/admin/requests/active'),
  reviewRequest: (requestId, action) =>
    api(`/admin/requests/${requestId}/review`, { method: 'POST', body: { action } }),
};
