"use client";

import Link from "next/link";
import { useBottleMetadata } from "@/components/BottleCardOnChain";
import { ipfsToHttp } from "@/lib/ipfs";
import type { Holding } from "@/lib/hooks/usePortfolioData";

/** Compact row for the Dashboard's "Vaulted Assets" card — thumbnail, name, unit count only. */
export function VaultedAssetRow({ holding }: { holding: Holding }) {
  const meta = useBottleMetadata(holding.bottle.metadataURI);

  return (
    <Link
      href={`/vault/${holding.bottleId.toString()}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-panel-2"
    >
      {meta?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ipfsToHttp(meta.image)} alt={holding.bottle.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-lg bg-panel-2" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{holding.bottle.name}</p>
        <p className="text-xs text-ink-dim">{holding.units.toString()} unit(s)</p>
      </div>
    </Link>
  );
}
