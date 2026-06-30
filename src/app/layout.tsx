import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bskyvideo.com - Download Bluesky Videos",
  description: "Fast, secure utility to download natively hosted media from the Bluesky social platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
