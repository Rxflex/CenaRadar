import { ReactLenis } from "lenis/react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { I18nProvider } from "@/components/i18n-provider";
import { Toaster } from "@/components/ui/sonner";
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
    locale: "ru_RU",
    alternateLocale: ["cs_CZ", "en_US"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
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
