import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Providers } from '@/lib/providers';
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: "LinkedIn Ghostwriter AI - Your LinkedIn Ghostwriter That Sounds Like You",
    template: "%s | LinkedIn Ghostwriter AI",
  },
  description: "Transform industry news, insights, and data into engaging LinkedIn posts in under 3 minutes. AI-powered content in your voice.",
  keywords: [
    "LinkedIn",
    "content creation",
    "AI writing",
    "ghostwriter",
    "social media",
    "content automation",
    "LinkedIn posts",
    "AI copywriting",
  ],
  authors: [{ name: "LinkedIn Ghostwriter AI" }],
  creator: "LinkedIn Ghostwriter AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.linkedinghostwriter-ai.com",
    siteName: "LinkedIn Ghostwriter AI",
    title: "LinkedIn Ghostwriter AI - Your LinkedIn Ghostwriter That Sounds Like You",
    description: "Transform industry news, insights, and data into engaging LinkedIn posts in under 3 minutes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LinkedIn Ghostwriter AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedIn Ghostwriter AI - Your LinkedIn Ghostwriter",
    description: "AI-powered LinkedIn content in your voice",
    images: ["/og-image.png"],
    creator: "@linkedghostai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
