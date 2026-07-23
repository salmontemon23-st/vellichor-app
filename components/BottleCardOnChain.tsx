"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { BottlePhotoCard } from "./BottlePhotoCard";
import { AcquirePanel } from "./AcquirePanel";
import { PAYMENT_TOKEN_DECIMALS, PAYMENT_TOKEN_SYMBOL, type OnChainBottle } from "@/lib/contracts";
import { fetchBottleMetadata, ipfsToHttp, type BottleMetadata } from "@/lib/ipfs";
import { BOTTLE_CONTENT_OVERRIDES } from "@/lib/bottle-content";

export type OnChainStatus = "available" | "sold-out" | "redeemed";

export function bottleStatus(bottle: Pick<OnChainBottle, "redeemed" | "unitsSold" | "totalUnits">): OnChainStatus {
  if (bottle.redeemed) return "redeemed";
  if (bottle.unitsSold >= bottle.totalUnits) return "sold-out";
  return "available";
}

export function percentClaimedOnChain(bottle: Pick<OnChainBottle, "unitsSold" | "totalUnits">): number {
  if (bottle.totalUnits === 0n) return 0;
  return Math.round((Number(bottle.unitsSold) / Number(bottle.totalUnits)) * 100);
}

/** "Category | Volume | ABV" line for card subtitles, e.g. "American Style Whiskey | 700ml | 54.5% ABV". */
export function bottleSubtitle(meta: BottleMetadata | null): string {
  const attrs = meta?.attributes;
  if (!attrs) return "";
  const category = attrs.find((a) => a.trait_type === "Category")?.value;
  // Different bottles' metadata use either "Volume" or "Size" for the same thing.
  const volume = attrs.find((a) => a.trait_type === "Volume" || a.trait_type === "Size")?.value;
  const abv = attrs.find((a) => a.trait_type === "ABV")?.value;
  return [category, volume, abv ? `${abv} ABV` : undefined].filter((part): part is string => !!part).join(" | ");
}

export const STATUS_LABEL: Record<OnChainStatus, string> = {
  available: "Available",
  "sold-out": "Sold Out",
  redeemed: "Redeemed",
};

export const STATUS_CLASS: Record<OnChainStatus, string> = {
  available: "bg-amber/10 text-amber-deep",
  "sold-out": "bg-ink/10 text-ink-dim",
  redeemed: "bg-wine/10 text-wine",
};

export function useBottleMetadata(metadataURI: string, bottleId?: bigint) {
  const [meta, setMeta] = useState<BottleMetadata | null>(null);
  useEffect(() => {
    let active = true;
    fetchBottleMetadata(metadataURI).then((m) => {
      if (active) setMeta(m);
    });
    return () => {
      active = false;
    };
  }, [metadataURI]);

  const override = bottleId !== undefined ? BOTTLE_CONTENT_OVERRIDES[bottleId.toString()] : undefined;
  if (!override) return meta;
  return { ...override, ...meta };
}

export function BottleCardOnChain({ bottle }: { bottle: OnChainBottle }) {
  const meta = useBottleMetadata(bottle.metadataURI, bottle.bottleId);
  const status = bottleStatus(bottle);
  const pct = percentClaimedOnChain(bottle);
  const price = formatUnits(bottle.pricePerUnit, PAYMENT_TOKEN_DECIMALS);
  const [showBuy, setShowBuy] = useState(false);

  return (
    <>
      <BottlePhotoCard
        href={`/vault/${bottle.bottleId.toString()}`}
        imageUrl={meta?.image ? ipfsToHttp(meta.image) : undefined}
        fallbackPercent={pct}
        name={bottle.name}
        subtitle={bottleSubtitle(meta)}
        priceLabel={`${price} ${PAYMENT_TOKEN_SYMBOL} / unit`}
        percentClaimed={pct}
        revealAt={meta?.revealAt}
        badge={
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${STATUS_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        }
        buyNow={status === "available" ? { onClick: () => setShowBuy(true) } : null}
      />
      {showBuy && <AcquirePanel bottle={bottle} onClose={() => setShowBuy(false)} />}
    </>
  );
}
