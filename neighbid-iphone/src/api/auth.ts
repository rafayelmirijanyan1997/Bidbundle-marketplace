import {supabase} from './supabase';
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
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if (error || !data.session) throw new Error(error?.message ?? 'Sign in failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify({role: 'homeowner', full_name: data.user?.email ?? ''}),
  }).catch(() => {});
  return fetchMe();
}

export async function register(params: {
  email: string;
  password: string;
  full_name: string;
  role: Role;
  latitude?: number;
  longitude?: number;
}): Promise<User> {
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify({
      role: params.role,
      full_name: params.full_name,
      latitude: params.latitude,
      longitude: params.longitude,
    }),
  });
  return fetchMe();
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
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/register-hoa', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      full_name: params.full_name,
      community_name: params.community_name,
      community_type: params.community_type,
      community_address: params.community_address,
      unit_count: params.unit_count,
    }),
  });
  return fetchMe();
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
}): Promise<User> {
  const {data, error} = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
  });
  if (error || !data.session) throw new Error(error?.message ?? 'Registration failed');
  await setToken(data.session.access_token);
  await apiFetch('/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify({
      invite_code: params.invite_code,
      email: params.email,
      full_name: params.full_name,
      unit_number: params.unit_number,
    }),
  });
  return fetchMe();
}

export async function fetchMe(): Promise<User> {
  return apiFetch<User>('/users/me');
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}
