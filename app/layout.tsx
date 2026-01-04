import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Footer from "@/components/Footer";
import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = defaultMetadata;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-background text-foreground`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
