"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ConnectWalletButton } from "./ConnectWalletButton";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/vault", label: "Vault" },
  { href: "/market", label: "Market" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <Image src="/vellichor-logo.png" alt="Vellichor" width={48} height={48} className="h-12 w-12" unoptimized />
          <span className="font-display text-lg font-normal tracking-tight text-ink">
            Vellichor
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-panel text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <ConnectWalletButton />
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-bg">
          <div className="container flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-panel"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2">
              <ConnectWalletButton full />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
