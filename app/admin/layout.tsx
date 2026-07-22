import type { Metadata } from "next";
import "../globals.css";
import { fraunces, inter, plexMono } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export const metadata: Metadata = {
  title: "Vellichor — Internal Admin",
  robots: { index: false, follow: false },
};

// Internal tool — not linked from the public nav. Access is enforced by an
// on-chain wallet-role check on each page (see lib/hooks/useIsAuditor.ts),
// not just by this route being unlinked.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <Providers>
          <header className="border-b border-line">
            <div className="container flex h-16 items-center justify-between">
              <span className="font-display text-lg font-normal text-ink">
                Vellichor <span className="text-ink-dim">— Internal Admin</span>
              </span>
              <ConnectWalletButton />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
