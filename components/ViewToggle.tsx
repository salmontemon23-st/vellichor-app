export type ViewMode = "grid" | "list";

function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="2" width="14" height="2.5" rx="1" />
      <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
      <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
    </svg>
  );
}

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
      {(["grid", "list"] as ViewMode[]).map((v) => (
        <button
          key={v}
          type="button"
          aria-label={v === "grid" ? "Grid view" : "List view"}
          aria-pressed={view === v}
          onClick={() => onChange(v)}
          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
            view === v ? "bg-amber/10 text-amber-deep" : "text-ink-dim hover:text-ink"
          }`}
        >
          {v === "grid" ? <GridIcon /> : <ListIcon />}
        </button>
      ))}
    </div>
  );
}
