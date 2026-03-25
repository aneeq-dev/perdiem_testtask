import type { Metadata, Viewport } from "next";
import { Aboreto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const aboreto = Aboreto({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Per Diem Menu Browser",
  description: "Mobile-first Square menu browser by location and category",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${aboreto.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
