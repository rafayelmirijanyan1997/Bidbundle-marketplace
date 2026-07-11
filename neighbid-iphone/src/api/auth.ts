import {
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {apiFetch, setToken, clearToken} from './client';

export type Role = 'homeowner' | 'provider' | 'admin' | 'hoa_homeowner';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  neighbourhood_id: number | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  community_id: number | null;
  unit_number: string | null;
}

export async function login(email: string, password: string): Promise<User> {
  const {user: fbUser} = await signInWithEmailAndPassword(getAuth(), email, password);
  const token = await getIdToken(fbUser);
  await setToken(token);
  await apiFetch('/auth/sync', {
    method: 'POST',
    token,
    body: JSON.stringify({role: 'homeowner', full_name: fbUser.email ?? ''}),
  }).catch(() => {});
  return fetchMe(token);
}

export async function register(params: {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  latitude?: number;
  longitude?: number;
  service_interests?: string;
}): Promise<User> {
  const {user: fbUser} = await createUserWithEmailAndPassword(getAuth(), params.email, params.password);
  const token = await getIdToken(fbUser);
  await setToken(token);
  await apiFetch('/auth/sync', {
    method: 'POST',
    token,
    body: JSON.stringify({
      role: params.role,
      full_name: params.full_name,
      latitude: params.latitude,
      longitude: params.longitude,
      service_interests: params.service_interests,
    }),
  });
  return fetchMe(token);
}

export async function registerHoa(params: {
  email: string;
  password: string;
  full_name: string;
  community_name: string;
  community_type: string;
  community_address: string;
  unit_count?: number;
}): Promise<User> {
  const {user: fbUser} = await createUserWithEmailAndPassword(getAuth(), params.email, params.password);
  const token = await getIdToken(fbUser);
  await setToken(token);
  await apiFetch('/auth/register-hoa', {
    method: 'POST',
    token,
    body: JSON.stringify({
      email: params.email,
      full_name: params.full_name,
      community_name: params.community_name,
      community_type: params.community_type,
      community_address: params.community_address,
      unit_count: params.unit_count,
    }),
  });
  return fetchMe(token);
}

export async function validateInvite(code: string): Promise<{
  community_name: string;
  community_type: string | null;
  unit_number: string | null;
  invite_id: number;
}> {
  return apiFetch('/auth/validate-invite', {
    method: 'POST',
    body: JSON.stringify({code}),
  });
}

export async function acceptInvite(params: {
  invite_code: string;
  email: string;
  password: string;
  full_name: string;
  unit_number?: string;
  service_interests?: string;
}): Promise<User> {
  const {user: fbUser} = await createUserWithEmailAndPassword(getAuth(), params.email, params.password);
  const token = await getIdToken(fbUser);
  await setToken(token);
  await apiFetch('/auth/accept-invite', {
    method: 'POST',
    token,
    body: JSON.stringify({
      invite_code: params.invite_code,
      email: params.email,
      full_name: params.full_name,
      unit_number: params.unit_number,
      service_interests: params.service_interests,
    }),
  });
  return fetchMe(token);
}

export async function fetchMe(token?: string): Promise<User> {
  return apiFetch<User>('/users/me', token ? {token} : {});
}

export async function logout(): Promise<void> {
  await signOut(getAuth());
  await clearToken();
}
