import type { Metadata } from "next";
import "../globals.css";
import { fraunces, inter, plexMono } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Vellichor — Own rare whiskey and fine wine as RWAs",
  description:
    "Vellichor is an RWA protocol for rare whiskey and fine wine, built on Robinhood Chain. Every bottle is authenticated, insured, and vaulted before a single unit is sold.",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
