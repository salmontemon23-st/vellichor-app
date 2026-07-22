"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs-nav";
import { DocsThemeToggle } from "./DocsThemeToggle";

export function DocsSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  return (
    <nav className="lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-8rem)] lg:flex-col">
      <div className="flex flex-col gap-6 overflow-y-auto">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-ink"
        >
          ← App
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6M10 14 21 3" />
          </svg>
        </a>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-dim"
        />

        <div className="flex flex-col gap-8">
          {DOCS_NAV.map((group) => {
            const items = q
              ? group.items.filter((item) => item.label.toLowerCase().includes(q))
              : group.items;
            if (items.length === 0) return null;
            return (
              <div key={group.title}>
                <p className="eyebrow mb-3">{group.title}</p>
                <ul className="flex flex-col gap-1">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            active
                              ? "bg-amber/10 font-medium text-amber-deep"
                              : "text-ink-dim hover:text-ink"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-line pt-4 lg:mt-auto">
        <DocsThemeToggle />
      </div>
    </nav>
  );
}
