// API Client
// Currently proxied through Laravel backend via Vite dev server.
// To switch to Supabase directly:
//   1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
//   2. Install @supabase/supabase-js
//   3. Replace the fetch-based client below with Supabase client calls

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildApiBase(): string {
  const explicitBase = import.meta.env.VITE_API_BASE_URL;
  if (explicitBase) return trimTrailingSlashes(explicitBase);

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const normalized = trimTrailingSlashes(apiUrl);
    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
  }

  return '/api';
}

function stringifyFallback(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractErrorMessage(errorData: any, fallback: string): string {
  if (!errorData || typeof errorData !== 'object') {
    return stringifyFallback(errorData) || fallback;
  }

  if (errorData.errors && typeof errorData.errors === 'object') {
    const firstField = Object.keys(errorData.errors)[0];
    const fieldError = errorData.errors[firstField];

    if (Array.isArray(fieldError) && fieldError.length > 0) {
      return stringifyFallback(fieldError[0]) || fallback;
    }

    return stringifyFallback(fieldError || errorData.message) || fallback;
  }

  return stringifyFallback(errorData.error || errorData.message) || fallback;
}

const API_BASE = buildApiBase();
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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

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
    let errorMessage = `Server error (${response.status})`;
    let errorData: any;
    try {
      errorData = await response.json();
      errorMessage = extractErrorMessage(errorData, errorMessage);
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
