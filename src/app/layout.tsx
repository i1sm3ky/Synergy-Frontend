import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synergy AI",
  description: "Synergy AI - Space optimization and allocation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
