import AsyncStorage from '@react-native-async-storage/async-storage';

// Change to your machine's local IP when testing on a physical device
// e.g. 'http://192.168.1.x:8000'
export const API_BASE = 'http://localhost:8000';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

export async function setToken(token: string): Promise<void> {
  return AsyncStorage.setItem('access_token', token);
}

export async function clearToken(): Promise<void> {
  return AsyncStorage.removeItem('access_token');
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: string;
    token?: string | null;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {'Content-Type': 'application/json'};
  const token = options.token ?? (await getToken());
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body,
  });

  if (!res.ok) {
    if (res.status === 401) {
      const err = await res.json().catch(() => ({}));
      const code = typeof err.detail === 'object' ? err.detail?.code : undefined;
      if (code !== 'profile_not_synced') {
        // A real auth failure (invalid/expired/revoked token) — clear it so
        // the app falls back to sign-in instead of retrying forever.
        await clearToken();
      }
      // else: the Firebase session/token is still valid, the backend
      // profile just hasn't been created yet (e.g. mid-registration,
      // before /auth/sync has run) — leave the token alone, register()/
      // login() own that lifecycle.
      throw new Error('SESSION_EXPIRED');
    }
    const err = await res.json().catch(() => ({detail: res.statusText}));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
