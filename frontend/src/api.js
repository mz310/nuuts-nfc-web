// API client for backend communication
// Base URL from environment variable or defaults to '/api'
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (e.g., '/leaderboard', '/user/1')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - JSON response data
 * @throws {Error} - Error with message from API response
 */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include' // Include cookies for session management
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Handle both error formats: { error: "..." } and { error: { message: "..." } }
    const errorMessage = typeof error.error === 'string' 
      ? error.error 
      : error.error?.message || error.message || 'Request failed';
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Get leaderboard data with formatted rows
  // Returns rows with normalized total (number) and industry/profession fields
  getLeaderboard: async () => {
    const data = await apiRequest('/leaderboard');
    const rows = Array.isArray(data.rows) ? data.rows : [];
    return {
      ...data,
      rows: rows.map((row) => {
        const { total, profession, industry, ...rest } = row;
        return {
          ...rest,
          profession: profession || null,
          industry: industry || null,
          total:
            typeof total === "number"
              ? total
              : Number.parseFloat(total) || 0,
        };
      }),
    };
  },

  // Get user profile by ID
  // Returns user data including profile information and total contribution
  getUserProfile: (id) => apiRequest(`/user/${id}`),

  // Update user profile
  // @param {number} id - User ID
  // @param {object} data - User data to update (name, nickname, profession, industry, phone, bio, gender)
  updateUserProfile: (id, data) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Check if UID is already registered
  // @param {string} uid - NFC tag UID to check
  // Returns registration status and message
  checkRegister: (uid) => apiRequest(`/register/check?uid=${encodeURIComponent(uid || '')}`),

  // Register new user
  // @param {object} data - User registration data (name, nickname, profession, industry, uid, phone, bio, gender)
  // Note: UID is required and must come from NFC reader
  postRegister: (data) => apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Resolve UID to user profile or registration page
  // @param {string} uid - NFC tag UID
  // Returns redirect URL based on whether user exists
  resolveUID: (uid) => apiRequest(`/resolve/${uid}`),

  // Record NFC scan event (for ESP32/Gateway)
  // @param {object} data - Scan data (uid, timestamp, etc.)
  scan: (data) => apiRequest('/scan', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Get last NFC scan data
  // Returns most recent scan UID and timestamp
  getLastScan: () => apiRequest('/last-scan'),

  // Get NDEF URL for NFC tag writing
  // @param {string} uid - NFC tag UID
  // Returns profile URL if user exists, registration URL otherwise
  getNdefUrl: (uid) => apiRequest(`/ndef-url?uid=${encodeURIComponent(uid)}`),

  // Admin login
  // @param {string} username - Admin username
  // @param {string} password - Admin password
  adminLogin: (username, password) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),

  // Admin logout
  // Ends admin session
  adminLogout: () => apiRequest('/admin/logout', { method: 'POST' }),

  // Get admin dashboard data
  // @param {string} query - Optional search query to filter users
  // Returns list of users with their total contributions
  getAdminDashboard: (query) => apiRequest(`/admin/dashboard${query ? `?q=${encodeURIComponent(query)}` : ''}`),

  // Admin: Quick add transaction for user
  // @param {object} data - Transaction data (uid, amount)
  adminQuickAddTx: (data) => apiRequest('/admin/quick-add-tx', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin: Quick register user (requires UID from NFC reader)
  // @param {object} data - User data (uid, name, nickname, profession, industry)
  // Note: UID is required and must come from NFC reader
  adminQuickRegister: (data) => apiRequest('/admin/quick-register-link', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin: Delete user and all associated data
  // @param {number} userId - User ID to delete
  adminDeleteUser: (userId) => apiRequest('/admin/delete-user', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  })
};
