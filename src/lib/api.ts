import type { ApiResponse } from './types';

const TOKEN_KEY = 'bookstore_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Lỗi server: ${response.status}`);
    }
    return { success: true, message: 'OK', data: null as T };
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `Lỗi: ${response.status}`);
  }

  return data;
}

export const api = {
  get<T>(url: string): Promise<ApiResponse<T>> {
    return request<T>(url);
  },

  post<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete<T>(url: string): Promise<ApiResponse<T>> {
    return request<T>(url, { method: 'DELETE' });
  },

  upload<T>(url: string, files: File[], fieldName = 'files'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file) => formData.append(fieldName, file));
    return request<T>(url, {
      method: 'POST',
      body: formData,
    });
  },
};
