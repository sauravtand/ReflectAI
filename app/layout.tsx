import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { siteConfig } from "@/lib/site";

import "./globals.css";

/*
 * Fonts are self-hosted (files live in app/fonts) rather than fetched from
 * Google at build or run time. That keeps builds working offline and means no
 * participant's browser ever contacts a third party to load the interface.
 * Both are variable fonts; the Latin subset covers Danish letters (æ ø å).
 */
const newsreader = localFont({
  src: [
    { path: "./fonts/Newsreader-opsz.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/Newsreader-opsz-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

const instrumentSans = localFont({
  src: "./fonts/InstrumentSans-wght.woff2",
  weight: "400 700",
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // Not indexed by search engines until a deliberate launch decision is made.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${instrumentSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
