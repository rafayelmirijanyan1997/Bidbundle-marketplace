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

type FirebaseUser = Awaited<ReturnType<typeof signInWithEmailAndPassword>>['user'];

/**
 * Shared shape of every auth flow: obtain a Firebase credential, store its
 * ID token, sync the resulting profile with the backend, then fetch it.
 */
async function completeFirebaseAuth(
  credential: Promise<{user: FirebaseUser}>,
  syncPath: string,
  buildSyncBody: (fbUser: FirebaseUser) => Record<string, unknown>,
  options: {silentSync?: boolean} = {},
): Promise<User> {
  const {user: fbUser} = await credential;
  const token = await getIdToken(fbUser);
  await setToken(token);

  const sync = apiFetch(syncPath, {
    method: 'POST',
    token,
    body: JSON.stringify(buildSyncBody(fbUser)),
  });
  if (options.silentSync) {
    await sync.catch(() => {});
  } else {
    await sync;
  }

  return fetchMe(token);
}

export async function login(email: string, password: string): Promise<User> {
  return completeFirebaseAuth(
    signInWithEmailAndPassword(getAuth(), email, password),
    '/auth/sync',
    fbUser => ({role: 'homeowner', full_name: fbUser.email ?? ''}),
    {silentSync: true},
  );
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
  return completeFirebaseAuth(
    createUserWithEmailAndPassword(getAuth(), params.email, params.password),
    '/auth/sync',
    () => ({
      role: params.role,
      full_name: params.full_name,
      latitude: params.latitude,
      longitude: params.longitude,
      service_interests: params.service_interests,
    }),
  );
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
  return completeFirebaseAuth(
    createUserWithEmailAndPassword(getAuth(), params.email, params.password),
    '/auth/register-hoa',
    () => ({
      email: params.email,
      full_name: params.full_name,
      community_name: params.community_name,
      community_type: params.community_type,
      community_address: params.community_address,
      unit_count: params.unit_count,
    }),
  );
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
  return completeFirebaseAuth(
    createUserWithEmailAndPassword(getAuth(), params.email, params.password),
    '/auth/accept-invite',
    () => ({
      invite_code: params.invite_code,
      email: params.email,
      full_name: params.full_name,
      unit_number: params.unit_number,
      service_interests: params.service_interests,
    }),
  );
}

export async function fetchMe(token?: string): Promise<User> {
  return apiFetch<User>('/users/me', token ? {token} : {});
}

export async function logout(): Promise<void> {
  await signOut(getAuth());
  await clearToken();
}
