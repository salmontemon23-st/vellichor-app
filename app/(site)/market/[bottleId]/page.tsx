import { Suspense } from "react";
import MarketItemDetailClient from "./MarketItemDetailClient";

export default function MarketItemDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-16">
          <p className="text-sm text-ink-dim">Loading…</p>
        </div>
      }
    >
      <MarketItemDetailClient />
    </Suspense>
  );
}
