// api.js — API client for backend communication
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Leaderboard
  getLeaderboard: () => apiRequest('/leaderboard'),

  // User profile
  getUserProfile: (id) => apiRequest(`/user/${id}`),

  // Registration
  checkRegister: (uid) => apiRequest(`/register/check?uid=${encodeURIComponent(uid || '')}`),
  postRegister: (data) => apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // NFC resolve
  resolveUID: (uid) => apiRequest(`/resolve/${uid}`),

  // ESP32 / Gateway API
  scan: (data) => apiRequest('/scan', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getLastScan: () => apiRequest('/last-scan'),
  getNdefUrl: (uid) => apiRequest(`/ndef-url?uid=${encodeURIComponent(uid)}`),

  // Admin
  adminLogin: (username, password) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  adminLogout: () => apiRequest('/admin/logout', { method: 'POST' }),
  getAdminDashboard: (query) => apiRequest(`/admin/dashboard${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  adminQuickAddTx: (data) => apiRequest('/admin/quick-add-tx', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  adminQuickRegister: (data) => apiRequest('/admin/quick-register-link', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  adminDeleteUser: (userId) => apiRequest('/admin/delete-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  })
};

