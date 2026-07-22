"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Heading = { id: string; text: string; level: 2 | 3 };

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DocsToc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const content = document.getElementById("docs-content");
    if (!content) return;

    const els = Array.from(content.querySelectorAll<HTMLHeadingElement>("h2, h3"));
    const items: Heading[] = els.map((el) => {
      if (!el.id) el.id = slugify(el.textContent || "");
      return { id: el.id, text: el.textContent || "", level: el.tagName === "H3" ? 3 : 2 };
    });
    setHeadings(items);
    setActiveId(items[0]?.id ?? "");

    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
      <p className="eyebrow mb-3">On this page</p>
      <ul className="flex flex-col gap-2 border-l border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l-2 py-0.5 text-sm transition-colors ${
                h.level === 3 ? "pl-6" : "pl-3"
              } ${
                activeId === h.id
                  ? "border-amber font-medium text-ink"
                  : "border-transparent text-ink-dim hover:text-ink"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
