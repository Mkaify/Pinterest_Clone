import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/providers/auth-provider";
import Sidebar from "@/components/navbar/sidebar";
import Navbar from "@/components/navbar/navbar";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Pinterest Clone",
    template: "%s | Pinterest Clone"
  },
  description: "Discover and save creative ideas. A Pinterest clone built with Next.js and advanced technologies",
  keywords: ["pinterest", "pins", "inspiration", "ideas", "creativity", "social media"],
  authors: [{ name: "Pinterest Clone Team" }],
  creator: "Pinterest Clone",
  publisher: "Pinterest Clone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo-192.png',
      },
    ],
  },
  manifest: '/manifest.json',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "Pinterest Clone",
    description: "Discover and save creative ideas",
    url: 'http://localhost:3000',
    siteName: 'Pinterest Clone',
    images: [
      {
        url: '/favicon.svg',
        width: 800,
        height: 600,
        alt: 'Pinterest Clone Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinterest Clone',
    description: 'Discover and save creative ideas',
    images: ['/favicon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#E60023" />
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn("min-h-screen bg-white font-sans antialiased")} suppressHydrationWarning>
        <AuthProvider>
          <Sidebar />
          <Navbar />
          <main className="ml-16 pt-16">
            {children}
          </main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
