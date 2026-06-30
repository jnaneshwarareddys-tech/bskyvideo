import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bluesky Video Downloader | Download Bsky Videos Free",
  description: "The fastest, free Bluesky video downloader. Download Bluesky videos and GIFs in HD MP4 format directly to your iPhone, Android, or PC without watermarks.",
  keywords: "bluesky video downloader, download bsky video, bluesky downloader, save bluesky videos, bsky video download, bluesky gif downloader, bskyvideo",
  alternates: {
    canonical: 'https://bskyvideo.com',
  },
  openGraph: {
    title: "Bluesky Video Downloader",
    description: "Download Bluesky videos and GIFs instantly in MP4 format. 100% free, fast, and secure.",
    url: "https://bskyvideo.com",
    siteName: "bskyvideo.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bluesky Video Downloader",
    description: "Download Bluesky videos and GIFs instantly in MP4 format.",
  },
  verification: {
    google: "HZLyisr0p1jHR0Q1GIOQIxz5KuacxpQza333QIWtGo8",
  },
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
