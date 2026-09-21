import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carousel Examples by Lead Gen Man",
  description: "Carousel examples by Lead Gen Man",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
