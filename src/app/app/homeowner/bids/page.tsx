"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useHomeownerBids } from "@/hooks/useHomeownerBids";
import { useHomeownerGroups } from "@/hooks/useHomeownerGroups";
import type { HomeownerGroup } from "@/hooks/useHomeownerGroups";
import { useHomeownerRequests } from "@/hooks/useHomeownerRequests";
import { useQuoteSummary } from "@/hooks/useQuoteSummary";
import type { QuoteSummaryResult } from "@/hooks/useQuoteSummary";
import { useDisputeMediator } from "@/hooks/useDisputeMediator";
import type { DisputeResult } from "@/hooks/useDisputeMediator";

function IconSearch() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
}
function IconPlus() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
}
function IconWrench() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6a4 4 0 0 1 5 5l-9 9-4 1 1-4 9-9z"/></svg>;
}
function IconLeaf() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-9 7-14 16-14-1 9-5 16-14 16a4 4 0 0 1-2-2z"/><path d="M5 19l8-8"/></svg>;
}
function IconBroom() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-7 7H6v-7z"/><path d="M6 14l-3 6 6-3"/></svg>;
}
function IconEdit() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z"/><path d="M14 5l2.5 2.5"/></svg>;
}
function IconMessage() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconStar() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M12 2l3 6.5 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7L2 9.4l7-.9z"/></svg>;
}
function IconUsers() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

const cardStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-warm)",
  borderRadius: 18,
  boxShadow: "var(--shadow-warm-sm)",
};

const btnPrimary = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 38, padding: "0 16px", borderRadius: 999,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  background: "var(--terracotta-600)", color: "white", border: 0,
  fontFamily: "var(--font-body)",
  boxShadow: "0 1px 0 rgba(0,0,0,0.05) inset, 0 6px 14px -6px rgba(194,85,43,0.5)",
};
const btnGhost = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 38, padding: "0 16px", borderRadius: 999,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  background: "transparent", color: "var(--ink-700)",
  border: "1px solid var(--border-warm-strong)",
  fontFamily: "var(--font-body)",
};
const btnSmQuiet = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 30, padding: "0 12px", borderRadius: 999,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: "var(--cream-100)", color: "var(--ink-900)", border: 0,
  fontFamily: "var(--font-body)",
};
const btnSmGhost = {
  display: "inline-flex" as const, alignItems: "center" as const, gap: 8,
  height: 30, padding: "0 12px", borderRadius: 999,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  background: "transparent", color: "var(--ink-700)",
  border: "1px solid var(--border-warm-strong)",
  fontFamily: "var(--font-body)",
};

function iconForIndex(index: number) {
  if (index % 3 === 0) return <IconWrench />;
  if (index % 3 === 1) return <IconLeaf />;
  return <IconBroom />;
}

function iconBgForIndex(index: number) {
  if (index % 3 === 0) return "linear-gradient(135deg,#6F8DB8,#3F608E)";
  if (index % 3 === 1) return "linear-gradient(135deg,#7A9A7E,#4A6A4D)";
  return "linear-gradient(135deg,#D6A23E,#B8862B)";
}

export default function HomeownerBids() {
  const router = useRouter();
  const { requests, loading: reqLoading } = useHomeownerRequests();
  const { bids, loading: bidsLoading, acceptBid, declineBid } = useHomeownerBids();
  const { groups, loading: groupsLoading, approveGroup, cancelGroup } = useHomeownerGroups();
  const loading = reqLoading || bidsLoading;
  const { summariseQuote, loading: quoteLoading, error: quoteError } = useQuoteSummary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quoteResult, setQuoteResult] = useState<QuoteSummaryResult | null>(null);
  const [showQuotePanel, setShowQuotePanel] = useState(false);
  const { submitDispute, loading: disputeLoading } = useDisputeMediator();
  const [disputeBidId, setDisputeBidId] = useState<number | null>(null);
  const [disputeComplaint, setDisputeComplaint] = useState("");
  const [disputeResult, setDisputeResult] = useState<DisputeResult | null>(null);
  const [messagingProviderId, setMessagingProviderId] = useState<number | null>(null);
  const [groupActionId, setGroupActionId] = useState<number | null>(null);

  async function startConversation(providerId: number) {
    const token = getToken();
    if (!token) return;
    setMessagingProviderId(providerId);
    try {
      await apiFetch<{ id: number }>(`/homeowner/conversations?other_user_id=${providerId}`, {
        method: "POST",
        token,
      });
      router.push("/app/homeowner/chat");
    } catch {
      // ignore
    } finally {
      setMessagingProviderId(null);
    }
  }

  const pendingBids = bids.filter((bid) => bid.status === "pending");
  const acceptedBids = bids.filter((bid) => bid.status === "accepted");
  const archivedBids = bids.filter((bid) => bid.status === "declined");
  const closedRequests = requests.filter((request) => request.status === "closed");
  const activeGroups = groups.filter((group) => group.status !== "cancelled");

  const stats = [
    {
      eyebrow: "Total saved",
      big: `$${Math.round(acceptedBids.reduce((sum, bid) => sum + bid.amount, 0) / 100).toLocaleString()}`,
      sub: "accepted bids",
      numColor: "var(--terracotta-600)",
      barColor: "var(--terracotta-500)",
    },
    {
      eyebrow: "Booked",
      big: `${acceptedBids.length}`,
      sub: "accepted bids",
      numColor: "var(--ink-900)",
      barColor: "var(--ink-200)",
    },
    {
      eyebrow: "Active now",
      big: `${pendingBids.length}`,
      sub: "pending bids",
      numColor: "var(--sage-700)",
      barColor: "var(--sage-500)",
    },
    {
      eyebrow: "Completed",
      big: `${closedRequests.length}`,
      sub: "closed requests",
      numColor: "var(--gold-600)",
      barColor: "var(--gold-500)",
    },
  ];

  function renderGroupCard(group: HomeownerGroup) {
    if (group.status === "grouping") {
      const progressPercent = Math.max(0, Math.min(100, Number((((72 - group.hours_remaining) / 72) * 100).toFixed(0))));
      return (
        <div
          key={group.group_id}
          style={{
            background: "var(--sage-50)",
            border: "1px solid var(--border-warm)",
            borderRadius: 18,
            padding: "18px 22px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-900)" }}>
              <IconUsers />
              Gathering neighbours
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 600 }}>{group.member_count} neighbours</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "white", color: "var(--ink-900)", textTransform: "capitalize" as const }}>
              {group.category}
            </span>
            <span style={{ fontSize: 13, color: "var(--ink-700)" }}>grouping window closes in {Math.ceil(group.hours_remaining)}h</span>
          </div>
          <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: "var(--sage-100)", overflow: "hidden" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", borderRadius: 2, background: "var(--sage-500)" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-500)", lineHeight: 1.5 }}>
            Once the 72-hour window closes, you will be asked to approve before providers can see this group.
          </div>
        </div>
      );
    }

    if (group.status === "pending_approval") {
      const isBusy = groupActionId === group.group_id;
      return (
        <div
          key={group.group_id}
          style={{
            background: "var(--gold-50)",
            border: "1px solid var(--border-warm)",
            borderRadius: 18,
            padding: "18px 22px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink-900)" }}>Your vote is needed</div>
            <div style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 600 }}>{group.approved_count}/{group.member_count} approved</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-700)", textTransform: "capitalize" as const }}>
            {group.category} · {group.member_count} neighbours · window closed
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-700)" }}>
            Approve to send this group to providers, or cancel your spot.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              disabled={isBusy}
              style={{ ...btnGhost, height: 34, opacity: isBusy ? 0.65 : 1 }}
              onClick={() => {
                setGroupActionId(group.group_id);
                void cancelGroup(group.group_id).finally(() => setGroupActionId((current) => (current === group.group_id ? null : current)));
              }}
            >
              Cancel my spot
            </button>
            <button
              type="button"
              disabled={isBusy}
              style={{ ...btnPrimary, height: 34, opacity: isBusy ? 0.65 : 1 }}
              onClick={() => {
                setGroupActionId(group.group_id);
                void approveGroup(group.group_id).finally(() => setGroupActionId((current) => (current === group.group_id ? null : current)));
              }}
            >
              Approve group
            </button>
          </div>
        </div>
      );
    }

    if (group.status === "bidding") {
      return (
        <div key={group.group_id} style={{ ...cardStyle, padding: "18px 22px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 15, color: "var(--sage-700)", fontWeight: 600 }}>✓ Sent to providers</div>
            <div style={{ fontSize: 13, color: "var(--ink-700)", fontWeight: 600 }}>{group.member_count} neighbours</div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--ink-700)", textTransform: "capitalize" as const }}>
            {group.category} · waiting for bids from providers
          </div>
        </div>
      );
    }

    return null;
  }

  if (loading) {
    return (
      <div style={{ background: "var(--bg-app)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--ink-400)", fontSize: 14 }}>Loading bids…</div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "28px 36px 20px", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.02em", margin: "0 0 4px", color: "var(--ink-900)" }}>
            My bids
          </h1>
          <p style={{ margin: 0, color: "var(--ink-500)", fontSize: 14 }}>Track bookings, savings, and provider work in progress.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setShowQuotePanel(true);
              setQuoteResult(null);
              const result = await summariseQuote(f);
              if (result) setQuoteResult(result);
              e.target.value = "";
            }}
          />
          <button style={btnGhost} onClick={() => fileInputRef.current?.click()}>
            {quoteLoading ? "Analysing…" : "Compare outside quote"}
          </button>
          <button style={btnGhost}><IconSearch /> Search bids</button>
          <Link href="/app/homeowner/request" style={{ ...btnPrimary, textDecoration: "none" }}><IconPlus /> New request</Link>
        </div>
      </div>

      <div style={{ padding: "0 36px 36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          {stats.map((s) => (
            <div key={s.eyebrow} style={{ ...cardStyle, padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>{s.eyebrow}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 36, marginTop: 8, color: s.numColor, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.big}</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>{s.sub}</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: s.barColor }} />
            </div>
          ))}
        </div>

        {showQuotePanel && (
          <div style={{ ...cardStyle, padding: 24, marginBottom: 22, position: "relative" }}>
            <button
              onClick={() => { setShowQuotePanel(false); setQuoteResult(null); }}
              style={{ position: "absolute", top: 16, right: 16, background: "var(--cream-100)", border: 0, borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: "var(--ink-500)", display: "grid", placeItems: "center" }}
            >×</button>

            {quoteLoading && !quoteResult && (
              <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Analysing your quote…</div>
            )}

            {quoteError && (
              <p style={{ color: "var(--terracotta-600)", fontSize: 14 }}>{quoteError}</p>
            )}

            {quoteResult && (
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Outside quote</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", marginTop: 4, letterSpacing: "-0.01em" }}>
                      {quoteResult.provider_name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>
                      {quoteResult.quoted_amount > 0 ? `$${Math.round(quoteResult.quoted_amount / 100).toLocaleString()}` : "—"}
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, marginTop: 4,
                      background: quoteResult.score >= 70 ? "var(--sage-50)" : quoteResult.score >= 40 ? "var(--gold-50)" : "var(--terracotta-50)",
                      color: quoteResult.score >= 70 ? "var(--sage-700)" : quoteResult.score >= 40 ? "var(--gold-600)" : "var(--terracotta-600)",
                    }}>
                      Score {quoteResult.score}/100
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.55, marginBottom: 14 }}>{quoteResult.scope_summary}</p>

                {quoteResult.flags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 14 }}>
                    {quoteResult.flags.map((flag, i) => (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--terracotta-50)", color: "var(--terracotta-600)" }}>
                        ⚠ {flag}
                      </span>
                    ))}
                  </div>
                )}

                {quoteResult.vs_neighbid && (
                  <div style={{ background: "var(--sage-50)", border: "1px solid var(--border-warm)", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sage-700)" }}>
                      BidBundle best bid: ${Math.round(quoteResult.vs_neighbid.neighbid_best_bid / 100).toLocaleString()}
                      {quoteResult.vs_neighbid.saving_if_use_neighbid > 0
                        ? ` · Saves you $${Math.round(quoteResult.vs_neighbid.saving_if_use_neighbid / 100).toLocaleString()}`
                        : quoteResult.vs_neighbid.saving_if_use_neighbid < 0
                          ? ` · This quote is $${Math.round(Math.abs(quoteResult.vs_neighbid.saving_if_use_neighbid) / 100).toLocaleString()} cheaper`
                          : " · Same price"}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>{quoteResult.recommendation}</p>
                {quoteResult.stub && <p style={{ fontSize: 12, color: "var(--ink-400)", marginTop: 8 }}>AI unavailable — partial analysis only.</p>}
              </div>
            )}
          </div>
        )}

        {activeGroups.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Group bids</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)" }}>
                <IconUsers /> {activeGroups.length} active
              </span>
              {groupsLoading ? <span style={{ fontSize: 12, color: "var(--ink-400)" }}>Refreshing…</span> : null}
            </div>
            {activeGroups.map(renderGroupCard)}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18, padding: "0 4px" }}>
          {[
            { k: "all", label: "All", n: bids.length, active: true },
            { k: "active", label: "Active", n: pendingBids.length },
            { k: "completed", label: "Completed", n: acceptedBids.length },
            { k: "archived", label: "Archived", n: archivedBids.length },
          ].map((tab) => (
            <button
              key={tab.k}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                height: 30, padding: "0 12px", borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: "pointer", border: 0,
                background: tab.active ? "var(--ink-900)" : "transparent",
                color: tab.active ? "white" : "var(--ink-700)",
                fontFamily: "var(--font-body)",
              }}
            >
              {tab.label}
              <span
                style={{
                  marginLeft: 2,
                  background: tab.active ? "rgba(255,255,255,0.18)" : "var(--cream-200)",
                  color: tab.active ? "white" : "var(--ink-500)",
                  fontSize: 11, padding: "1px 7px", borderRadius: 9,
                }}
              >
                {tab.n}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={btnSmGhost}>Sort: Recent ↓</button>
        </div>

        {bids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-400)", fontSize: 14 }}>
            No bids yet — post a request to start receiving bids from local providers.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Active</div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} /> {pendingBids.length} in progress
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingBids.map((bid, index) => {
                  const request = requests.find((r) => r.id === bid.request_id);
                  const savings = ((request?.budget_min ?? 0) - bid.amount) / 100;
                  return (
                    <div key={bid.id} style={cardStyle}>
                      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 18, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBgForIndex(index), display: "grid", placeItems: "center", color: "white" }}>
                          {iconForIndex(index)}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-900)" }}>{bid.request_title}</div>
                          <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>{bid.provider_name} · {bid.estimated_days} days</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>${Math.round(bid.amount / 100).toLocaleString()}</div>
                          <div style={{ fontSize: 12, color: "var(--sage-700)", fontWeight: 600, marginTop: 2 }}>−${Math.round(savings)} vs solo</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            style={btnSmGhost}
                            onClick={() => void startConversation(bid.provider_id)}
                            disabled={messagingProviderId === bid.provider_id}
                          >
                            <IconMessage />
                            {messagingProviderId === bid.provider_id ? "Opening…" : "Message"}
                          </button>
                          <button style={btnSmQuiet} onClick={() => void acceptBid(bid.id)}>Accept bid</button>
                          <button style={btnSmGhost} onClick={() => void declineBid(bid.id)}>Decline</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Completed</div>
                <span style={{ display: "inline-flex", alignItems: "center", height: 24, padding: "0 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "var(--cream-200)", color: "var(--ink-700)", border: "1px solid var(--border-warm)" }}>
                  {acceptedBids.length} accepted
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {acceptedBids.map((bid, index) => (
                  <div key={bid.id} style={{ ...cardStyle, padding: 20, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBgForIndex(index + 10), display: "grid", placeItems: "center", color: "white" }}>
                      {iconForIndex(index + 10)}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: "var(--ink-900)" }}>{bid.request_title}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>{bid.provider_name} · {new Date(bid.created_at).toLocaleDateString()}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                        {[1, 2, 3, 4, 5].map((star) => <IconStar key={star} />)}
                        <span style={{ fontSize: 12, color: "var(--ink-500)", marginLeft: 6 }}>5.0</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.02em" }}>${Math.round(bid.amount / 100).toLocaleString()}</div>
                      <button
                        style={btnSmGhost}
                        onClick={() => void startConversation(bid.provider_id)}
                        disabled={messagingProviderId === bid.provider_id}
                      >
                        <IconMessage />
                        {messagingProviderId === bid.provider_id ? "Opening…" : "Message"}
                      </button>
                      <button style={btnSmGhost}><IconEdit /> Leave review</button>
                      <button
                        style={btnSmGhost}
                        onClick={() => {
                          setDisputeBidId(bid.id);
                          setDisputeComplaint("");
                          setDisputeResult(null);
                        }}
                      >
                        Dispute job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600 }}>Archived</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {archivedBids.map((bid, index) => (
                  <div key={bid.id} style={{ ...cardStyle, padding: "14px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center", opacity: 0.85 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBgForIndex(index + 20), display: "grid", placeItems: "center", color: "white" }}>
                      {iconForIndex(index + 20)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{bid.request_title}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{bid.provider_name} · {new Date(bid.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--ink-500)", letterSpacing: "-0.02em" }}>${Math.round(bid.amount / 100).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {disputeBidId !== null && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(34,28,22,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setDisputeBidId(null); setDisputeResult(null); } }}
        >
          <div style={{ ...cardStyle, width: "100%", maxWidth: 600, borderRadius: "18px 18px 0 0", padding: "28px 28px 36px", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, color: "var(--ink-900)", letterSpacing: "-0.01em" }}>
                {disputeResult ? "Mediation result" : "Dispute this job"}
              </div>
              <button onClick={() => { setDisputeBidId(null); setDisputeResult(null); }} style={{ background: "var(--cream-100)", border: 0, borderRadius: 999, width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "var(--ink-500)", display: "grid", placeItems: "center" }}>×</button>
            </div>

            {!disputeResult ? (
              <>
                <p style={{ fontSize: 14, color: "var(--ink-700)", marginBottom: 16, lineHeight: 1.55 }}>
                  Describe the issue. AI will read the full job context and suggest a fair resolution.
                </p>
                <textarea
                  rows={5}
                  value={disputeComplaint}
                  onChange={(e) => setDisputeComplaint(e.target.value)}
                  placeholder="e.g. The work was incomplete — 2 pipes still dripping after the plumber left."
                  style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border-warm)", background: "var(--bg-app)", padding: "12px 14px", fontSize: 14, color: "var(--ink-700)", fontFamily: "var(--font-body)", lineHeight: 1.55, resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...btnGhost, flex: 1 }} onClick={() => setDisputeBidId(null)}>Cancel</button>
                  <button
                    style={{ ...btnPrimary, flex: 2, justifyContent: "center" }}
                    disabled={!disputeComplaint.trim() || disputeLoading}
                    onClick={async () => {
                      if (!disputeBidId) return;
                      const result = await submitDispute(disputeBidId, disputeComplaint);
                      if (result) setDisputeResult(result);
                    }}
                  >
                    {disputeLoading ? "Analysing…" : "Submit to AI mediator"}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: "var(--ink-700)", lineHeight: 1.6, marginBottom: 20 }}>{disputeResult.summary}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--terracotta-50)", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--terracotta-600)", marginBottom: 6 }}>Your position</div>
                    <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5, margin: 0 }}>{disputeResult.homeowner_position}</p>
                  </div>
                  <div style={{ background: "var(--cream-100)", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-500)", marginBottom: 6 }}>Provider agreed to</div>
                    <p style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.5, margin: 0 }}>{disputeResult.provider_position}</p>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--ink-400)", marginBottom: 10 }}>Resolution options</div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 20 }}>
                  {disputeResult.resolution_options.map((opt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: opt.type === disputeResult.recommendation ? "var(--sage-50)" : "var(--cream-50)", border: `1px solid ${opt.type === disputeResult.recommendation ? "var(--sage-200,#b0d4b0)" : "var(--border-warm)"}` }}>
                      {opt.type === disputeResult.recommendation && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--sage-700)", background: "var(--sage-100)", borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap" as const }}>Recommended</span>}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", textTransform: "capitalize" as const }}>{opt.type.replace(/_/g, " ")}{opt.amount_cents ? ` — $${Math.round(opt.amount_cents / 100)}` : ""}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{opt.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 20 }}>
                  AI confidence: <strong style={{ color: disputeResult.confidence === "high" ? "var(--sage-700)" : disputeResult.confidence === "medium" ? "var(--gold-600)" : "var(--ink-500)" }}>{disputeResult.confidence}</strong>
                  {disputeResult.stub ? " · AI unavailable — showing estimate" : ""}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...btnGhost, flex: 1 }} onClick={() => { setDisputeBidId(null); setDisputeResult(null); }}>Close</button>
                  <button style={{ ...btnPrimary, flex: 1, justifyContent: "center" }} onClick={() => { setDisputeBidId(null); setDisputeResult(null); }}>Accept recommendation</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
