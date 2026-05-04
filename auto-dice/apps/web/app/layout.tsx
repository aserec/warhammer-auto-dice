import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Warhammer Auto Dice",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WHAD",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "180x180" }],
  },
  title: {
    default: "Warhammer Auto Dice",
    template: "%s · Warhammer Auto Dice",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans text-base leading-relaxed">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
