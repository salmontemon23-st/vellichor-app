"use client";

import { useEffect, useState } from "react";

export function DocsThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("docs-theme") === "light") {
      document.documentElement.classList.remove("docs-dark");
      setDark(false);
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("docs-dark", next);
    localStorage.setItem("docs-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle docs theme"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-dim transition-colors hover:text-ink"
    >
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
