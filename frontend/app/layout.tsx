import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaintenanceProvider from "@/components/MaintenanceProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Currency Swap - Next-Gen Liquidity Protocol",
    template: "%s | Currency Swap"
  },
  description: "Near-zero latency currency conversion with institutional-grade risk parameters. Built for the modern global economy. Real-time exchange rates for 190+ countries.",
  keywords: ["currency", "exchange", "conversion", "forex", "swap", "finance", "trading", "rates"],
  authors: [{ name: "Currency Swap Team" }],
  creator: "Currency Swap",
  publisher: "Currency Swap",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://currencyswap.com",
    siteName: "Currency Swap",
    title: "Currency Swap - Next-Gen Liquidity Protocol",
    description: "Near-zero latency currency conversion with institutional-grade risk parameters.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Currency Swap Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Currency Swap - Next-Gen Liquidity Protocol",
    description: "Near-zero latency currency conversion with institutional-grade risk parameters.",
    images: ["/og-image.png"],
    creator: "@currencyswap"
  },
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://currencyswap.com"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366f1",
  colorScheme: "dark"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
