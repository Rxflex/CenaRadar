import { ReactLenis } from "lenis/react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { I18nProvider } from "@/components/i18n-provider";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_LOCALE } from "@/lib/locales";
import "./globals.css";
import "lenis/dist/lenis.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#181818" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Cena Radar — All deals in one place",
    template: "%s | Cena Radar",
  },
  description:
    "Compare prices on discounted products from Czech stores in real time. All data from kupi.cz.",
  applicationName: "Cena Radar",
  keywords: [
    "akce",
    "slevy",
    "kupi.cz",
    "ceny",
    "srovnání",
    "Czech Republic",
    "deals",
    "prices",
  ],
  authors: [{ name: "Cena Radar" }],
  generator: "Next.js",
  openGraph: {
    title: "Cena Radar — All deals in one place",
    description:
      "Compare prices on discounted products from Czech stores in real time.",
    siteName: "Cena Radar",
    locale: "cs_CZ",
    alternateLocale: ["ru_RU", "en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cena Radar",
    description: "Czech deals, compared",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

// Static lang default (the negotiated locale is applied by HtmlLangSync
// right after hydration). Keeping the root layout sync is required by
// Next.js 16 cacheComponents — async layouts cannot call cookies/headers
// without a Suspense boundary, and <html> sits above any such boundary.
const LANG_DEFAULT = DEFAULT_LOCALE;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={LANG_DEFAULT}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground grain">
        <ReactLenis root options={{ allowNestedScroll: true }}>
          <Suspense fallback={null}>
            <I18nProvider>
              <Header />
              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
                {children}
              </main>
              <Footer />
              <CommandPalette />
              <Toaster richColors position="top-center" />
            </I18nProvider>
          </Suspense>
        </ReactLenis>
      </body>
    </html>
  );
}
