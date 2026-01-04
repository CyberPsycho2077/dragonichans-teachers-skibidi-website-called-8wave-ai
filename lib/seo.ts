import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://8wave.ai"),
  title: {
    default: "8wave - AI-Powered Solutions",
    template: "%s | 8wave",
  },
  description:
    "Building the future of AI-powered solutions. Discover innovative tools and services designed to transform your business.",
  keywords: ["AI", "artificial intelligence", "8wave", "technology", "innovation"],
  authors: [{ name: "8wave" }],
  creator: "8wave",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://8wave.ai",
    siteName: "8wave",
    title: "8wave - AI-Powered Solutions",
    description:
      "Building the future of AI-powered solutions. Discover innovative tools and services designed to transform your business.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "8wave",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "8wave - AI-Powered Solutions",
    description:
      "Building the future of AI-powered solutions. Discover innovative tools and services designed to transform your business.",
    images: ["/og-image.png"],
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
};
