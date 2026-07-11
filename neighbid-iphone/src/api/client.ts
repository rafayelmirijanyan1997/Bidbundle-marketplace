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
      // Don't clear the token here: a 401 can legitimately happen mid-signup
      // (backend profile not created yet) while the Firebase session/token
      // is still perfectly valid. Firebase's own auth state (via
      // onIdTokenChanged) is the source of truth for sign-in status —
      // explicit sign-out (logout()) is what clears the token.
      throw new Error('SESSION_EXPIRED');
    }
    const err = await res.json().catch(() => ({detail: res.statusText}));
    throw new Error(err.detail ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
