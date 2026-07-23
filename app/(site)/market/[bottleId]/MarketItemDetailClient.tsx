"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { robinhoodChain } from "@/lib/chains";
import { ipfsToHttp } from "@/lib/ipfs";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
  type OnChainBottle,
  type OnChainListing,
} from "@/lib/contracts";
import { STATUS_LABEL, bottleStatus, percentClaimedOnChain, useBottleMetadata } from "@/components/BottleCardOnChain";
import { useWalletModal } from "@/lib/wallet-modal";
import { AcquirePanel } from "@/components/AcquirePanel";
import { BuyListingPanel } from "@/components/BuyListingPanel";
import { AuthenticationBadge } from "@/components/AuthenticationBadge";
import { useBottleActivity } from "@/lib/hooks/useBottleActivity";
import { useBottleMarketStats } from "@/lib/hooks/useBottleMarketStats";
import { PriceHistoryChart, type PricePoint } from "@/components/market/PriceHistoryChart";

type SelectedListing = { kind: "primary" } | { kind: "secondary"; listing: OnChainListing };
type Tab = "activity" | "price" | "details";

function fmt(v: bigint) {
  return formatUnits(v, PAYMENT_TOKEN_DECIMALS);
}

function AddressLink({ address }: { address: `0x${string}` }) {
  const explorerBase = robinhoodChain.blockExplorers?.default.url;
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  if (!explorerBase) return <span className="font-data">{short}</span>;
  return (
    <a
      href={`${explorerBase}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-data text-amber-deep hover:underline"
    >
      {short}
    </a>
  );
}

export default function MarketItemDetailClient() {
  const params = useParams<{ bottleId: string }>();
  const searchParams = useSearchParams();
  const { isConnected, chainId } = useAccount();
  const { open } = useWalletModal();
  const wrongNetwork = isConnected && chainId !== robinhoodChain.id;

  const [tab, setTab] = useState<Tab>("activity");
  const [showBuy, setShowBuy] = useState(false);
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);

  let bottleId: bigint | null = null;
  try {
    bottleId = BigInt(params.bottleId);
  } catch {
    bottleId = null;
  }

  const { data, isLoading, isError, error } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "bottles",
    args: bottleId !== null ? [bottleId] : undefined,
    query: { enabled: contractsConfigured && bottleId !== null },
  });

  const bottle: OnChainBottle | null = useMemo(() => {
    if (!data || bottleId === null) return null;
    const [name, totalUnits, unitsSold, pricePerUnit, unitsRedeemed, redeemed, listed, metadataURI] =
      data as [string, bigint, bigint, bigint, bigint, boolean, boolean, string];
    if (totalUnits === 0n && !listed) return null;
    return { bottleId, name, totalUnits, unitsSold, pricePerUnit, unitsRedeemed, redeemed, listed, metadataURI };
  }, [data, bottleId]);

  const meta = useBottleMetadata(bottle?.metadataURI ?? "", bottle?.bottleId);
  const { entries: activity, isLoading: activityLoading } = useBottleActivity(bottleId);
  const stats = useBottleMarketStats({ bottleId, bottle, activityEntries: activity });

  const primaryAvailable = !!bottle && bottleStatus(bottle) === "available";

  // Which listing to show is driven by which card was actually clicked from
  // the Market grid: ?listing=<id> picks that specific secondary listing,
  // ?type=primary picks primary explicitly. Falling back to "primary if
  // available, else cheapest secondary" only applies when the page is
  // reached without either param (e.g. a direct link to the bottle).
  const listingParam = searchParams.get("listing");
  const typeParam = searchParams.get("type");

  const requestedSecondary = listingParam
    ? stats.secondaryListings.find((l) => l.listingId.toString() === listingParam)
    : undefined;

  const selected: SelectedListing | null = requestedSecondary
    ? { kind: "secondary", listing: requestedSecondary }
    : typeParam === "primary" && primaryAvailable
      ? { kind: "primary" }
      : !listingParam && primaryAvailable
        ? { kind: "primary" }
        : stats.secondaryListings.length > 0
          ? { kind: "secondary", listing: [...stats.secondaryListings].sort((a, b) => (a.pricePerUnit < b.pricePerUnit ? -1 : 1))[0] }
          : null;

  const listPrice = selected ? (selected.kind === "primary" ? bottle?.pricePerUnit ?? 0n : selected.listing.pricePerUnit) : null;
  const floorDiffPct =
    listPrice !== null && stats.floorPrice !== null && stats.floorPrice > 0n
      ? ((Number(listPrice) - Number(stats.floorPrice)) / Number(stats.floorPrice)) * 100
      : null;

  const pricePoints: PricePoint[] = useMemo(
    () =>
      activity
        .filter((e) => e.type === "buy_primary" || e.type === "buy_secondary")
        .map((e) => {
          const [amount, units] =
            e.type === "buy_primary" ? [e.cost, e.units] : e.type === "buy_secondary" ? [e.totalPaid, e.units] : [0n, 1n];
          return {
            timestamp: Number(e.timestamp),
            price: Number(formatUnits(amount, PAYMENT_TOKEN_DECIMALS)) / Number(units),
          };
        }),
    [activity]
  );

  if (!contractsConfigured) {
    return (
      <div className="container py-16">
        <Link href="/market" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Market
        </Link>
        <p className="mt-10 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          Market contract address is not configured yet.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16">
        <Link href="/market" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Market
        </Link>
        <p className="mt-10 text-sm text-ink-dim">Loading bottle from Robinhood Chain…</p>
      </div>
    );
  }

  if (isError || !bottle) {
    return (
      <div className="container py-16">
        <Link href="/market" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Market
        </Link>
        <p className="mt-10 rounded-xl border border-dashed border-wine/40 p-8 text-center text-sm text-wine">
          {error?.message ?? "This bottle was not found on-chain."}
        </p>
      </div>
    );
  }

  const category = meta?.attributes?.find((a) => a.trait_type === "Category")?.value;
  const images = [meta?.image, ...(meta?.images ?? [])].filter((i): i is string => !!i);
  const activeImage = mainImage ?? images[0];

  const pct = percentClaimedOnChain(bottle);
  const listedPct = stats.totalUnits > 0n ? Math.round((Number(stats.listedUnits) / Number(stats.totalUnits)) * 100) : 0;

  return (
    <div className="container py-16">
      <Link href="/market" className="text-sm text-ink-dim hover:text-ink">
        ← Back to Market
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[440px_1fr]">
        {/* Image area */}
        <div>
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-panel p-6">
            {activeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ipfsToHttp(activeImage)}
                alt={bottle.name}
                className="mx-auto w-full max-w-[420px] rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center text-sm text-ink-dim">No image yet</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img) => (
                <button
                  key={img}
                  onClick={() => setMainImage(img)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                    activeImage === img ? "border-amber" : "border-line"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ipfsToHttp(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            {category && <span className="eyebrow">{category}</span>}
            <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-medium text-ink-dim">
              {STATUS_LABEL[bottleStatus(bottle)]}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-normal text-ink">{bottle.name}</h1>

          {/* Price panel */}
          <div className="mt-6 rounded-2xl border border-line bg-panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-dim">Owned by</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {selected?.kind === "primary" ? (
                    "Vellichor"
                  ) : selected?.kind === "secondary" ? (
                    <AddressLink address={selected.listing.seller} />
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-dim">List Price</p>
                <p className="font-data text-2xl font-semibold text-ink">
                  {listPrice !== null ? fmt(listPrice) : "—"}{" "}
                  <span className="text-base font-medium text-ink-dim">{PAYMENT_TOKEN_SYMBOL}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div>
                <p className="text-xs text-ink-dim">Floor Price</p>
                <p className="font-data text-ink">{stats.floorPrice !== null ? `${fmt(stats.floorPrice)} ${PAYMENT_TOKEN_SYMBOL}` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink-dim">Floor Diff.</p>
                <p className={`font-data ${floorDiffPct !== null && floorDiffPct > 0 ? "text-wine" : "text-ink"}`}>
                  {floorDiffPct !== null ? `${floorDiffPct > 0 ? "+" : ""}${floorDiffPct.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>

            {!isConnected ? (
              <button
                onClick={open}
                className="mt-5 w-full rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
              >
                Connect Wallet
              </button>
            ) : wrongNetwork ? (
              <p className="mt-5 rounded-xl bg-wine/10 px-4 py-3 text-center text-sm text-wine">
                Switch to Robinhood Chain to continue.
              </p>
            ) : !selected ? (
              <p className="mt-5 text-center text-sm text-ink-dim">No units currently available to buy.</p>
            ) : (
              <button
                onClick={() => setShowBuy(true)}
                className="mt-5 w-full rounded-full bg-amber px-5 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
              >
                Buy
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-line">
            {(["activity", "price", "details"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  tab === t ? "border-b-2 border-amber text-ink" : "text-ink-dim hover:text-ink"
                }`}
              >
                {t === "price" ? "Price History" : t}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {tab === "activity" &&
              (activityLoading ? (
                <p className="text-sm text-ink-dim">Loading activity…</p>
              ) : activity.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
                  No activity yet for this bottle.
                </p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-panel-2 text-xs uppercase tracking-wide text-ink-dim">
                      <tr>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {activity.map((e) => {
                        const label =
                          e.type === "buy_primary"
                            ? "Bought (primary)"
                            : e.type === "buy_secondary"
                              ? "Bought (secondary)"
                              : e.type === "listed"
                                ? "Listed for resale"
                                : e.type === "listing_cancelled"
                                  ? "Listing cancelled"
                                  : e.type === "listing_updated"
                                    ? "Listing price updated"
                                    : e.type === "redemption_requested"
                                      ? "Redemption requested"
                                      : "Bottle redeemed";
                        const amount =
                          e.type === "buy_primary"
                            ? `${e.units} unit(s) — ${fmt(e.cost)} ${PAYMENT_TOKEN_SYMBOL}`
                            : e.type === "buy_secondary"
                              ? `${e.units} unit(s) — ${fmt(e.totalPaid)} ${PAYMENT_TOKEN_SYMBOL}`
                              : e.type === "listed"
                                ? `${e.units} unit(s) @ ${fmt(e.pricePerUnit)} ${PAYMENT_TOKEN_SYMBOL}`
                                : e.type === "listing_updated"
                                  ? `${fmt(e.newPricePerUnit)} ${PAYMENT_TOKEN_SYMBOL}`
                                  : e.type === "redemption_requested"
                                    ? `${e.unitsBurned} unit(s) burned`
                                    : "—";
                        const explorerBase = robinhoodChain.blockExplorers?.default.url;
                        return (
                          <tr key={e.key}>
                            <td className="px-4 py-3 font-medium text-ink">{label}</td>
                            <td className="px-4 py-3 text-ink-dim">{amount}</td>
                            <td className="px-4 py-3 text-ink-dim">
                              <div>{e.timestamp > 0n ? new Date(Number(e.timestamp) * 1000).toLocaleDateString() : "—"}</div>
                              {explorerBase && (
                                <a
                                  href={`${explorerBase}/tx/${e.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-amber-deep hover:underline"
                                >
                                  View tx →
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

            {tab === "price" && <PriceHistoryChart points={pricePoints} />}

            {tab === "details" && (
              <div>
                <AuthenticationBadge bottleId={bottle.bottleId} />
                {meta?.description && (
                  <p className="mt-5 text-sm leading-relaxed text-ink-dim">{meta.description}</p>
                )}
                {meta?.attributes && meta.attributes.length > 0 && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {meta.attributes.map((attr) => (
                      <div key={attr.trait_type} className="rounded-xl border border-line bg-panel p-4">
                        <p className="eyebrow">{attr.trait_type}</p>
                        <p className="mt-2 text-sm text-ink">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 rounded-xl border border-line bg-panel p-4">
                  <p className="eyebrow">Units</p>
                  <p className="mt-2 font-data text-sm text-ink">
                    {bottle.unitsSold.toString()} / {bottle.totalUnits.toString()} claimed ({pct}%)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-5">
        <div>
          <p className="text-xs text-ink-dim">Floor</p>
          <p className="mt-1 font-data text-sm font-semibold text-ink">
            {stats.floorPrice !== null ? `${fmt(stats.floorPrice)} ${PAYMENT_TOKEN_SYMBOL}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">7d Vol</p>
          <p className="mt-1 font-data text-sm font-semibold text-ink">
            {fmt(stats.sevenDayVolume)} {PAYMENT_TOKEN_SYMBOL}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">7d Sales</p>
          <p className="mt-1 font-data text-sm font-semibold text-ink">{stats.sevenDaySales}</p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">Listed</p>
          <p className="mt-1 font-data text-sm font-semibold text-ink">
            {stats.listedUnits.toString()}/{stats.totalUnits.toString()} ({listedPct}%)
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-dim">Owners</p>
          <p className="mt-1 font-data text-sm font-semibold text-ink">
            {stats.ownerCount !== undefined ? stats.ownerCount : "…"}
          </p>
        </div>
      </div>

      {showBuy && selected?.kind === "primary" && <AcquirePanel bottle={bottle} onClose={() => setShowBuy(false)} />}
      {showBuy && selected?.kind === "secondary" && (
        <BuyListingPanel listing={selected.listing} onClose={() => setShowBuy(false)} />
      )}
    </div>
  );
}
