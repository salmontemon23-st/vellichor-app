"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  VELLICHOR_MARKET_ABI,
  VELLICHOR_MARKET_ADDRESS,
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
  HIDDEN_BOTTLE_IDS,
  type OnChainListing,
  type OnChainBottle,
} from "@/lib/contracts";
import { ipfsToHttp } from "@/lib/ipfs";
import { bottleStatus, bottleSubtitle, percentClaimedOnChain, useBottleMetadata } from "./BottleCardOnChain";
import { BottleGauge } from "./BottleGauge";
import { BottlePhotoCard } from "./BottlePhotoCard";
import { BuyListingPanel } from "./BuyListingPanel";
import { AcquirePanel } from "./AcquirePanel";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { useBottleCategories } from "@/lib/useBottleCategories";
import { useEventTimestamps } from "@/lib/useEventTimestamps";

type MarketEntry = {
  key: string;
  kind: "primary" | "secondary";
  bottle: OnChainBottle;
  listing: OnChainListing | null;
  unitsAvailable: bigint;
  pricePerUnit: bigint;
  timestamp: number | undefined;
};

/** Links to the exact listing that was clicked, not just the bottle — the
 * item detail page uses these params to decide which listing to show,
 * instead of always defaulting back to primary. */
function entryHref(entry: MarketEntry) {
  const base = `/market/${entry.bottle.bottleId.toString()}`;
  if (entry.kind === "primary") return `${base}?type=primary`;
  return `${base}?listing=${entry.listing!.listingId.toString()}`;
}

type ListingTypeFilter = "all" | "primary" | "secondary";
const LISTING_TYPE_LABEL: Record<ListingTypeFilter, string> = {
  all: "All listings",
  primary: "Primary",
  secondary: "Secondary",
};

type SortOrder = "newest" | "price-asc" | "price-desc" | "claimed";
const SORT_LABEL: Record<SortOrder, string> = {
  newest: "Newest",
  "price-asc": "Price: Low to high",
  "price-desc": "Price: High to low",
  claimed: "% Claimed",
};

type TimeWindow = "all" | "24h" | "7d";
const TIME_WINDOWS: TimeWindow[] = ["all", "24h", "7d"];
const TIME_WINDOW_LABEL: Record<TimeWindow, string> = { all: "All", "24h": "24h", "7d": "7d" };
const TIME_WINDOW_SECONDS: Record<string, number> = { "24h": 86400, "7d": 604800 };

function KindBadge({ kind }: { kind: "primary" | "secondary" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        kind === "primary" ? "bg-amber/10 text-amber-deep" : "bg-ink/10 text-ink-dim"
      }`}
    >
      {kind === "primary" ? "Primary" : "Secondary"}
    </span>
  );
}

function EntryImage({ bottle, size }: { bottle: OnChainBottle; size: number }) {
  const meta = useBottleMetadata(bottle.metadataURI, bottle.bottleId);
  if (meta?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ipfsToHttp(meta.image)}
        alt={bottle.name}
        style={{ height: size, width: size }}
        className="shrink-0 rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="flex shrink-0 items-center justify-center" style={{ height: size, width: size }}>
      <BottleGauge percent={percentClaimedOnChain(bottle)} height={size} />
    </div>
  );
}

function EntryCard({ entry, onBuySecondary }: { entry: MarketEntry; onBuySecondary: (l: OnChainListing) => void }) {
  const { address } = useAccount();
  const meta = useBottleMetadata(entry.bottle.metadataURI, entry.bottle.bottleId);
  const [buyingPrimary, setBuyingPrimary] = useState(false);
  const isOwnListing =
    entry.kind === "secondary" &&
    !!address &&
    !!entry.listing &&
    address.toLowerCase() === entry.listing.seller.toLowerCase();

  return (
    <>
      <BottlePhotoCard
        href={entryHref(entry)}
        imageUrl={meta?.image ? ipfsToHttp(meta.image) : undefined}
        fallbackPercent={percentClaimedOnChain(entry.bottle)}
        name={entry.bottle.name}
        subtitle={bottleSubtitle(meta)}
        priceLabel={`${formatUnits(entry.pricePerUnit, PAYMENT_TOKEN_DECIMALS)} ${PAYMENT_TOKEN_SYMBOL} / unit`}
        percentClaimed={percentClaimedOnChain(entry.bottle)}
        badge={<KindBadge kind={entry.kind} />}
        buyNow={
          isOwnListing
            ? null
            : {
                onClick: () =>
                  entry.kind === "primary" ? setBuyingPrimary(true) : entry.listing && onBuySecondary(entry.listing),
              }
        }
      />

      {buyingPrimary && <AcquirePanel bottle={entry.bottle} onClose={() => setBuyingPrimary(false)} />}
    </>
  );
}

function EntryRow({ entry, onBuySecondary }: { entry: MarketEntry; onBuySecondary: (l: OnChainListing) => void }) {
  const { address } = useAccount();
  const [buyingPrimary, setBuyingPrimary] = useState(false);
  const isOwnListing =
    entry.kind === "secondary" &&
    !!address &&
    !!entry.listing &&
    address.toLowerCase() === entry.listing.seller.toLowerCase();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-panel p-3 sm:gap-5 sm:p-4">
      <Link href={entryHref(entry)} className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
        <EntryImage bottle={entry.bottle} size={56} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <KindBadge kind={entry.kind} />
          </div>
          <h3 className="mt-1 truncate font-display text-base font-normal text-ink hover:text-amber-deep sm:text-lg">
            {entry.bottle.name}
          </h3>
        </div>
      </Link>

      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-ink-dim">Price / unit</p>
        <p className="font-data text-sm font-semibold text-ink">
          {formatUnits(entry.pricePerUnit, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL}
        </p>
      </div>

      <div className="hidden shrink-0 text-right md:block">
        <p className="text-xs text-ink-dim">Available</p>
        <p className="font-data text-sm text-ink">{entry.unitsAvailable.toString()} units</p>
      </div>

      {entry.kind === "primary" ? (
        <button
          onClick={() => setBuyingPrimary(true)}
          className="shrink-0 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Buy
        </button>
      ) : isOwnListing ? (
        <Link
          href="/portfolio"
          className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-dim hover:text-ink"
        >
          Your listing
        </Link>
      ) : (
        <button
          onClick={() => entry.listing && onBuySecondary(entry.listing)}
          className="shrink-0 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Buy
        </button>
      )}

      {buyingPrimary && <AcquirePanel bottle={entry.bottle} onClose={() => setBuyingPrimary(false)} />}
    </div>
  );
}

export function MarketListings() {
  const [buyingListing, setBuyingListing] = useState<OnChainListing | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [listingType, setListingType] = useState<ListingTypeFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("all");
  const [view, setView] = useState<ViewMode>("grid");

  const {
    data: bottleData,
    isLoading: bottlesLoading,
    isError: bottlesError,
    error: bottlesErrorObj,
  } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "getAllBottles",
    query: { enabled: contractsConfigured, refetchInterval: 15000 },
  });

  const {
    data: listingData,
    isLoading: listingsLoading,
    isError: listingsError,
    error: listingsErrorObj,
  } = useReadContract({
    address: VELLICHOR_MARKET_ADDRESS,
    abi: VELLICHOR_MARKET_ABI,
    functionName: "getActiveListings",
    query: { enabled: contractsConfigured, refetchInterval: 15000 },
  });

  const bottles = useMemo<OnChainBottle[]>(() => {
    if (!bottleData) return [];
    const [structs, ids] = bottleData as [Omit<OnChainBottle, "bottleId">[], bigint[]];
    return structs
      .map((b, i) => ({ ...b, bottleId: ids[i] }))
      .filter((b) => !HIDDEN_BOTTLE_IDS.has(b.bottleId));
  }, [bottleData]);

  const bottleById = useMemo(() => {
    const map = new Map<string, OnChainBottle>();
    for (const b of bottles) map.set(b.bottleId.toString(), b);
    return map;
  }, [bottles]);

  const listings = useMemo<OnChainListing[]>(() => {
    if (!listingData) return [];
    const [structs, ids] = listingData as [Omit<OnChainListing, "listingId">[], bigint[]];
    return structs.map((l, i) => ({ ...l, listingId: ids[i] }));
  }, [listingData]);

  const categories = useBottleCategories(bottles);
  const listedAt = useEventTimestamps(VELLICHOR_VAULT_ADDRESS, VELLICHOR_VAULT_ABI, "BottleListed", "bottleId");
  const postedAt = useEventTimestamps(VELLICHOR_MARKET_ADDRESS, VELLICHOR_MARKET_ABI, "Listed", "listingId");

  const categoryOptions = useMemo(
    () => [...new Set(Object.values(categories))].sort((a, b) => a.localeCompare(b)),
    [categories]
  );

  const entries = useMemo<MarketEntry[]>(() => {
    const primary: MarketEntry[] = bottles
      .filter((b) => bottleStatus(b) === "available")
      .map((b) => ({
        key: `primary-${b.bottleId}`,
        kind: "primary" as const,
        bottle: b,
        listing: null,
        unitsAvailable: b.totalUnits - b.unitsSold,
        pricePerUnit: b.pricePerUnit,
        timestamp: listedAt[b.bottleId.toString()],
      }));

    const secondary: MarketEntry[] = listings
      .map((l): MarketEntry | null => {
        const bottle = bottleById.get(l.bottleId.toString());
        if (!bottle) return null;
        return {
          key: `secondary-${l.listingId}`,
          kind: "secondary",
          bottle,
          listing: l,
          unitsAvailable: l.unitsForSale,
          pricePerUnit: l.pricePerUnit,
          timestamp: postedAt[l.listingId.toString()],
        };
      })
      .filter((e): e is MarketEntry => e !== null);

    return [...primary, ...secondary];
  }, [bottles, listings, bottleById, listedAt, postedAt]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const nowSec = Math.floor(Date.now() / 1000);

    const result = entries.filter((e) => {
      if (listingType !== "all" && e.kind !== listingType) return false;
      if (category !== "all" && categories[e.bottle.bottleId.toString()] !== category) return false;
      if (query && !e.bottle.name.toLowerCase().includes(query)) return false;
      if (timeWindow !== "all") {
        if (e.timestamp === undefined) return false;
        if (nowSec - e.timestamp > TIME_WINDOW_SECONDS[timeWindow]) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sort === "price-asc") {
      sorted.sort((a, b) => (a.pricePerUnit < b.pricePerUnit ? -1 : a.pricePerUnit > b.pricePerUnit ? 1 : 0));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => (a.pricePerUnit > b.pricePerUnit ? -1 : a.pricePerUnit < b.pricePerUnit ? 1 : 0));
    } else if (sort === "claimed") {
      sorted.sort((a, b) => percentClaimedOnChain(b.bottle) - percentClaimedOnChain(a.bottle));
    } else {
      sorted.sort((a, b) => {
        if (a.timestamp !== undefined && b.timestamp !== undefined && a.timestamp !== b.timestamp) {
          return b.timestamp - a.timestamp;
        }
        if (a.timestamp !== undefined && b.timestamp === undefined) return -1;
        if (a.timestamp === undefined && b.timestamp !== undefined) return 1;
        return a.bottle.bottleId > b.bottle.bottleId ? -1 : a.bottle.bottleId < b.bottle.bottleId ? 1 : 0;
      });
    }

    // Under the combined "All" view only, a bottle's primary listing is
    // pinned ahead of any secondary listings for that same bottle — the
    // chosen sort still governs ordering within each group. Moot (and
    // skipped) when the filter is already Primary-only or Secondary-only.
    if (listingType === "all") {
      sorted.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "primary" ? -1 : 1));
    }

    return sorted;
  }, [entries, listingType, category, search, timeWindow, categories, sort]);

  const isLoading = bottlesLoading || listingsLoading;

  if (!contractsConfigured) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Market contract address is not configured yet. Set NEXT_PUBLIC_VELLICHOR_MARKET_ADDRESS once
        the Robinhood Chain mainnet deployment is live.
      </p>
    );
  }

  if (bottlesError || listingsError) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-wine/40 p-8 text-center text-sm text-wine">
        Could not read the Market: {(bottlesErrorObj ?? listingsErrorObj)?.message ?? "unknown error"}
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
          value={listingType}
          onChange={(e) => setListingType(e.target.value as ListingTypeFilter)}
          className="rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink font-data"
        >
          {(Object.keys(LISTING_TYPE_LABEL) as ListingTypeFilter[]).map((t) => (
            <option key={t} value={t}>
              {LISTING_TYPE_LABEL[t]}
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

        <div className="flex items-center gap-1 rounded-lg border border-line bg-panel p-1">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setTimeWindow(w)}
              className={`rounded-md px-2.5 py-1 font-data text-xs font-medium transition-colors ${
                timeWindow === w ? "bg-amber/10 text-amber-deep" : "text-ink-dim hover:text-ink"
              }`}
            >
              {TIME_WINDOW_LABEL[w]}
            </button>
          ))}
        </div>

        <ViewToggle view={view} onChange={setView} />

        <span className="ml-auto text-sm text-ink-dim font-data">
          {isLoading ? "Loading…" : `${filtered.length} listing${filtered.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-ink-dim">Loading listings…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          {entries.length === 0
            ? "No Vault Units are currently available. List units from your Portfolio to see them here."
            : "No listings match these filters."}
        </p>
      ) : view === "grid" ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <EntryCard key={entry.key} entry={entry} onBuySecondary={setBuyingListing} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {filtered.map((entry) => (
            <EntryRow key={entry.key} entry={entry} onBuySecondary={setBuyingListing} />
          ))}
        </div>
      )}

      {buyingListing && <BuyListingPanel listing={buyingListing} onClose={() => setBuyingListing(null)} />}
    </div>
  );
}
