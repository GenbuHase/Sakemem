import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { GaNoticeBanner } from "@/components/analytics/ga-notice-banner";
import { Header } from "@/components/header";
import { HeaderGate } from "@/components/header-gate";
import { SerwistProvider } from "@/components/serwist-provider";
import { defaultDescription, getMetadataBase, siteName } from "@/lib/metadata/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: siteName,
  title: { default: siteName, template: "%s" },
  description: defaultDescription,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <SerwistProvider swUrl="/serwist/sw.js">
          <HeaderGate>
            <Header />
          </HeaderGate>
          {children}
          <GaNoticeBanner enabled={Boolean(gaId)} />
        </SerwistProvider>
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
