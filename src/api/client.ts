// API Client
// Currently proxied through Laravel backend via Vite dev server.
// To switch to Supabase directly:
//   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
//   2. Install @supabase/supabase-js
//   3. Replace the fetch-based client below with Supabase client calls

const API_BASE = '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      if (errorData.errors) {
        const firstField = Object.keys(errorData.errors)[0];
        errorMessage = errorData.errors[firstField][0] || errorData.message;
      } else {
        errorMessage = errorData.error || errorData.message || errorMessage;
      }
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: any) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) =>
    request(endpoint, { method: 'DELETE' }),
};

export { ApiError };
export const apiHelper = api;
