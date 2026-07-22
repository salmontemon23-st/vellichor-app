"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV_FLAT } from "@/lib/docs-nav";

export function DocsPrevNext() {
  const pathname = usePathname();
  const idx = DOCS_NAV_FLAT.findIndex((item) => item.href === pathname);
  if (idx === -1) return null;

  const prev = idx > 0 ? DOCS_NAV_FLAT[idx - 1] : null;
  const next = idx < DOCS_NAV_FLAT.length - 1 ? DOCS_NAV_FLAT[idx + 1] : null;
  if (!prev && !next) return null;

  return (
    <div className="mt-16 grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-xl border border-line p-4 transition-colors hover:border-amber"
        >
          <p className="font-data text-xs uppercase tracking-wide text-ink-dim">← Previous</p>
          <p className="mt-1 font-medium text-ink transition-colors group-hover:text-amber-deep">
            {prev.label}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group rounded-xl border border-line p-4 text-right transition-colors hover:border-amber sm:col-start-2"
        >
          <p className="font-data text-xs uppercase tracking-wide text-ink-dim">Next →</p>
          <p className="mt-1 font-medium text-ink transition-colors group-hover:text-amber-deep">
            {next.label}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
