const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Terjadi kesalahan pada server');
  }

  return data;
}

export const menuApi = {
  getAll: (search = '', options = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (options.includeInactive) params.set('includeInactive', 'true');
    const query = params.toString();
    return request(`/menus${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/menus/${id}`),
  create: (payload) => request('/menus', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => request(`/menus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id) => request(`/menus/${id}`, {
    method: 'DELETE',
  }),
};

export const orderApi = {
  getAll: () => request('/orders'),
  create: (payload) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateStatus: (id, status) => request(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

export const transactionApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    const query = params.toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },
  summary: () => request('/transactions/summary'),
  create: (payload) => request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => request(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id) => request(`/transactions/${id}`, {
    method: 'DELETE',
  }),
};

export const authApi = {
  login: (payload) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  profile: () => request('/auth/profile'),
};

export { API_BASE_URL };
