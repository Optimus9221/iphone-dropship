import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iPhone Store | Cashback & Referral Program",
  description: "Buy new iPhones 15-17 with official warranty. Accumulate cashback toward a free iPhone. Referral program: $50 at 10 refs, $100 at 15, free iPhone at 20.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} min-h-screen antialiased font-sans`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
