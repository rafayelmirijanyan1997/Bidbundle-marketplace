"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useHomeownerDashboard } from "@/hooks/useHomeownerDashboard";
import { useHomeownerRequests } from "@/hooks/useHomeownerRequests";
import { useNeighbourhoodRequests } from "@/hooks/useNeighbourhoodRequests";
import { useNeighbourhoodSummary } from "@/hooks/useNeighbourhoodSummary";
import { useNotifications } from "@/hooks/useNotifications";

/* ── Inline SVG helpers ── */
function IconClock() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
}
function IconArrowR() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
}
function IconPlus() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconBell() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
}
function IconSpark() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>;
}
function IconWrench() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>;
}
function IconLeaf() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>;
}
function IconBroom() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>;
}

export default function HomeownerDashboard() {
  const { dashboard, user, loading } = useHomeownerDashboard();
  const { requests, refresh: refreshRequests } = useHomeownerRequests();
  const { requests: nbRequests, loading: nbRequestsLoading } = useNeighbourhoodRequests();
  const { notifications, markRead, dismiss } = useNotifications();
  const { otherMembers, neighbourhoodName, neighborCount } = useNeighbourhoodSummary();

  // Re-fetch requests when user navigates back (tab focus or visibility change)
  useEffect(() => {
    const onFocus = () => refreshRequests();
    const onVisibility = () => { if (!document.hidden) refreshRequests(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshRequests]);
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  // Refresh both dashboard stats and requests when tab regains focus
  // (already handled inside useHomeownerDashboard, but requests need it too)
  const openRequests = requests.filter((r) => ["draft", "live", "grouping"].includes(r.status));
  const neighbourhoodOpportunities = nbRequests.filter((request) => !request.is_mine);
  const liveRequest = openRequests.find((r) => r.status === "live") ?? openRequests[0] ?? null;
  const ownRecommendedRequest = openRequests
    .filter((request) => request.bid_count > 0)
    .sort((a, b) => {
      const bestBidA = a.best_bid_cents ?? Number.POSITIVE_INFINITY;
      const bestBidB = b.best_bid_cents ?? Number.POSITIVE_INFINITY;
      if (bestBidA !== bestBidB) return bestBidA - bestBidB;
      return b.bid_count - a.bid_count;
    })[0] ?? null;
  const neighbourhoodRecommendedRequest = nbRequests
    .filter((request) => request.bid_count > 0)
    .sort((a, b) => b.bid_count - a.bid_count)[0] ?? null;
  const recommendationTarget = ownRecommendedRequest ?? neighbourhoodRecommendedRequest;
  const hasRecommendation = recommendationTarget !== null;
  const recommendationSavings =
    ownRecommendedRequest && ownRecommendedRequest.best_bid_cents !== null
      ? Math.max(0, ownRecommendedRequest.budget_min - ownRecommendedRequest.best_bid_cents)
      : 0;
  const neighbourhoodPulse = [
    ...otherMembers.slice(0, 2).map((member) => ({
      key: `member-${member.user_id}`,
      who: member.full_name,
      initials: member.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
      avColor: "linear-gradient(135deg,#E08758,#C2552B)",
      what: "joined your neighbourhood",
      highlight: neighbourhoodName,
      when: new Date(member.joined_at).toLocaleDateString([], { month: "short", day: "numeric" }),
    })),
    ...nbRequests.filter((request) => !request.is_mine).slice(0, 2).map((request) => ({
      key: `request-${request.id}`,
      who: request.owner_name,
      initials: request.owner_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
      avColor: "linear-gradient(135deg,#6F8DB8,#3F608E)",
      what: "posted a new",
      highlight: `${request.category} request`,
      when: "New",
    })),
  ].slice(0, 3);

  function categoryIcon(category: string) {
    const c = category.toLowerCase();
    if (c === "lawn" || c.includes("landscap") || c.includes("garden")) return <IconLeaf />;
    if (c === "cleaning" || c === "gutter" || c === "handyman") return <IconBroom />;
    return <IconWrench />;
  }

  function categoryColor(category: string, idx: number): string {
    const c = category.toLowerCase();
    if (c === "plumbing" || c === "hvac" || c === "electrical" || c === "roofing") return "linear-gradient(135deg,#6F8DB8,#3F608E)";
    if (c === "lawn" || c.includes("landscap")) return "linear-gradient(135deg,#7A9A7E,#4A6A4D)";
    if (c === "gutter" || c === "handyman") return "linear-gradient(135deg,#D6A23E,#B8862B)";
    if (c === "cleaning") return "linear-gradient(135deg,#B07AA0,#7A4A6E)";
    const fallbacks = ["linear-gradient(135deg,#6F8DB8,#3F608E)","linear-gradient(135deg,#7A9A7E,#4A6A4D)","linear-gradient(135deg,#D6A23E,#B8862B)"];
    return fallbacks[idx % fallbacks.length];
  }

  function statusChip(status: string): { bg: string; color: string } {
    switch (status.toLowerCase()) {
      case "live":     return { bg: "var(--terracotta-50)",  color: "var(--terracotta-600)" };
      case "bidding":  return { bg: "var(--terracotta-50)",  color: "var(--terracotta-600)" };
      case "grouping": return { bg: "var(--sage-50)",        color: "var(--sage-700)"       };
      case "pending_approval": return { bg: "var(--gold-50)", color: "var(--gold-600)"      };
      case "draft":    return { bg: "var(--cream-200)",      color: "var(--ink-700)"        };
      default:         return { bg: "var(--cream-200)",      color: "var(--ink-400)"        };
    }
  }

  if (loading) {
    return (
      <div
        style={{
          background: "var(--bg-app)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--ink-400)", fontSize: 14 }}>Loading dashboard…</div>
      </div>
    );
  }



  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      {/* Topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "28px 36px 20px",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "-0.02em",
              margin: "0 0 4px",
              color: "var(--ink-900)",
            }}
          >
            Good morning, {firstName}
          </h1>
          <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>
            Tuesday, April 28 · You have{" "}
            <strong style={{ color: "var(--terracotta-600)" }}>
              {dashboard?.active_bids ?? 0} bid
              {(dashboard?.active_bids ?? 0) !== 1 ? "s" : ""} awaiting your call
            </strong>{" "}
            and {dashboard?.active_requests ?? 0} active request
            {(dashboard?.active_requests ?? 0) !== 1 ? "s" : ""}.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 38, padding: "0 16px", borderRadius: 999,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: "transparent", color: "var(--ink-700)",
              border: "1px solid var(--border-warm-strong)",
              fontFamily: "var(--font-body)",
            }}
          >
            <IconBell /> {notifications.length > 0 ? notifications.length : ""}
          </button>
          <Link
            href="/app/homeowner/request"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              height: 38, padding: "0 16px", borderRadius: 999,
              fontSize: 14, fontWeight: 600,
              background: "var(--terracotta-600)", color: "white",
              boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
              textDecoration: "none",
            }}
          >
            <IconPlus /> New request
          </Link>
        </div>
      </div>

      {notifications.length > 0 && (
        <div style={{ padding: "0 36px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 14,
                alignItems: "center",
                background: "var(--sage-50)",
                border: "1px solid var(--border-warm)",
                borderRadius: 14,
                padding: "14px 18px",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sage-100)", display: "grid", placeItems: "center" }}>
                <IconBell />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 2 }}>{n.body}</div>
              </div>
              {n.action_url && (
                <Link
                  href={n.action_url}
                  onClick={() => void markRead(n.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "var(--terracotta-600)", color: "white", textDecoration: "none" }}
                >
                  Join group →
                </Link>
              )}
              <button
                onClick={() => void dismiss(n.id)}
                style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18, color: "var(--ink-400)", lineHeight: 1, padding: 4 }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scroll content */}
      <div style={{ padding: "0 36px 36px" }}>
        {/* Hero — live bidding */}
        <div
          style={{
            background: "linear-gradient(135deg, #2D261D 0%, #1F1A14 60%, #3D2A1F 100%)",
            borderRadius: 22,
            padding: "26px 28px",
            color: "#FBF7F1",
            position: "relative",
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              position: "absolute", right: -40, top: -40,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(224,135,88,0.25), transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 24, padding: "0 10px", borderRadius: 999,
                background: "rgba(224,135,88,0.2)", color: "#F7DDCB",
                fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#E08758", display: "inline-block", boxShadow: "0 0 0 4px rgba(224,135,88,0.25)" }} />
              Live bidding
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#B5AC9C" }}>
              <IconClock /> Closes in 32h 18m
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 24, alignItems: "flex-end" }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500,
                  letterSpacing: "-0.02em", lineHeight: 1.15,
                }}
              >
                {liveRequest?.title ?? nbRequests[0]?.title ?? "No active groups yet"}
              </div>
              <div style={{ color: "#B5AC9C", fontSize: 14, marginTop: 6 }}>
                {liveRequest
                  ? `${liveRequest.bid_count} bid${liveRequest.bid_count !== 1 ? "s" : ""} in · ${liveRequest.neighborhood}`
                  : nbRequests[0]
                    ? `${nbRequests[0].bid_count} bid${nbRequests[0].bid_count !== 1 ? "s" : ""} in · ${nbRequests[0].neighborhood} · by ${nbRequests[0].owner_name}`
                    : "Post a request to start receiving bids"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", color: "#8C8273", fontWeight: 600 }}>Best bid</div>
              <div
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 500,
                  fontSize: 38, lineHeight: 1, color: "#FBF7F1", marginTop: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                {liveRequest?.best_bid_cents
                  ? `$${Math.round(liveRequest.best_bid_cents / 100).toLocaleString()}`
                  : "—"}
              </div>
              {liveRequest?.best_bid_cents && liveRequest.best_bid_cents < liveRequest.budget_min ? (
                <div style={{ fontSize: 12, color: "var(--sage-500)", fontWeight: 600, marginTop: 2 }}>
                  −${Math.round((liveRequest.budget_min - liveRequest.best_bid_cents) / 100)} vs solo
                </div>
              ) : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/app/homeowner/bids"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 38, padding: "0 16px", borderRadius: 999,
                  fontSize: 14, fontWeight: 600,
                  background: "var(--terracotta-600)", color: "white",
                  textDecoration: "none",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
                }}
              >
                Review bids <IconArrowR />
              </Link>
              <Link
                href="/app/homeowner/chat"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  height: 38, padding: "0 16px", borderRadius: 999,
                  fontSize: 14, fontWeight: 600,
                  background: "rgba(255,255,255,0.08)", color: "#FBF7F1",
                  textDecoration: "none",
                }}
              >
                <IconSpark /> Ask AI
              </Link>
            </div>
          </div>
        </div>

        {/* Two-column overview */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Active requests card */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-warm)",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-sm)",
              }}
            >
              <div
                style={{
                  padding: "20px 24px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500,
                      color: "var(--ink-900)",
                    }}
                  >
                    Active requests
                  </div>
                  <div style={{ color: "var(--ink-500)", fontSize: 13, marginTop: 2 }}>
                    {openRequests.length > 0
                      ? `${openRequests.length} open · group bidding to lower prices`
                      : nbRequestsLoading
                        ? "Checking nearby neighbourhood groups…"
                        : neighbourhoodOpportunities.length > 0
                          ? `${neighbourhoodOpportunities.length} active in your neighbourhood — join a group`
                        : "No active requests yet"}
                  </div>
                </div>
                <Link
                  href="/app/homeowner/bids"
                  style={{ color: "var(--terracotta-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                >
                  View all →
                </Link>
              </div>
              <div style={{ height: 1, background: "var(--border-warm)" }} />

              {/* Request rows — own requests, or neighbourhood requests when user has none */}
              {openRequests.length === 0 && nbRequestsLoading ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>
                  Checking nearby neighbourhood bids…
                </div>
              ) : openRequests.length === 0 && neighbourhoodOpportunities.length > 0 ? (
                // Show neighbourhood group opportunities
                neighbourhoodOpportunities.slice(0, 5).map((r, i) => {
                  const chip = statusChip(r.group_status ?? r.status);
                  const activityLabel =
                    r.group_status === "bidding"
                      ? "Bids live"
                      : r.group_status === "pending_approval"
                        ? "Pending approval"
                        : "Join group";
                  return (
                    <div key={r.id} style={{ padding: "14px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 14, alignItems: "center", borderBottom: i < Math.min(neighbourhoodOpportunities.length, 5) - 1 ? "1px solid var(--border-warm)" : 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: categoryColor(r.category, i), display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                        {categoryIcon(r.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                          {r.neighborhood} · by {r.owner_name} · {r.bid_count} bid{r.bid_count !== 1 ? "s" : ""}{r.group_status ? ` · ${r.group_status.replace("_", " ")}` : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--ink-700)" }}>
                        ${Math.round(r.budget_min / 100)}–${Math.round(r.budget_max / 100)}
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: chip.bg, color: chip.color }}>
                        {(r.group_status ?? r.status).toLowerCase() === "live" || (r.group_status ?? r.status).toLowerCase() === "bidding"
                          ? <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                          : null}
                        {activityLabel}
                      </span>
                    </div>
                  );
                })
              ) : openRequests.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>
                  No active requests yet — post your first one below.
                </div>
              ) : (
                openRequests.slice(0, 5).map((r, i) => {
                  const chip = statusChip(r.status);
                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: "14px 24px",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        gap: 14,
                        alignItems: "center",
                        borderBottom: i < openRequests.slice(0, 5).length - 1 ? "1px solid var(--border-warm)" : 0,
                      }}
                    >
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: categoryColor(r.category, i),
                          display: "grid", placeItems: "center",
                          color: "white", flexShrink: 0,
                        }}
                      >
                        {categoryIcon(r.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>
                          {r.neighborhood} · {r.bid_count} {r.bid_count === 1 ? "bid" : "bids"}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--ink-700)" }}>
                        ${Math.round(r.budget_min / 100)} – ${Math.round(r.budget_max / 100)}
                      </div>
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          height: 24, padding: "0 10px", borderRadius: 999,
                          fontSize: 12, fontWeight: 600,
                          background: chip.bg, color: chip.color,
                        }}
                      >
                        {r.status.toLowerCase() === "live" && (
                          <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                        )}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
                  );
                })
              )}

              <div style={{ padding: 14, borderTop: "1px dashed var(--border-warm-strong)" }}>
                <Link
                  href="/app/homeowner/request"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", height: 42, borderRadius: 12,
                    border: "1px dashed var(--border-warm-strong)",
                    color: "var(--ink-500)", fontWeight: 600, fontSize: 13,
                    textDecoration: "none", background: "transparent",
                  }}
                >
                  <IconPlus /> Add a new service request
                </Link>
              </div>
            </div>

            {/* Neighborhood pulse */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-warm)",
                borderRadius: 18,
                boxShadow: "var(--shadow-warm-sm)",
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-900)" }}>
                    Neighborhood pulse
                  </div>
                  <div style={{ color: "var(--ink-500)", fontSize: 12, marginTop: 2 }}>
                    What your neighbors are up to
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    height: 24, padding: "0 10px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: "var(--sage-50)", color: "var(--sage-700)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                  {neighbourhoodPulse.length} update{neighbourhoodPulse.length !== 1 ? "s" : ""} live
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {neighbourhoodPulse.length > 0 ? neighbourhoodPulse.map((a) => (
                  <div key={a.key} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: a.avColor,
                        display: "grid", placeItems: "center",
                        color: "white", fontSize: 11, fontWeight: 600, flexShrink: 0,
                      }}
                    >
                      {a.initials}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, color: "var(--ink-700)" }}>
                      <strong style={{ color: "var(--ink-900)" }}>{a.who}</strong> {a.what}{" "}
                      <span style={{ color: "var(--terracotta-600)", fontWeight: 600 }}>{a.highlight}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{a.when}</div>
                  </div>
                )) : (
                  <div style={{ fontSize: 13, color: "var(--ink-400)" }}>
                    No nearby neighbor activity yet. As soon as someone joins within your area, it will appear here and in your neighbourhood chat.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Savings card */}
            <div
              style={{
                background: "linear-gradient(160deg, var(--cream-100), var(--cream-200))",
                border: "1px solid var(--border-warm)",
                borderRadius: 22,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>
                Your savings this year
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)", fontWeight: 500,
                    fontSize: 56, lineHeight: 1, color: "var(--ink-900)",
                    letterSpacing: "-0.02em",
                }}
              >
                ${Math.round((dashboard?.total_saved_cents ?? 0) / 100).toLocaleString()}
              </div>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 9px", borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: "var(--sage-50)", color: "var(--sage-700)",
                    border: "1px solid var(--sage-100)",
                  }}
                >
                  ↓ 22% vs solo
                </span>
              </div>
              <div style={{ color: "var(--ink-500)", fontSize: 13, marginTop: 6 }}>
                Across 4 services · vs. solo booking
              </div>

              {/* Mini bar chart */}
              <div style={{ marginTop: 20, display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
                {[
                  { m: "Jan", h: 14 }, { m: "Feb", h: 0 }, { m: "Mar", h: 32 },
                  { m: "Apr", h: 48 }, { m: "May", h: 22 }, { m: "Jun", h: 36 },
                ].map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height: Math.max(b.h, 4),
                        background: b.h > 0 ? "var(--terracotta-500)" : "var(--cream-300)",
                        borderRadius: 4,
                      }}
                    />
                    <div style={{ fontSize: 10, color: "var(--ink-400)" }}>{b.m}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16, paddingTop: 14,
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Neighbors</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink-900)", marginTop: 2, letterSpacing: "-0.02em" }}>{neighborCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Active bids</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink-900)", marginTop: 2, letterSpacing: "-0.02em" }}>{dashboard?.active_bids ?? 0}</div>
                </div>
              </div>
            </div>

            {/* AI recommendation */}
            {hasRecommendation ? (
              <div
                style={{
                  background: "linear-gradient(180deg, white, var(--terracotta-50))",
                  border: "1px solid var(--terracotta-100)",
                  borderRadius: 18,
                  padding: 20,
                  boxShadow: "var(--shadow-warm-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: "var(--terracotta-600)",
                      display: "grid", placeItems: "center", color: "white",
                    }}
                  >
                    <IconSpark />
                  </div>
                  <div
                    style={{
                      fontSize: 12, fontWeight: 600, color: "var(--terracotta-600)",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}
                  >
                    BidBundle AI
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500,
                    lineHeight: 1.35, color: "var(--ink-900)",
                  }}
                >
                  {ownRecommendedRequest
                    ? `${ownRecommendedRequest.title} has ${ownRecommendedRequest.bid_count} provider bid${ownRecommendedRequest.bid_count !== 1 ? "s" : ""}${ownRecommendedRequest.best_bid_cents ? `, with the best at $${Math.round(ownRecommendedRequest.best_bid_cents / 100).toLocaleString()}` : ""}${recommendationSavings > 0 ? ` and about $${Math.round(recommendationSavings / 100).toLocaleString()} under your target.` : "."}`
                    : `${neighbourhoodRecommendedRequest?.owner_name}'s ${neighbourhoodRecommendedRequest?.title} is getting provider interest in ${neighbourhoodRecommendedRequest?.neighborhood} with ${neighbourhoodRecommendedRequest?.bid_count} live bid${neighbourhoodRecommendedRequest && neighbourhoodRecommendedRequest.bid_count !== 1 ? "s" : ""}.`}
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <Link
                    href="/app/homeowner/bids"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      height: 30, padding: "0 12px", borderRadius: 999,
                      fontSize: 13, fontWeight: 600,
                      background: "var(--terracotta-600)", color: "white", border: 0,
                      fontFamily: "var(--font-body)", textDecoration: "none",
                    }}
                  >
                    Review bids
                  </Link>
                  <Link
                    href="/app/homeowner/chat"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      height: 30, padding: "0 12px", borderRadius: 999,
                      fontSize: 13, fontWeight: 600,
                      background: "var(--cream-100)", color: "var(--ink-900)", border: 0,
                      fontFamily: "var(--font-body)", textDecoration: "none",
                    }}
                  >
                    Ask why
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
