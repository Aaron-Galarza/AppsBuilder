/**
 * Cliente HTTP mínimo para todos los hooks.
 * API_URL configurable vía NEXT_PUBLIC_API_URL; default localhost:4000 (backend local).
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init?.headers ?? {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // respuesta sin JSON
  }

  if (!res.ok || !body?.success) {
    throw new Error(body?.error ?? `Error ${res.status} en ${path}`);
  }
  return body.data as T;
}

/** Adjunta el token JWT guardado (localStorage) a los pedidos admin */
export function authHeaders(token?: string | null): Record<string, string> {
  const t = token ?? localStorage.getItem('saas-auth-storage-token') ?? '';
  return t ? { Authorization: `Bearer ${t}` } : {};
}
