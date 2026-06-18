"use client";

import type { ReactNode } from "react";

import { AppBottomNav } from "@/components/layout/AppBottomNav";

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-app)" }}>
      {/* Desktop sidebar — 220px */}
      <div className="hidden md:block">
        <AppBottomNav orientation="sidebar" />
      </div>

      {/* Main content — offset by sidebar width */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-[240px]" style={{ background: "var(--bg-app)" }}>
        <main className="flex-1 pb-24 md:pb-10">{children}</main>
      </div>

      {/* Mobile pill nav */}
      <div className="md:hidden">
        <AppBottomNav orientation="bottom" />
      </div>
    </div>
  );
}
