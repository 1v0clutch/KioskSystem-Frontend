// API Client
// Currently proxied through Laravel backend via Vite dev server.
// To switch to Supabase directly:
//   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
//   2. Install @supabase/supabase-js
//   3. Replace the fetch-based client below with Supabase client calls

const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 15000;

class ApiError extends Error {
  status: number;
  payload?: any;
  constructor(message: string, status: number, payload?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers, signal: controller.signal });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection and try again.', 408);
    }
    throw err;
  }
  clearTimeout(timeoutId);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    let errorMessage = 'Request failed';
    let errorData: any;
    try {
      errorData = await response.json();
      if (errorData.errors) {
        const firstField = Object.keys(errorData.errors)[0];
        errorMessage = errorData.errors[firstField][0] || errorData.message;
      } else {
        errorMessage = errorData.error || errorData.message || errorMessage;
      }
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new ApiError(errorMessage, response.status, errorData);
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

export function revokeSession(token: string): void {
  fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => {
    // Fire-and-forget: token will expire server-side anyway.
  });
}

export { ApiError };
export const apiHelper = api;
