const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `خطأ في الخادم (${response.status})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'}] ${url}:`, err);
    throw err;
  }
}

// Auth Service
export const authService = {
  login: async (username, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  },
  getMe: () => request('/auth/me'),
  logout: () => {
    setToken(null);
    setUser(null);
  }
};

// Student Service
export const studentService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students?${query}`);
  },
  getById: (id) => request(`/students/${id}`),
  create: (data) => request('/students', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/students/${id}`, {
    method: 'DELETE'
  }),
  checkDuplicate: (data) => request('/students/check-duplicate', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Teacher & Staff Service
export const teacherService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/teachers?${query}`);
  },
  getById: (id) => request(`/teachers/${id}`),
  create: (data) => request('/teachers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => request(`/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => request(`/teachers/${id}`, {
    method: 'DELETE'
  }),
  checkDuplicate: (data) => request('/teachers/check-duplicate', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Dashboard Service
export const dashboardService = {
  getStats: () => request('/dashboard/stats')
};

// Photo Upload Service
export const uploadService = {
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return request('/upload', {
      method: 'POST',
      body: formData
    });
  }
};

// Import / Export Service
export const importExportService = {
  getExportUrl: (type, format) => `${API_BASE}/data/export?type=${type}&format=${format}`,
  preview: async (file, targetType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', targetType);
    return request('/data/import/preview', {
      method: 'POST',
      body: formData
    });
  },
  commit: (rows, targetType, skipDuplicates = true) => request('/data/import/commit', {
    method: 'POST',
    body: JSON.stringify({ rows, targetType, skipDuplicates })
  })
};
