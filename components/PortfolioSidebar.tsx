"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

const PORTFOLIO_NAV = [
  { href: "/portfolio", label: "Dashboard" },
  { href: "/portfolio/holdings", label: "Holdings" },
  { href: "/portfolio/listings", label: "Listings" },
  { href: "/portfolio/activity", label: "Activity" },
  { href: "/portfolio/settings", label: "Settings" },
];

export function PortfolioSidebar() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  return (
    <nav className="min-h-full rounded-2xl bg-panel-2 p-5 lg:sticky lg:top-24">
      <div className="rounded-xl px-2 py-5">
        <p className="truncate text-base font-medium text-ink">
          {isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Guest"}
        </p>
        <Link
          href="/portfolio/settings"
          className="mt-2 inline-block text-xs text-ink-dim hover:text-amber-deep"
        >
          Account settings →
        </Link>
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {PORTFOLIO_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-xl px-4 py-3 text-sm transition-colors ${
                  active ? "bg-panel font-medium text-amber-deep shadow-sm" : "text-ink-dim hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
