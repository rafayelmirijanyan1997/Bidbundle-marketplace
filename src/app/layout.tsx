import type { Metadata } from "next";
import { Fraunces, Instrument_Serif, Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ScrollReveal } from "@/components/layout/ScrollReveal";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "BidBundle",
  description: "Your neighbourhood. Your power. Your price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${instrumentSerif.variable} ${inter.variable}`}
    >
      <body>
        <ScrollReveal />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
