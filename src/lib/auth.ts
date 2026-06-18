import { apiFetch } from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "neighbid.token";

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

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

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
}): Promise<AuthTokens> {
  return apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? "Login failed");
  }
  return res.json() as Promise<AuthTokens>;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/users/me", { token });
}

export function logout(): void {
  clearAuth();
  if (typeof window !== "undefined") window.location.href = "/";
}
