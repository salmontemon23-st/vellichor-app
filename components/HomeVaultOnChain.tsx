"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  BottleCardOnChain,
  bottleStatus,
  percentClaimedOnChain,
  STATUS_CLASS,
  STATUS_LABEL,
  useBottleMetadata,
} from "./BottleCardOnChain";
import { ipfsToHttp } from "@/lib/ipfs";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  contractsConfigured,
  HIDDEN_BOTTLE_IDS,
  PAYMENT_TOKEN_DECIMALS,
  PAYMENT_TOKEN_SYMBOL,
  type OnChainBottle,
} from "@/lib/contracts";

function useAllBottles() {
  const { data, isLoading } = useReadContract({
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

  return { bottles, isLoading };
}

function BottleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M9.5 2h5v3.2l2 3.2c.5.8.8 1.7.8 2.7V19a2 2 0 0 1-2 2h-6.6a2 2 0 0 1-2-2V11.1c0-1 .3-1.9.8-2.7l2-3.2V2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeroVaultCardEmpty({ message }: { message: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-panel p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/10 text-amber-deep">
        <BottleGlyph />
      </div>
      <p className="text-center text-sm text-ink-dim">{message}</p>
    </div>
  );
}

function HeroVaultCard({ bottles }: { bottles: OnChainBottle[] }) {
  const [activeId, setActiveId] = useState(bottles[0].bottleId);
  const active = bottles.find((b) => b.bottleId === activeId) ?? bottles[0];

  const meta = useBottleMetadata(active.metadataURI, active.bottleId);
  const status = bottleStatus(active);
  const pct = percentClaimedOnChain(active);
  const price = formatUnits(active.pricePerUnit, PAYMENT_TOKEN_DECIMALS);
  const category = meta?.attributes?.find((a) => a.trait_type === "Category")?.value ?? "Vault Unit";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
      {bottles.length > 1 && (
        <div className="flex gap-1 border-b border-line bg-panel-2 p-2">
          {bottles.map((b) => (
            <button
              key={b.bottleId.toString()}
              onClick={() => setActiveId(b.bottleId)}
              className={`rounded-full px-3 py-1.5 font-data text-xs font-semibold uppercase tracking-wide transition-colors ${
                b.bottleId === active.bottleId
                  ? "bg-panel text-ink shadow-sm"
                  : "text-ink-dim hover:text-ink"
              }`}
            >
              {b.name.length > 14 ? `${b.name.slice(0, 14)}…` : b.name}
            </button>
          ))}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Genesis Collection · Robinhood Chain</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {meta?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ipfsToHttp(meta.image)}
              alt={active.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber/10 text-amber-deep">
              <BottleGlyph />
            </div>
          )}
          <div>
            <p className="font-display text-lg font-normal leading-snug text-ink">{active.name}</p>
            <p className="font-data text-xs uppercase tracking-wide text-ink-dim">{category}</p>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-dim">Price / unit</p>
            <p className="font-data text-3xl font-semibold text-ink">
              {price}
              <span className="ml-1.5 text-base font-medium text-ink-dim">{PAYMENT_TOKEN_SYMBOL}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-dim">Units claimed</p>
            <p className="font-data text-lg font-semibold text-amber-deep">{pct}%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full bg-amber transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between font-data text-xs text-ink-dim">
            <span>
              {active.unitsSold.toString()}/{active.totalUnits.toString()} units sold
            </span>
            <span>Redeem never gated</span>
          </div>
        </div>

        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-dim">
          Fully backed by the physical bottle in insured, climate-controlled custody —
          authenticated on-chain, redeemable in-kind by whoever consolidates 100% of its units.
        </p>

        <Link
          href={`/vault/${active.bottleId.toString()}`}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-amber hover:text-amber-deep"
        >
          See this bottle: provenance, price, redemption →
        </Link>
      </div>
    </div>
  );
}

/** Hero card showing the live Vault — bottle stats, claim progress, and a link to details. */
export function VaultHeroGauge() {
  const { bottles, isLoading } = useAllBottles();

  if (!contractsConfigured) {
    return <HeroVaultCardEmpty message="Vault contract not configured yet" />;
  }

  if (isLoading) {
    return <HeroVaultCardEmpty message="Loading Vault…" />;
  }

  if (bottles.length === 0) {
    return <HeroVaultCardEmpty message="Vault — no bottles minted yet" />;
  }

  return <HeroVaultCard bottles={bottles} />;
}

/** Genesis Collection preview — first bottles minted into the live Vault. */
export function GenesisCollectionPreview() {
  const { bottles, isLoading } = useAllBottles();
  const preview = bottles.slice(0, 3);

  if (!contractsConfigured) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Vault contract not configured yet — set NEXT_PUBLIC_VELLICHOR_VAULT_ADDRESS to see live
        bottles here.
      </p>
    );
  }

  if (!isLoading && preview.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        The Vault is empty right now. Once the first bottle is minted on-chain, it will appear here.
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {preview.map((bottle) => (
        <BottleCardOnChain key={bottle.bottleId.toString()} bottle={bottle} />
      ))}
      <Link
        href="/vault"
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line p-5 text-center hover:border-amber"
      >
        <span className="font-data text-xs uppercase tracking-wide text-ink-dim">View all</span>
        <p className="max-w-[16rem] text-sm leading-relaxed text-ink-dim">
          Browse the full Vault for every bottle currently in custody.
        </p>
      </Link>
    </div>
  );
}
