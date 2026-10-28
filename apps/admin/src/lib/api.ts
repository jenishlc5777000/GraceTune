import { useSession } from '../store/session';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';
export const WEB_URL = import.meta.env.VITE_WEB_URL ?? 'http://localhost:5173';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** JSON fetch with the admin's bearer token; signs out on 401. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useSession.getState().token;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK', `Can't reach the API at ${API_URL}. Is it running?`);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) useSession.getState().signOut();
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'UNKNOWN',
      body?.error?.message ?? `Request failed (${res.status})`,
    );
  }
  return body as T;
}
