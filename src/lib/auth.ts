import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
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
  const cred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  const token = await cred.user.getIdToken();
  setToken(token);
  await apiFetch("/auth/sync", {
    method: "POST",
    token,
    body: JSON.stringify({
      role: payload.role,
      full_name: payload.full_name,
      phone: payload.phone,
      latitude: payload.latitude,
      longitude: payload.longitude,
    }),
  });
  return token;
}

export async function login(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const token = await cred.user.getIdToken();
  setToken(token);
  await apiFetch("/auth/sync", {
    method: "POST",
    token,
    body: JSON.stringify({ role: "homeowner", full_name: cred.user.email ?? "" }),
  }).catch(() => {});
  return token;
}

export async function loginWithGoogle(): Promise<string> {
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  const token = await cred.user.getIdToken();
  setToken(token);
  await apiFetch("/auth/sync", {
    method: "POST",
    token,
    body: JSON.stringify({
      role: "homeowner",
      full_name: cred.user.displayName ?? cred.user.email ?? "",
    }),
  }).catch(() => {});
  return token;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/users/me", { token });
}

export async function logout(): Promise<void> {
  await signOut(auth);
  clearAuth();
  if (typeof window !== "undefined") window.location.href = "/";
}
