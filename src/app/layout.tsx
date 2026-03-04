import type { Metadata } from "next";
import { DM_Sans, Syne, Fira_Code } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Traceon — Codebase Intelligence Platform",
    template: "%s | Traceon",
  },
  description:
    "Understand any codebase instantly. Visualize architecture, trace dependencies, and predict the impact of your changes.",
  keywords: [
    "codebase analysis",
    "dependency graph",
    "architecture visualization",
    "impact analysis",
    "developer tools",
    "code intelligence",
    "static analysis",
  ],
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Traceon — Codebase Intelligence Platform",
    description:
      "Understand any codebase instantly. Visualize architecture, trace dependencies, and predict impact.",
    type: "website",
    siteName: "Traceon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traceon — Codebase Intelligence Platform",
    description: "Visualize architecture, trace dependencies, and predict impact.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${syne.variable} ${firaCode.variable} antialiased`}
      >
        <NextAuthProvider>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
          <ScrollToTop />
        </NextAuthProvider>
      </body>
    </html>
  );
}
