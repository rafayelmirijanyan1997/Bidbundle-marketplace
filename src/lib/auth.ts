import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";

import { apiFetch } from "./api";
import { auth } from "./firebase";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: "homeowner" | "provider" | "admin";
  neighborhood: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  neighbourhood_id?: number | null;
  is_verified: boolean;
}

const TOKEN_KEY = "neighbid.token";

/* ── Token storage ── */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("neighbid.role");
}

/**
 * Shared shape of every auth flow: obtain a Firebase credential, store its
 * ID token, sync the resulting profile with the backend, then return the
 * token for the caller to fetch the full profile with.
 */
async function completeFirebaseAuth(
  credential: Promise<UserCredential>,
  buildSyncBody: (user: FirebaseUser) => Record<string, unknown>,
  options: { silentSync?: boolean } = {}
): Promise<string> {
  const cred = await credential;
  const token = await cred.user.getIdToken();
  setToken(token);

  const sync = apiFetch("/auth/sync", {
    method: "POST",
    token,
    body: JSON.stringify(buildSyncBody(cred.user)),
  });
  if (options.silentSync) {
    await sync.catch(() => {});
  } else {
    await sync;
  }

  return token;
}

/* ── Auth calls ── */
export async function register(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: string;
  latitude?: number;
  longitude?: number;
}): Promise<string> {
  return completeFirebaseAuth(
    createUserWithEmailAndPassword(auth, payload.email, payload.password),
    () => ({
      role: payload.role,
      full_name: payload.full_name,
      phone: payload.phone,
      latitude: payload.latitude,
      longitude: payload.longitude,
    })
  );
}

export async function login(email: string, password: string): Promise<string> {
  return completeFirebaseAuth(
    signInWithEmailAndPassword(auth, email, password),
    (user) => ({ role: "homeowner", full_name: user.email ?? "" }),
    { silentSync: true }
  );
}

export async function loginWithGoogle(): Promise<string> {
  return completeFirebaseAuth(
    signInWithPopup(auth, new GoogleAuthProvider()),
    (user) => ({ role: "homeowner", full_name: user.displayName ?? user.email ?? "" }),
    { silentSync: true }
  );
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/users/me", { token });
}

export async function logout(): Promise<void> {
  await signOut(auth);
  clearAuth();
  if (typeof window !== "undefined") window.location.href = "/";
}
