import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plinko Lab - Provably Fair Game",
  description:
    "Play Plinko with provably fair deterministic outcomes. Verify every result!",
  keywords: ["plinko", "provably fair", "blockchain", "game", "gambling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {children}
      </body>
    </html>
  );
}
