"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUnits } from "viem";
import { usePortfolioData } from "@/lib/hooks/usePortfolioData";
import { usePendingRedemptions } from "@/lib/hooks/usePendingRedemptions";
import { usePortfolioActivity } from "@/lib/hooks/usePortfolioActivity";
import { useLatestTradePrices } from "@/lib/hooks/useLatestTradePrices";
import { useWalletModal } from "@/lib/wallet-modal";
import { PAYMENT_TOKEN_SYMBOL, PAYMENT_TOKEN_DECIMALS, contractsConfigured } from "@/lib/contracts";
import { REDEMPTION_STATUS_COPY } from "@/lib/redemption-types";
import { PortfolioEmptyState } from "@/components/PortfolioEmptyState";
import { VaultedAssetRow } from "@/components/portfolio/VaultedAssetRow";
import { RedemptionFulfillmentForm } from "@/components/RedemptionFulfillmentForm";
import { formatActivityDate, formatActivityEntry } from "@/lib/portfolioActivityFormat";

const CARD_MIN_HEIGHT = "min-h-[500px]";

export function DashboardView() {
  const { address, isConnected, isPortfolioLoading, holdings, bottlesById, refetchPortfolio } = usePortfolioData();
  const { open } = useWalletModal();
  const { visiblePendingRedemptions, pendingRedemptions, setPendingRedemptions } = usePendingRedemptions(address);
  const { entries: activityEntries, isLoading: isActivityLoading } = usePortfolioActivity(address);
  const [fulfilling, setFulfilling] = useState<{ bottleId: bigint; bottleName: string } | null>(null);

  const bottleIds = holdings.map((h) => h.bottleId);
  const { prices: tradePrices } = useLatestTradePrices(bottleIds);

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
        <p className="font-display text-xl font-normal text-ink">
          Connect your wallet to see your Vault Units
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-dim">
          Your holdings, redemption progress, and active resale listings will appear here once
          connected.
        </p>
        <button
          onClick={open}
          className="mt-6 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.units * (tradePrices.get(h.bottleId.toString()) ?? h.bottle.pricePerUnit),
    0n
  );
  const isEmpty = holdings.length === 0 && !isPortfolioLoading;
  const recentActivity = activityEntries.slice(0, 4);
  const isActivityEmpty = !isActivityLoading && activityEntries.length === 0;

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Vaulted assets</p>
          {!isEmpty && (
            <Link href="/portfolio/holdings" className="text-xs font-medium text-amber-deep hover:underline">
              See all →
            </Link>
          )}
        </div>

        <div className="mt-3">
          {isEmpty ? (
            <PortfolioEmptyState
              title="Nothing vaulted yet"
              body="Buy Vault Units on the Market to start building your collection."
              ctaLabel="Go to Market"
              ctaHref="/market"
              variant="chart"
              minHeightClassName={CARD_MIN_HEIGHT}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-panel p-6">
              <div className="flex flex-col gap-1">
                {holdings.slice(0, 5).map((h) => (
                  <VaultedAssetRow key={h.bottleId.toString()} holding={h} />
                ))}
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <p className="eyebrow">Collection value</p>
                <p className="mt-2 font-data text-4xl font-semibold tabular-nums text-ink">
                  {formatUnits(totalValue, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL}
                </p>
                <p className="mt-2 text-sm text-ink-dim">
                  {isPortfolioLoading ? "Loading…" : `${holdings.length} bottle${holdings.length === 1 ? "" : "s"} held`}
                </p>
                <p className="mt-3 max-w-sm text-xs leading-relaxed text-ink-dim">
                  Value estimate based on units held × most recent trade price per bottle. Not a
                  promise of return — prices can fall as well as rise.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {visiblePendingRedemptions.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-normal text-ink">Pending Redemption</h2>
          <div className="mt-4 grid gap-4">
            {visiblePendingRedemptions.map((r) => {
              const bottle = bottlesById.get(r.bottleId);
              const copy = REDEMPTION_STATUS_COPY[r.status];
              const bottleName = bottle?.name ?? `Bottle #${r.bottleId}`;
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-4 rounded-2xl border border-amber/40 bg-panel p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-lg font-normal text-ink">{bottleName}</p>
                    <p className="mt-1 text-sm text-amber-deep">{copy.message}</p>
                  </div>
                  <button
                    onClick={() => setFulfilling({ bottleId: BigInt(r.bottleId), bottleName })}
                    className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-deep"
                  >
                    {copy.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity History preview */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Activity History</p>
          {!isActivityEmpty && (
            <Link href="/portfolio/activity" className="text-xs font-medium text-amber-deep hover:underline">
              See all →
            </Link>
          )}
        </div>
        <div className="mt-3">
          {isActivityEmpty ? (
            <PortfolioEmptyState
              title="No activity history found"
              body="Buys, listings, and redemptions for this wallet will show up here."
              ctaLabel="Go to Market"
              ctaHref="/market"
              variant="list"
            />
          ) : (
            <div className="flex flex-col gap-1 rounded-2xl border border-line bg-panel p-3">
              {isActivityLoading && <p className="px-3 py-2 text-sm text-ink-dim">Loading…</p>}
              {recentActivity.map((entry) => {
                const { type, assetName, amount } = formatActivityEntry(entry, bottlesById);
                return (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{type}</p>
                      <p className="truncate text-xs text-ink-dim">
                        {assetName} — {amount}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-dim">{formatActivityDate(entry.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {fulfilling && address && (
        <RedemptionFulfillmentForm
          wallet={address}
          bottleId={fulfilling.bottleId.toString()}
          bottleName={fulfilling.bottleName}
          existing={pendingRedemptions.find((r) => r.bottleId === fulfilling.bottleId.toString()) ?? null}
          onClose={() => {
            setFulfilling(null);
            refetchPortfolio();
          }}
          onSubmitted={(record) => setPendingRedemptions((prev) => [...prev.filter((r) => r.id !== record.id), record])}
        />
      )}
    </div>
  );
}
