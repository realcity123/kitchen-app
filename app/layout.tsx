import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyKitchenUpgrade — Quote Portal",
  description: "Internal quote management for MyKitchenUpgrade.ca",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#F5F0E8] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
