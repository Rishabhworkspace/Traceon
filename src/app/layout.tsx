import type { Metadata } from "next";
import { Inter, Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const interBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
    "Understand any codebase instantly. Visualize architecture, trace dependencies, and predict the impact of your changes. Analyze GitHub profiles to assess engineering DNA, developer fit, and squad compatibility.",
  keywords: [
    "codebase analysis",
    "dependency graph",
    "architecture visualization",
    "developer evaluation",
    "engineering DNA",
    "GitHub profile analyzer",
    "developer assessment tool",
    "tech hiring",
    "squad compatibility",
    "code quality analysis",
    "open source contributor insights",
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
      "Analyze codebases and GitHub profiles. Visualize architecture, trace dependencies, assess engineering DNA, and evaluate developer fit.",
    type: "website",
    siteName: "Traceon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traceon — Codebase Intelligence Platform",
    description: "Analyze codebases and GitHub profiles. Assess engineering DNA and squad compatibility.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("traceon-theme");
    const theme = storedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${interBody.variable} ${spaceGrotesk.variable} ${firaCode.variable} antialiased selection:bg-emerald/30 selection:text-emerald`}
        suppressHydrationWarning
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
