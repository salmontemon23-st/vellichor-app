"use client";

import { useEffect, useState } from "react";
import { fetchBottleMetadata } from "./ipfs";
import { BOTTLE_CONTENT_OVERRIDES } from "./bottle-content";
import type { OnChainBottle } from "./contracts";

/**
 * Resolves each bottle's "Category" attribute (from IPFS metadata, filled in
 * by the local override in bottle-content.ts when metadata is missing) so
 * Vault/Market can offer a category filter without every card needing to
 * mount and fetch metadata itself first. fetchBottleMetadata caches by URI,
 * so this doesn't cause extra network requests beyond what cards already do.
 */
export function useBottleCategories(bottles: OnChainBottle[]) {
  const [categories, setCategories] = useState<Record<string, string>>({});
  const key = bottles.map((b) => b.bottleId.toString()).join(",");

  useEffect(() => {
    let active = true;

    Promise.all(
      bottles.map(async (b) => {
        const fetched = await fetchBottleMetadata(b.metadataURI);
        const override = BOTTLE_CONTENT_OVERRIDES[b.bottleId.toString()];
        const merged = override ? { ...override, ...fetched } : fetched;
        const category = merged?.attributes?.find((a) => a.trait_type === "Category")?.value;
        return [b.bottleId.toString(), category] as const;
      })
    ).then((entries) => {
      if (!active) return;
      const map: Record<string, string> = {};
      for (const [id, category] of entries) {
        if (category) map[id] = category;
      }
      setCategories(map);
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return categories;
}
