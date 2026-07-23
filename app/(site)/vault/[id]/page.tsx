"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { BottleGauge } from "@/components/BottleGauge";
import { AcquirePanel } from "@/components/AcquirePanel";
import { AuthenticationBadge } from "@/components/AuthenticationBadge";
import { CooldownReveal } from "@/components/CooldownReveal";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
  type OnChainBottle,
} from "@/lib/contracts";
import { ipfsToHttp, type BottleMetadata } from "@/lib/ipfs";
import { STATUS_LABEL, bottleStatus, percentClaimedOnChain, useBottleMetadata } from "@/components/BottleCardOnChain";

export default function BottleDetailPage() {
  const params = useParams<{ id: string }>();
  const [showBuy, setShowBuy] = useState(false);

  let bottleId: bigint | null = null;
  try {
    bottleId = BigInt(params.id);
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

  const bottle: OnChainBottle | null = (() => {
    if (!data || bottleId === null) return null;
    const [name, totalUnits, unitsSold, pricePerUnit, unitsRedeemed, redeemed, listed, metadataURI] =
      data as [string, bigint, bigint, bigint, bigint, boolean, boolean, string];
    if (totalUnits === 0n && !listed) return null;
    return { bottleId, name, totalUnits, unitsSold, pricePerUnit, unitsRedeemed, redeemed, listed, metadataURI };
  })();

  const meta: BottleMetadata | null = useBottleMetadata(bottle?.metadataURI ?? "", bottle?.bottleId);

  if (!contractsConfigured) {
    return (
      <div className="container py-16">
        <Link href="/vault" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Vault
        </Link>
        <p className="mt-10 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          Vault contract address is not configured yet.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16">
        <Link href="/vault" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Vault
        </Link>
        <p className="mt-10 text-sm text-ink-dim">Loading bottle from Robinhood Chain…</p>
      </div>
    );
  }

  if (isError || !bottle) {
    return (
      <div className="container py-16">
        <Link href="/vault" className="text-sm text-ink-dim hover:text-ink">
          ← Back to Vault
        </Link>
        <p className="mt-10 rounded-xl border border-dashed border-wine/40 p-8 text-center text-sm text-wine">
          {error?.message ?? "This bottle was not found on-chain."}
        </p>
      </div>
    );
  }

  const pct = percentClaimedOnChain(bottle);
  const status = bottleStatus(bottle);

  return (
    <div className="container py-16">
      <Link href="/vault" className="text-sm text-ink-dim hover:text-ink">
        ← Back to Vault
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[440px_1fr]">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-panel p-6">
          {meta?.image ? (
            <CooldownReveal revealAt={meta.revealAt} className="mx-auto w-full max-w-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ipfsToHttp(meta.image)}
                alt={bottle.name}
                className="mx-auto w-full max-w-[420px] rounded-xl object-contain"
              />
            </CooldownReveal>
          ) : (
            <BottleGauge percent={pct} height={220} />
          )}
          <span className="rounded-full bg-panel-2 px-3 py-1 text-xs font-medium text-ink-dim">
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div>
          <span className="eyebrow">Vault Unit #{bottle.bottleId.toString()}</span>
          <h1 className="mt-2 font-display text-3xl font-normal text-ink">{bottle.name}</h1>

          {meta?.description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-dim">{meta.description}</p>
          )}

          {meta?.attributes && meta.attributes.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {meta.attributes.map((attr) => (
                <div key={attr.trait_type} className="rounded-xl border border-line bg-panel p-5">
                  <p className="eyebrow">{attr.trait_type}</p>
                  <p className="mt-2 text-sm text-ink">{attr.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <AuthenticationBadge bottleId={bottle.bottleId} />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-panel p-5">
            <p className="eyebrow">Units</p>
            <p className="mt-2 text-sm text-ink font-data">
              {bottle.unitsSold.toString()} / {bottle.totalUnits.toString()} claimed ({pct}%)
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-panel-2">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--amber)" }} />
            </div>
          </div>

          {status === "available" && (
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowBuy(true)}
                className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-deep"
              >
                Buy Vault Units
              </button>
              <p className="text-sm text-ink-dim font-data">
                {formatUnits(bottle.pricePerUnit, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL} / unit
              </p>
            </div>
          )}
        </div>
      </div>

      {showBuy && <AcquirePanel bottle={bottle} onClose={() => setShowBuy(false)} />}
    </div>
  );
}
