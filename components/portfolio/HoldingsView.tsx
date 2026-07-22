"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortfolioData, type Holding } from "@/lib/hooks/usePortfolioData";
import { useLatestTradePrices } from "@/lib/hooks/useLatestTradePrices";
import { useWalletModal } from "@/lib/wallet-modal";
import { contractsConfigured } from "@/lib/contracts";
import { fetchBottleMetadata } from "@/lib/ipfs";
import { PortfolioEmptyState } from "@/components/PortfolioEmptyState";
import { HoldingCard } from "@/components/portfolio/HoldingCard";
import { RedeemModal } from "@/components/portfolio/RedeemModal";
import { ListForSaleModal } from "@/components/portfolio/ListForSaleModal";
import { RedemptionFulfillmentForm } from "@/components/RedemptionFulfillmentForm";
import { usePendingRedemptions } from "@/lib/hooks/usePendingRedemptions";

type SortOption = "featured" | "name" | "units" | "value";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Sort: Featured",
  name: "Sort: Name",
  units: "Sort: Units held",
  value: "Sort: Est. value",
};

export function HoldingsView() {
  const { address, isConnected, isPortfolioLoading, holdings, refetchPortfolio } = usePortfolioData();
  const { open } = useWalletModal();
  const { pendingRedemptions, setPendingRedemptions } = usePendingRedemptions(address);
  const [redeeming, setRedeeming] = useState<Holding | null>(null);
  const [listing, setListing] = useState<Holding | null>(null);
  const [fulfilling, setFulfilling] = useState<{ bottleId: bigint; bottleName: string } | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [categoryByBottleId, setCategoryByBottleId] = useState<Map<string, string>>(new Map());

  const bottleIds = holdings.map((h) => h.bottleId);
  const { prices: tradePrices } = useLatestTradePrices(bottleIds);

  useEffect(() => {
    let active = true;
    Promise.all(
      holdings.map(async (h) => {
        const meta = await fetchBottleMetadata(h.bottle.metadataURI);
        const cat = meta?.attributes?.find((a) => a.trait_type === "Category")?.value ?? "Vault Unit";
        return [h.bottleId.toString(), cat] as const;
      })
    ).then((pairs) => {
      if (active) setCategoryByBottleId(new Map(pairs));
    });
    return () => {
      active = false;
    };
  }, [holdings]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(categoryByBottleId.values())).sort()],
    [categoryByBottleId]
  );

  const filteredHoldings = useMemo(() => {
    let result = holdings.filter((h) => {
      if (search.trim() && !h.bottle.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (category !== "All" && categoryByBottleId.get(h.bottleId.toString()) !== category) return false;
      return true;
    });

    if (sort === "name") {
      result = [...result].sort((a, b) => a.bottle.name.localeCompare(b.bottle.name));
    } else if (sort === "units") {
      result = [...result].sort((a, b) => (b.units > a.units ? 1 : b.units < a.units ? -1 : 0));
    } else if (sort === "value") {
      result = [...result].sort((a, b) => {
        const aValue = a.units * (tradePrices.get(a.bottleId.toString()) ?? a.bottle.pricePerUnit);
        const bValue = b.units * (tradePrices.get(b.bottleId.toString()) ?? b.bottle.pricePerUnit);
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      });
    }
    return result;
  }, [holdings, search, category, sort, categoryByBottleId, tradePrices]);

  async function handleRedeemed(holding: Holding, txHash?: string) {
    refetchPortfolio();
    if (!address) return;
    const res = await fetch("/api/redemptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, bottleId: holding.bottleId.toString(), txHash: txHash ?? null }),
    });
    if (res.ok) {
      const { redemption } = (await res.json()) as { redemption: import("@/lib/redemption-types").RedemptionFulfillment };
      setPendingRedemptions((prev) => [...prev.filter((r) => r.id !== redemption.id), redemption]);
    }
    setRedeeming(null);
    setFulfilling({ bottleId: holding.bottleId, bottleName: holding.bottle.name });
  }

  if (!contractsConfigured) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Vault contract address is not configured yet.
      </p>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 py-24 text-center">
        <p className="font-display text-xl font-normal text-ink">Connect your wallet to see your holdings</p>
        <button
          onClick={open}
          className="mt-6 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (holdings.length === 0 && !isPortfolioLoading) {
    return (
      <PortfolioEmptyState
        title="You don't have any bottles in your collection yet"
        body="Why not go and get some?"
        ctaLabel="See Marketplace"
        ctaHref="/market"
        variant="list"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bottle name"
          className="min-w-[220px] flex-1 rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink focus:border-amber focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink focus:border-amber focus:outline-none"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4">
        {filteredHoldings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
            No bottles match your search or filters.
          </p>
        ) : (
          filteredHoldings.map((holding) => (
            <HoldingCard
              key={holding.bottleId.toString()}
              holding={holding}
              tradePrice={tradePrices.get(holding.bottleId.toString())}
              onRedeem={setRedeeming}
              onList={setListing}
            />
          ))
        )}
      </div>

      {redeeming && (
        <RedeemModal
          holding={redeeming}
          onClose={() => setRedeeming(null)}
          onRedeemed={(txHash) => handleRedeemed(redeeming, txHash)}
        />
      )}
      {listing && <ListForSaleModal holding={listing} onClose={() => setListing(null)} />}
      {fulfilling && address && (
        <RedemptionFulfillmentForm
          wallet={address}
          bottleId={fulfilling.bottleId.toString()}
          bottleName={fulfilling.bottleName}
          existing={pendingRedemptions.find((r) => r.bottleId === fulfilling.bottleId.toString()) ?? null}
          onClose={() => setFulfilling(null)}
          onSubmitted={(record) => setPendingRedemptions((prev) => [...prev.filter((r) => r.id !== record.id), record])}
        />
      )}
    </div>
  );
}
