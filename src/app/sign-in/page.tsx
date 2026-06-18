"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clearAuth, fetchMe, login, setToken } from "@/lib/auth";
import { saveRole, type UserRole } from "@/utils/onboardingState";

const destinationByRole: Record<UserRole, string> = {
  homeowner: "/app/homeowner/dashboard",
  provider: "/app/provider/dashboard",
  admin: "/app/admin/dashboard",
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.63 4.63 0 0 1-2 3.04v2.53h3.24c1.9-1.75 2.97-4.33 2.97-7.31Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.46l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.75-5.6-4.1H3.06v2.6A10 10 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.4 13.87A5.98 5.98 0 0 1 6.09 12c0-.65.11-1.27.31-1.87v-2.6H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.47l3.34-2.6Z"/>
      <path fill="#EA4335" d="M12 6.03c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 3.04 14.7 2 12 2a10 10 0 0 0-8.94 5.53l3.34 2.6c.79-2.35 3-4.1 5.6-4.1Z"/>
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("homeowner");

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && !submitting;

  const handleSignIn = async () => {
    setSubmitting(true);
    setAuthError(null);
    try {
      const tokens = await login(email, password);
      setToken(tokens.access_token);
      const me = await fetchMe(tokens.access_token);
      if (me.role !== role) {
        clearAuth();
        setAuthError(`This account is registered as ${me.role}. Sign in using the ${me.role} option.`);
        setSubmitting(false);
        return;
      }
      saveRole(me.role as UserRole);
      router.push(destinationByRole[me.role as UserRole]);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Sign in failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthShowcase
        testimonial={{
          quote: "As a plumber, BidBundle sends me bundled jobs from the same neighborhood. Less driving, better margins.",
          name: "James Kowalski",
          location: "Service Provider",
          initials: "JK",
        }}
      />

      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8"
        style={{ background: "linear-gradient(180deg, #FBF7F1 0%, #F5EFE5 100%)" }}
      >
        <div
          className="pointer-events-none absolute right-[-8%] top-[12%] h-[260px] w-[260px] rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, rgba(224,135,88,0.16) 0%, transparent 68%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-[10%] left-[-6%] h-[220px] w-[220px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(122,154,126,0.14) 0%, transparent 68%)" }}
        />
        <div
          className="relative w-full max-w-xl rounded-[32px] border bg-white/88 p-8 backdrop-blur-sm sm:p-10"
          style={{
            borderColor: "var(--border-warm)",
            boxShadow: "0 24px 60px rgba(31,26,20,0.10), 0 4px 12px rgba(31,26,20,0.05)",
          }}
        >
          <header className="pb-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-400)]">Welcome back</p>
            <h1 className="mt-2 font-display text-[2.4rem] font-bold italic tracking-tight text-[var(--ink-900)]">
              Sign in
            </h1>
            <p className="mt-2 max-w-sm text-[14px] leading-6 text-[var(--ink-500)]">
              Access your neighborhood dashboard and live bids.
            </p>
          </header>

          <div className="space-y-4">
            <Input
              autoComplete="email"
              label="Email"
              placeholder="lance@email.com"
              type="email"
              variant="warm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              autoComplete="current-password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              variant="warm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="rounded-[24px] border bg-[var(--cream-50)] p-4" style={{ borderColor: "var(--border-warm)" }}>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-500)]">Continue as</label>
                <span className="text-[12px] text-[var(--ink-400)]">Role must match your account</span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-[20px] bg-white p-1.5" style={{ border: "1px solid var(--border-warm)" }}>
                {([
                  { value: "homeowner", label: "Homeowner" },
                  { value: "provider", label: "Provider" },
                  { value: "admin", label: "Admin" },
                ] as { value: UserRole; label: string }[]).map((option) => {
                  const active = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`rounded-2xl px-3 py-2.5 text-[12px] font-semibold transition ${
                        active
                          ? "bg-[var(--terracotta-600)] text-white shadow-[0_1px_0_rgba(0,0,0,0.05),inset_0_-2px_0_rgba(0,0,0,0.08)]"
                          : "text-[var(--ink-500)] hover:bg-[var(--cream-50)] hover:text-[var(--ink-900)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Button className="h-12 w-full rounded-full text-[14px] font-semibold" disabled={!canSubmit} onClick={handleSignIn} variant="warm">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
            {authError ? (
              <p style={{ color: "var(--danger-600)", fontSize: 13, textAlign: "center" }}>{authError}</p>
            ) : null}
            <Link href="/get-started" className="block text-center text-[12px] font-medium text-[var(--ink-500)] underline decoration-[var(--border-warm-strong)] underline-offset-2">
              Need an account? Create one
            </Link>
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border-warm)]" />
            <span className="text-[12px] text-[var(--ink-400)]">or</span>
            <span className="h-px flex-1 bg-[var(--border-warm)]" />
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border bg-white text-[13px] font-medium text-[var(--ink-900)] transition-all hover:bg-[var(--cream-50)] active:scale-[0.98]"
            style={{ borderColor: "var(--border-warm-strong)" }}
            type="button"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-[11px] leading-5 text-[var(--ink-400)]">
            By continuing, you agree to our{" "}
            <span className="text-[var(--ink-900)] underline decoration-[var(--border-warm-strong)] underline-offset-2">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-[var(--ink-900)] underline decoration-[var(--border-warm-strong)] underline-offset-2">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
