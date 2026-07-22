"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  BottleCardOnChain,
  bottleStatus,
  percentClaimedOnChain,
  useBottleMetadata,
  type OnChainStatus,
  STATUS_CLASS,
  STATUS_LABEL,
} from "./BottleCardOnChain";
import { BottleGauge } from "./BottleGauge";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { RevenueFlywheelBanner } from "./RevenueFlywheelBanner";
import { ipfsToHttp } from "@/lib/ipfs";
import { useBottleCategories } from "@/lib/useBottleCategories";
import { useEventTimestamps } from "@/lib/useEventTimestamps";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
  HIDDEN_BOTTLE_IDS,
  type OnChainBottle,
} from "@/lib/contracts";

const STATUSES: OnChainStatus[] = ["available", "sold-out", "redeemed"];

type SortOrder = "newest" | "name" | "value";

const SORT_LABEL: Record<SortOrder, string> = {
  newest: "Newest",
  name: "Name (A–Z)",
  value: "Total value",
};

function BottleRow({ bottle }: { bottle: OnChainBottle }) {
  const meta = useBottleMetadata(bottle.metadataURI, bottle.bottleId);
  const status = bottleStatus(bottle);
  const pct = percentClaimedOnChain(bottle);
  const price = formatUnits(bottle.pricePerUnit, PAYMENT_TOKEN_DECIMALS);
  const category = meta?.attributes?.find((a) => a.trait_type === "Category")?.value ?? "Vault Unit";

  return (
    <Link
      href={`/vault/${bottle.bottleId.toString()}`}
      className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-3 transition-colors hover:border-amber sm:gap-5 sm:p-4"
    >
      {meta?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ipfsToHttp(meta.image)}
          alt={bottle.name}
          className="h-14 w-14 shrink-0 rounded-lg object-cover sm:h-16 sm:w-16"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
          <BottleGauge percent={pct} height={56} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-data text-xs uppercase tracking-wide text-ink-dim">{category}</p>
        <h3 className="truncate font-display text-base font-normal text-ink group-hover:text-amber-deep transition-colors sm:text-lg">
          {bottle.name}
        </h3>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-ink-dim">Price / unit</p>
        <p className="font-data text-sm font-semibold text-ink">
          {price} {PAYMENT_TOKEN_SYMBOL}
        </p>
      </div>

      <div className="hidden shrink-0 text-right md:block">
        <p className="text-xs text-ink-dim">Units</p>
        <p className="font-data text-sm text-ink">
          {bottle.unitsSold.toString()}/{bottle.totalUnits.toString()} ({pct}%)
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </Link>
  );
}

export function VaultGridOnChain() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<OnChainStatus | "all">("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [view, setView] = useState<ViewMode>("grid");

  const { data, isLoading, isError, error } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "getAllBottles",
    query: { enabled: contractsConfigured, refetchInterval: 15000 },
  });

  const bottles = useMemo<OnChainBottle[]>(() => {
    if (!data) return [];
    const [structs, ids] = data as [Omit<OnChainBottle, "bottleId">[], bigint[]];
    return structs
      .map((b, i) => ({ ...b, bottleId: ids[i] }))
      .filter((b) => !HIDDEN_BOTTLE_IDS.has(b.bottleId));
  }, [data]);

  const categories = useBottleCategories(bottles);
  const vaultedAt = useEventTimestamps(VELLICHOR_VAULT_ADDRESS, VELLICHOR_VAULT_ABI, "BottleListed", "bottleId");

  const categoryOptions = useMemo(
    () => [...new Set(Object.values(categories))].sort((a, b) => a.localeCompare(b)),
    [categories]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = bottles.filter((b) => {
      if (status !== "all" && bottleStatus(b) !== status) return false;
      if (category !== "all" && categories[b.bottleId.toString()] !== category) return false;
      if (query && !b.name.toLowerCase().includes(query)) return false;
      return true;
    });

    const sorted = [...result];
    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "value") {
      sorted.sort((a, b) => {
        const av = a.totalUnits * a.pricePerUnit;
        const bv = b.totalUnits * b.pricePerUnit;
        return av > bv ? -1 : av < bv ? 1 : 0;
      });
    } else {
      sorted.sort((a, b) => {
        const at = vaultedAt[a.bottleId.toString()];
        const bt = vaultedAt[b.bottleId.toString()];
        if (at !== undefined && bt !== undefined && at !== bt) return bt - at;
        return a.bottleId > b.bottleId ? -1 : a.bottleId < b.bottleId ? 1 : 0;
      });
    }
    return sorted;
  }, [bottles, status, category, search, sort, categories, vaultedAt]);

  if (!contractsConfigured) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Vault contract address is not configured yet. Set NEXT_PUBLIC_VELLICHOR_VAULT_ADDRESS once
        the Robinhood Chain mainnet deployment is live.
      </p>
    );
  }

  if (isError) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-wine/40 p-8 text-center text-sm text-wine">
        Could not read the Vault contract: {error?.message ?? "unknown error"}
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bottles…"
          className="min-w-[180px] flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink placeholder:text-ink-dim sm:flex-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink font-data"
        >
          <option value="all">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OnChainStatus | "all")}
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink font-data"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink font-data"
        >
          {(Object.keys(SORT_LABEL) as SortOrder[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>

        <ViewToggle view={view} onChange={setView} />

        <span className="ml-auto text-sm text-ink-dim font-data">
          {isLoading ? "Loading…" : `${filtered.length} bottle${filtered.length === 1 ? "" : "s"}`}
        </span>
      </div>

      <RevenueFlywheelBanner />

      {!isLoading && filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-dim">
          {bottles.length === 0
            ? "No bottles in the Vault yet. Once a bottle is minted on-chain it will appear here."
            : "No bottles match these filters."}
        </p>
      ) : view === "grid" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bottle) => (
            <BottleCardOnChain key={bottle.bottleId.toString()} bottle={bottle} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {filtered.map((bottle) => (
            <BottleRow key={bottle.bottleId.toString()} bottle={bottle} />
          ))}
        </div>
      )}
    </div>
  );
}
