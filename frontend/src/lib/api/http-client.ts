import type { ApiErrorResponse } from '@/types/api';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api/v1';

export class ApiClientError extends Error {
  statusCode: number;
  details?: string | string[];

  constructor(message: string, statusCode: number, details?: string | string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Server-only fetch wrapper to call the NestJS backend from Next.js Route Handlers.
 */
export async function backendFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: ApiErrorResponse | null; status: number }> {
  const url = `${BACKEND_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });

    if (response.status === 204) {
      return { data: null, error: null, status: 204 };
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        statusCode: response.status,
        message: (body && typeof body === 'object' && 'message' in body)
          ? body.message
          : (typeof body === 'string' && body ? body : response.statusText || 'Backend request failed'),
        timestamp: new Date().toISOString(),
      };
      return { data: null, error: errorResponse, status: response.status };
    }

    return { data: body as T, error: null, status: response.status };
  } catch (err) {
    const errorResponse: ApiErrorResponse = {
      statusCode: 503,
      message: 'Backend service is unreachable. Ensure the NestJS server is running.',
      timestamp: new Date().toISOString(),
    };
    return { data: null, error: errorResponse, status: 503 };
  }
}

/**
 * Client-side fetch wrapper for React components calling Next.js Route Handlers (/api/*).
 */
export async function clientFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('/') ? path : `/${path}`;

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (body && typeof body === 'object' && 'message' in body)
      ? (Array.isArray(body.message) ? body.message.join(', ') : body.message)
      : (typeof body === 'string' && body ? body : `Request failed with status ${response.status}`);
    
    throw new ApiClientError(message, response.status, body?.message);
  }

  return body as T;
}

