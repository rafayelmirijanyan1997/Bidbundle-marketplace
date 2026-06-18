"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  useHomeownerChat,
  type Conversation,
  type GroupChannel,
  type NeighbourhoodChannel,
} from "@/hooks/useHomeownerChat";
import { useNeighbourhoodSummary } from "@/hooks/useNeighbourhoodSummary";

function IconSearch() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
}
function IconSpark() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5L19 9.8 14 11.6 12 17l-1.8-5.4L5 9.8 10.2 8z"/></svg>;
}
function IconPaperclip() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-9 9a5 5 0 1 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 1 1-3-3l8-8"/></svg>;
}
function IconSend() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>;
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>;
}

type UiMessage = {
  id: string;
  sender: string;
  time: string;
  mine?: boolean;
  body: string;
};

type AiThread = {
  type: "ai";
  id: "ai";
  name: string;
  preview: string;
  unread: number;
  headerSubtitle: string;
  onlineLabel?: string;
  composerPlaceholder: string;
  suggestions: string[];
  messages: UiMessage[];
  avatarBg: string;
  avatarShape: "rounded";
};

type GroupThread = {
  type: "group";
  id: number;
  name: string;
  preview: string;
  unread: number;
  headerSubtitle: string;
  onlineLabel?: string;
  composerPlaceholder: string;
  suggestions: string[];
  avatarBg: string;
  avatarShape: "circle";
  raw: GroupChannel;
};

type DmThread = {
  type: "dm";
  id: number;
  name: string;
  preview: string;
  unread: number;
  headerSubtitle: string;
  onlineLabel?: string;
  composerPlaceholder: string;
  suggestions: string[];
  avatarBg: string;
  avatarShape: "circle";
  raw: Conversation;
};

type NeighbourhoodThread = {
  type: "neighbourhood";
  id: number;
  name: string;
  preview: string;
  unread: 0;
  headerSubtitle: string;
  onlineLabel?: string;
  composerPlaceholder: string;
  suggestions: string[];
  avatarBg: string;
  avatarShape: "rounded";
  raw: NeighbourhoodChannel;
};

type ActiveThread = AiThread | GroupThread | DmThread | NeighbourhoodThread;

const aiThread: AiThread = {
  type: "ai",
  id: "ai",
  name: "BidBundle AI",
  preview: "Ask about bids, providers, savings, or your neighborhood",
  unread: 0,
  avatarBg: "var(--terracotta-600)",
  avatarShape: "rounded",
  headerSubtitle: "Bids · providers · savings · group decisions",
  onlineLabel: "Online",
  composerPlaceholder: "Ask BidBundle AI anything…",
  suggestions: [
    "Which bid is best value?",
    "Compare ProFix vs AquaFlow",
    "When should I confirm?",
    "What's a fair price?",
  ],
  messages: [],
};

function threadAvatarStyle(thread: ActiveThread, compact = false) {
  const size = compact ? 36 : 40;
  return {
    width: size,
    height: size,
    borderRadius: thread.avatarShape === "rounded" ? 11 : "50%",
    background: thread.avatarBg,
    display: "grid",
    placeItems: "center",
    color: "white",
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
  } as const;
}

function ThreadAvatar({ thread, compact = false }: { thread: ActiveThread; compact?: boolean }) {
  return (
    <div style={threadAvatarStyle(thread, compact)}>
      {thread.type === "ai" ? <IconSpark /> : thread.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
    </div>
  );
}

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function HomeownerChat() {
  const {
    conversations,
    channels,
    neighbourhoodChannel,
    loading,
    getMessages,
    sendMessage,
    askAi,
    getNeighbourhoodMessages,
    sendNeighbourhoodMessage,
  } = useHomeownerChat();
  const { memberCount, neighborCount } = useNeighbourhoodSummary();

  const [activeThread, setActiveThread] = useState<ActiveThread>(aiThread);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLInputElement | null>(null);
  const neighbourhoodMemberCount = neighbourhoodChannel ? memberCount : 0;
  const neighbourhoodNeighborCount = neighbourhoodChannel ? neighborCount : 0;

  const neighbourhoodThread: NeighbourhoodThread | null = neighbourhoodChannel
    ? {
        type: "neighbourhood",
        id: neighbourhoodChannel.id,
        name: neighbourhoodChannel.neighbourhood_name,
        preview: pluralize(neighbourhoodMemberCount, "member"),
        unread: 0,
        avatarBg: "linear-gradient(135deg,#7A9A7E,#4A6A4D)",
        avatarShape: "rounded",
        headerSubtitle: `${pluralize(neighbourhoodNeighborCount, "neighbour", "neighbours")} · General community channel`,
        onlineLabel: pluralize(neighbourhoodMemberCount, "member"),
        composerPlaceholder: "Message your neighbourhood…",
        suggestions: ["Who needs a plumber?", "Looking for lawn care group", "Anyone know a good handyman?", "Group buying update"],
        raw: neighbourhoodChannel,
      }
    : null;

  const groupThreads: GroupThread[] = channels.map((channel, index) => ({
    type: "group",
    id: channel.id,
    name: channel.request_title,
    preview: channel.last_message ?? "No messages yet",
    unread: channel.unread_count,
    avatarBg: index % 2 === 0 ? "linear-gradient(135deg,#6F8DB8,#3F608E)" : "linear-gradient(135deg,#7A9A7E,#4A6A4D)",
    avatarShape: "circle",
    headerSubtitle: `${channel.member_count} participants · Request #${channel.request_id}`,
    onlineLabel: `${channel.member_count} participants`,
    composerPlaceholder: `Reply to ${channel.request_title}…`,
    suggestions: ["Ask if everyone agrees", "Share provider ETA", "Post savings summary"],
    raw: channel,
  }));

  const providerThreads: DmThread[] = conversations.map((conv, index) => ({
    type: "dm",
    id: conv.id,
    name: conv.other_user_name,
    preview: conv.last_message ?? "No messages yet",
    unread: conv.unread_count,
    avatarBg: index % 2 === 0 ? "linear-gradient(135deg,#D6A23E,#B8862B)" : "linear-gradient(135deg,#B07AA0,#7A4A6E)",
    avatarShape: "circle",
    headerSubtitle: "Verified provider conversation",
    onlineLabel: "Verified",
    composerPlaceholder: `Message ${conv.other_user_name}…`,
    suggestions: ["Ask about availability", "Confirm materials included", "Request license details"],
    raw: conv,
  }));

  const totalUnread =
    channels.reduce((sum, channel) => sum + channel.unread_count, 0) +
    conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, aiThinking]);

  useEffect(() => {
    if (activeThread.type === "ai") {
      setMessages([]);
      return;
    }

    if (activeThread.type === "neighbourhood") {
      void getNeighbourhoodMessages(activeThread.id).then((loaded) => {
        setMessages(
          loaded.map((message) => ({
            id: String(message.id),
            sender: message.sender_name,
            time: formatTime(message.created_at),
            mine: false,
            body: message.content,
          }))
        );
      });
      return;
    }

    void getMessages(activeThread.type, activeThread.id).then((loaded) => {
      setMessages(
        loaded.map((message) => ({
          id: String(message.id),
          sender: message.sender_name,
          time: formatTime(message.created_at),
          mine:
            activeThread.type === "dm"
              ? message.sender_id !== activeThread.raw.other_user_id
              : message.sender_name === "You",
          body: message.text,
        }))
      );
    });
  }, [activeThread, getMessages, getNeighbourhoodMessages]);

  const handleSelect = (thread: ActiveThread) => {
    setActiveThread(thread);
    setComposer("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setComposer(suggestion);
    composerRef.current?.focus();
  };

  const handleSend = async () => {
    const text = composer.trim();
    if (!text || aiThinking) return;

    if (activeThread.type === "ai") {
      setMessages((prev) => [
        ...prev,
        { id: `ai-user-${Date.now()}`, sender: "You", time: "Just now", mine: true, body: text },
      ]);
      setComposer("");
      setAiThinking(true);
      const reply = await askAi(text);
      setAiThinking(false);
      if (reply) {
        setMessages((prev) => [
          ...prev,
          { id: `ai-reply-${Date.now()}`, sender: "BidBundle AI", time: "Just now", body: reply },
        ]);
      }
      return;
    }

    if (activeThread.type === "neighbourhood") {
      const sent = await sendNeighbourhoodMessage(activeThread.id, text);
      if (sent) {
        setMessages((prev) => [
          ...prev,
          { id: String(sent.id), sender: sent.sender_name, time: formatTime(sent.created_at), mine: true, body: sent.content },
        ]);
        setComposer("");
      }
      return;
    }

    const sent = await sendMessage(activeThread.type, activeThread.id, text);
    if (sent) {
      setMessages((prev) => [
        ...prev,
        { id: String(sent.id), sender: sent.sender_name, time: formatTime(sent.created_at), mine: true, body: sent.text },
      ]);
      setComposer("");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "var(--bg-app)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--ink-400)", fontSize: 14 }}>Loading messages…</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "calc(100vh - 0px)", overflow: "hidden" }}>
      <div
        style={{
          borderRight: "1px solid var(--border-warm)",
          background: "var(--cream-50)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "24px 20px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink-900)" }}>
              Messages
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 24,
                padding: "0 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: "var(--terracotta-50)",
                color: "var(--terracotta-600)",
              }}
            >
              {totalUnread} new
            </span>
          </div>
          <div
            style={{
              marginTop: 14,
              height: 36,
              borderRadius: 12,
              background: "var(--cream-100)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              border: "1px solid transparent",
            }}
          >
            <IconSearch />
            <input
              placeholder="Search neighbors, bids, providers…"
              style={{ border: 0, outline: 0, background: "transparent", fontSize: 13, fontFamily: "var(--font-body)", color: "var(--ink-900)", flex: 1 }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>
          {neighbourhoodThread && (
            <>
              <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "10px 8px 6px" }}>
                Your neighbourhood
              </div>
              <button
                onClick={() => handleSelect(neighbourhoodThread)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  background: activeThread.type === "neighbourhood"
                    ? "linear-gradient(135deg, white, var(--sage-50))"
                    : "linear-gradient(135deg, var(--sage-50), var(--cream-50))",
                  border: activeThread.type === "neighbourhood" ? "1px solid var(--sage-100)" : "1px solid var(--sage-100)",
                  boxShadow: activeThread.type === "neighbourhood" ? "0 0 0 3px rgba(122,154,126,0.08)" : "none",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 4,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 11, background: neighbourhoodThread.avatarBg, display: "grid", placeItems: "center", color: "white", flexShrink: 0, fontSize: 12, fontWeight: 600 }}>
                  🏘
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{neighbourhoodThread.name}</div>
                    <span style={{ fontSize: 11, color: "var(--sage-700)", fontWeight: 600 }}>{pluralize(neighbourhoodMemberCount, "member")}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>General community channel</div>
                </div>
              </button>
            </>
          )}

          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "10px 8px 6px" }}>
            AI assistant
          </div>
          <button
            onClick={() => handleSelect(aiThread)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              background: "linear-gradient(135deg, white, var(--terracotta-50))",
              border: activeThread.type === "ai" ? "1px solid var(--terracotta-200)" : "1px solid var(--terracotta-100)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              boxShadow: activeThread.type === "ai" ? "0 0 0 3px rgba(194,85,43,0.05)" : "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <ThreadAvatar thread={aiThread} compact />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{aiThread.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-400)" }}>Live</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {aiThread.preview}
              </div>
            </div>
          </button>

          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "18px 8px 6px" }}>
            Active bids · {groupThreads.filter((thread) => !thread.raw.archived).length}
          </div>
          {groupThreads.filter((thread) => !thread.raw.archived).length === 0 ? (
            <div style={{ padding: "10px 8px", fontSize: 12, color: "var(--ink-400)" }}>No active bids yet</div>
          ) : groupThreads.filter((thread) => !thread.raw.archived).map((thread) => {
            const isActive = activeThread.type === "group" && activeThread.id === thread.id;
            return (
              <button
                key={`group-${thread.id}`}
                onClick={() => handleSelect(thread)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  marginTop: 4,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive ? "white" : "transparent",
                  border: isActive ? "1px solid var(--border-warm)" : "1px solid transparent",
                  boxShadow: isActive ? "var(--shadow-warm-sm)" : "none",
                }}
              >
                <ThreadAvatar thread={thread} compact />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)" }}>{thread.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{formatTime(thread.raw.last_message_at)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{thread.preview}</div>
                </div>
                {thread.unread > 0 && (
                  <span style={{ minWidth: 18, height: 18, padding: "0 6px", borderRadius: 9, background: "var(--terracotta-600)", color: "white", fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>
                    {thread.unread}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.10em", color: "var(--ink-400)", fontWeight: 600, padding: "18px 8px 6px" }}>
            Providers · {providerThreads.length}
          </div>
          {providerThreads.length === 0 ? (
            <div style={{ padding: "10px 8px", fontSize: 12, color: "var(--ink-400)" }}>No provider conversations yet</div>
          ) : providerThreads.map((thread) => {
            const isActive = activeThread.type === "dm" && activeThread.id === thread.id;
            return (
              <button
                key={`dm-${thread.id}`}
                onClick={() => handleSelect(thread)}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive ? "white" : "transparent",
                  border: isActive ? "1px solid var(--border-warm)" : "1px solid transparent",
                  boxShadow: isActive ? "var(--shadow-warm-sm)" : "none",
                }}
              >
                <ThreadAvatar thread={thread} compact />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink-900)", display: "flex", alignItems: "center", gap: 6 }}>
                      {thread.name}
                      <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--sage-50)", color: "var(--sage-700)", display: "grid", placeItems: "center" }}>
                        <IconCheck />
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{formatTime(thread.raw.last_message_at)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {thread.preview}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}>
        <style>{`@keyframes nbPulse{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border-warm)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <ThreadAvatar thread={activeThread} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink-900)" }}>{activeThread.name}</div>
              {activeThread.onlineLabel && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: "var(--sage-50)", color: "var(--sage-700)", border: "1px solid var(--sage-100)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "currentColor" }} />
                  {activeThread.onlineLabel}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{activeThread.headerSubtitle}</div>
          </div>
          <Link
            href="/app/homeowner/bids"
            style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--ink-700)", border: "1px solid var(--border-warm-strong)", fontFamily: "var(--font-body)", textDecoration: "none" }}
          >
            View bids
          </Link>
        </div>

        <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--ink-400)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Today</div>

          {messages.length === 0 && activeThread.type === "ai" ? (
            <div
              style={{
                alignSelf: "center",
                maxWidth: 560,
                textAlign: "center",
                padding: "28px 24px",
                borderRadius: 24,
                background: "var(--cream-50)",
                border: "1px solid var(--border-warm)",
                color: "var(--ink-500)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Start a conversation with BidBundle AI. Messages here go directly to the live OpenAI-backed assistant.
            </div>
          ) : null}

          {messages.map((message) => (
            <div key={message.id} style={{ display: "flex", justifyContent: message.mine ? "flex-end" : "flex-start" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", maxWidth: 640, flexDirection: message.mine ? "row-reverse" : "row" }}>
                {!message.mine && (
                  <div
                    title={message.sender}
                    aria-label={message.sender}
                    style={{ width: 30, height: 30, borderRadius: activeThread.type === "ai" ? 9 : "50%", background: activeThread.avatarBg, display: "grid", placeItems: "center", color: "white", flexShrink: 0, fontSize: 11, fontWeight: 700 }}
                  >
                    {activeThread.type === "ai" ? <IconSpark /> : message.sender.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                )}
                <div style={{ maxWidth: 480 }}>
                  <div
                    style={{
                      background: message.mine ? "var(--terracotta-600)" : activeThread.type === "ai" ? "var(--cream-100)" : "white",
                      color: message.mine ? "white" : "var(--ink-900)",
                      borderRadius: message.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      border: message.mine ? 0 : activeThread.type === "ai" ? 0 : "1px solid var(--border-warm)",
                      boxShadow: message.mine || activeThread.type === "ai" ? "none" : "var(--shadow-warm-sm)",
                    }}
                  >
                    {message.body}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4, marginLeft: message.mine ? 0 : 4, textAlign: message.mine ? "right" : "left" }}>{message.time}</div>
                </div>
              </div>
            </div>
          ))}

          {aiThinking && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--terracotta-600)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
                <IconSpark />
              </div>
              <div style={{ background: "var(--cream-100)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--terracotta-500)", display: "inline-block", animation: "nbPulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-warm)", padding: "14px 28px 22px", background: "white", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {activeThread.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{ display: "inline-flex", alignItems: "center", height: 30, padding: "0 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "var(--cream-100)", color: "var(--ink-900)", border: 0, fontFamily: "var(--font-body)" }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px 6px 14px", background: "var(--cream-100)", borderRadius: 22, border: "1px solid transparent" }}>
            <IconPaperclip />
            <input
              ref={composerRef}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={activeThread.composerPlaceholder}
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 14, fontFamily: "var(--font-body)", color: "var(--ink-900)", padding: "10px 0" }}
            />
            <button
              onClick={() => void handleSend()}
              disabled={!composer.trim() || aiThinking}
              style={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--terracotta-600)", color: "white", border: 0, cursor: aiThinking ? "not-allowed" : "pointer", opacity: (!composer.trim() || aiThinking) ? 0.5 : 1 }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
