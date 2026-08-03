// src/app/layout.tsx

import type { Metadata } from "next";

import "./globals.css";
import { ToastProvider } from "@/components-general/ui/ToastProvider";

export const metadata: Metadata = {
  title: "BSP Digital Platform",
  description:
    "Membership registration and scouting journey platform",
  icons: {
    icon: "/bsp-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}