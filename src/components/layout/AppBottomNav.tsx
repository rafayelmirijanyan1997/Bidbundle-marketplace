"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useEffect, useState } from "react";

import { useNeighbourhoodSummary } from "@/hooks/useNeighbourhoodSummary";
import { getRole, type UserRole } from "@/utils/onboardingState";

interface AppBottomNavProps {
  orientation: "bottom" | "sidebar";
}

interface TabDefinition {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  badge?: number;
}

const tabsByRole: Record<UserRole, TabDefinition[]> = {
  homeowner: [
    { href: "/app/homeowner/dashboard", icon: HomeIcon, label: "Home" },
    { href: "/app/homeowner/chat", icon: ChatIcon, label: "Chat", badge: 3 },
    { href: "/app/homeowner/bids", icon: BidsIcon, label: "Bids" },
    { href: "/app/homeowner/profile", icon: ProfileIcon, label: "Profile" },
  ],
  provider: [
    { href: "/app/provider/dashboard", icon: HomeIcon, label: "Home" },
    { href: "/app/provider/job-feed", icon: JobFeedIcon, label: "Job Feed", badge: 5 },
    { href: "/app/provider/bids", icon: BidsIcon, label: "My Bids" },
    { href: "/app/provider/schedule", icon: ScheduleIcon, label: "Schedule" },
    { href: "/app/provider/messages", icon: MessagesIcon, label: "Messages", badge: 3 },
    { href: "/app/provider/reviews", icon: ReviewsIcon, label: "Reviews" },
    { href: "/app/provider/earnings", icon: EarningsIcon, label: "Earnings" },
    { href: "/app/provider/profile", icon: ProfileIcon, label: "Profile" },
  ],
  admin: [
    { href: "/app/admin/dashboard", icon: HomeIcon, label: "Home" },
    { href: "/app/admin/community", icon: CommunityIcon, label: "Community" },
    { href: "/app/admin/reports", icon: ReportsIcon, label: "Reports" },
    { href: "/app/admin/profile", icon: ProfileIcon, label: "Profile" },
  ],
};

const roleLabel: Record<UserRole, string> = {
  homeowner: "Homeowner",
  provider: "Service Provider",
  admin: "HOA Admin",
};

function roleFromPathname(pathname: string): UserRole | null {
  if (pathname.startsWith("/app/provider")) return "provider";
  if (pathname.startsWith("/app/admin")) return "admin";
  if (pathname.startsWith("/app/homeowner")) return "homeowner";
  return null;
}

export function AppBottomNav({ orientation }: AppBottomNavProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>("homeowner");
  const { user, otherMembers, neighbourhoodName, neighborCount, newThisWeek } = useNeighbourhoodSummary();

  useEffect(() => {
    const storedRole = getRole();
    const routeRole = roleFromPathname(pathname);
    setRole(routeRole ?? storedRole ?? "homeowner");
  }, [pathname]);

  const tabs = tabsByRole[role];

  /* ── Desktop sidebar ── */
  if (orientation === "sidebar") {
    return (
      <aside
        className="fixed inset-y-0 left-0 z-30 flex flex-col"
        style={{
          width: 240,
          background: "var(--bg-sidebar)",
          borderRight: "1px solid #1c1209",
          color: "#E8DFCF",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5"
          style={{
            padding: "8px 10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: "-0.01em",
            color: "#FBF7F1",
          }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "linear-gradient(135deg, var(--terracotta-500), var(--terracotta-600))",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              B
            </div>
            <span style={{ color: "#FBF7F1", fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>
              BidBundle
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col" style={{ padding: "14px 14px 0", gap: 2 }}>
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/app/provider/dashboard"
                ? pathname === "/app/provider" || pathname === "/app/provider/dashboard"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex items-center"
                style={{
                  gap: 12,
                  padding: "9px 12px",
                  borderRadius: 10,
                  color: isActive ? "#FBF7F1" : "#C9C0AE",
                  background: isActive ? "rgba(194,85,43,0.18)" : "transparent",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      background: "var(--terracotta-400)",
                    }}
                  />
                )}
                <Icon style={{ width: 18, height: 18, flexShrink: 0, color: isActive ? "var(--terracotta-400)" : "currentColor" }} />
                <span style={{ flex: 1 }}>{tab.label}</span>
                {tab.badge ? (
                  <span
                    style={{
                      height: 18,
                      minWidth: 18,
                      padding: "0 6px",
                      borderRadius: 999,
                      background: "var(--terracotta-600)",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          {/* Neighborhood card — homeowner only */}
          {role === "homeowner" && (
            <>
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#8C8273",
                  padding: "14px 12px 6px",
                  fontWeight: 600,
                }}
              >
                Your neighborhood
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  margin: "0 0 4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#E8DFCF",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>
                  </svg>
                  {neighbourhoodName}
                </div>
                <div style={{ color: "#8C8273", fontSize: 11, marginTop: 4 }}>
                  {neighborCount} neighbor{neighborCount !== 1 ? "s" : ""} · {newThisWeek} new this week
                </div>
                <div style={{ marginTop: 10, display: "flex" }}>
                  {otherMembers.slice(0, 4).map((member, i) => (
                    <div
                      key={member.user_id}
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: (["#E08758","#7A9A7E","#D6A23E","#B07AA0"] as string[])[i % 4], border: "2px solid #221C16",
                        marginLeft: i === 0 ? 0 : -6, fontSize: 10, color: "white",
                        display: "grid", placeItems: "center", fontWeight: 600,
                      }}
                    >
                      {member.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  ))}
                  {otherMembers.length > 4 ? (
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "#3D362B", border: "2px solid #221C16",
                        marginLeft: -6, fontSize: 9, color: "#E8DFCF",
                        display: "grid", placeItems: "center", fontWeight: 600,
                      }}
                    >
                      +{otherMembers.length - 4}
                    </div>
                  ) : null}
                  {otherMembers.length === 0 ? (
                    <div style={{ color: "#8C8273", fontSize: 11 }}>No nearby neighbors yet</div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px" }}>
          {/* User card */}
          <div
            className="flex items-center"
            style={{ gap: 10, padding: 10, borderRadius: 12, background: "rgba(255,255,255,0.04)" }}
          >
            <div
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--terracotta-400), var(--plum-600))",
                display: "grid", placeItems: "center",
                color: "white", fontWeight: 600, fontSize: 13,
                flexShrink: 0,
              }}
            >
              {(user?.full_name ?? "User").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
              <div style={{ color: "#FBF7F1", fontSize: 13, fontWeight: 600 }}>{user?.full_name ?? "Account"}</div>
              <div style={{ color: "#8C8273", fontSize: 11 }}>
                {role === "homeowner" ? "Homeowner · HOA verified" : roleLabel[role]}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  /* ── Mobile floating pill nav ── */
  return (
    <nav
      aria-label="Application navigation"
      className="fixed bottom-3 left-3 right-3 z-50 flex h-[62px] items-center rounded-2xl border border-divider bg-card/90 shadow-float backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/app/provider/dashboard"
            ? pathname === "/app/provider" || pathname === "/app/provider/dashboard"
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200"
          >
            <span
              className={`flex h-8 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-surface text-white shadow-sm"
                  : "text-muted"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span
              className={`text-[10px] font-semibold transition-colors duration-200 ${
                isActive ? "text-surface" : "text-muted/70"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Icon helpers ── */
function IconFrame({
  children,
  className,
  viewBox = "0 0 24 24",
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode; viewBox?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox={viewBox}
      {...props}
    >
      {children}
    </svg>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.75V20h11V9.75" />
      <path d="M10 20v-5.5h4V20" />
    </IconFrame>
  );
}
function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M6 6.5h12A1.5 1.5 0 0 1 19.5 8v7A1.5 1.5 0 0 1 18 16.5H10l-4 2v-2H6A1.5 1.5 0 0 1 4.5 15V8A1.5 1.5 0 0 1 6 6.5Z" />
    </IconFrame>
  );
}
function BidsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x="6" y="4.5" width="12" height="15" rx="2" />
      <path d="M9 9h6M9 12.25h6M9 15.5h4.5" />
    </IconFrame>
  );
}
function JobFeedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v4M10 14h4" />
    </IconFrame>
  );
}
function ScheduleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </IconFrame>
  );
}
function MessagesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M4 4h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
      <path d="M4 12h4l2 3h4l2-3h4" />
    </IconFrame>
  );
}
function EarningsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </IconFrame>
  );
}
function ReviewsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="m12 4.75 2.08 4.22 4.66.68-3.37 3.28.8 4.63L12 15.37 7.83 17.56l.8-4.63-3.37-3.28 4.66-.68L12 4.75Z" />
    </IconFrame>
  );
}
function CommunityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="15.5" cy="8" r="2.5" />
      <path d="M3.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M15 14.5a5.5 5.5 0 0 1 5.5 4.5" />
    </IconFrame>
  );
}
function ReportsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <path d="M5 19.5h14" />
      <rect x="6.25" y="12.5" width="2.75" height="5" rx="0.5" />
      <rect x="10.625" y="9.5" width="2.75" height="8" rx="0.5" />
      <rect x="15" y="6.5" width="2.75" height="11" rx="0.5" />
    </IconFrame>
  );
}
function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
    </IconFrame>
  );
}
