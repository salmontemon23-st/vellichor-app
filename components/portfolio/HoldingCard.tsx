"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import {
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  PAYMENT_TOKEN_SYMBOL,
  PAYMENT_TOKEN_DECIMALS,
  contractsConfigured,
} from "@/lib/contracts";
import { useBottleMetadata } from "@/components/BottleCardOnChain";
import { ipfsToHttp } from "@/lib/ipfs";
import type { Holding } from "@/lib/hooks/usePortfolioData";

/**
 * Full-detail holding row for /portfolio/holdings — bottle image, name,
 * unit count, ownership percentage, and a Redeem button only if canRedeem()
 * is true (otherwise progress toward it, never a disabled button), plus a
 * Sell shortcut into the listing flow.
 */
export function HoldingCard({
  holding,
  tradePrice,
  onRedeem,
  onList,
}: {
  holding: Holding;
  tradePrice?: bigint;
  onRedeem: (h: Holding) => void;
  onList: (h: Holding) => void;
}) {
  const { address } = useAccount();
  const meta = useBottleMetadata(holding.bottle.metadataURI);

  const { data: canRedeemData } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "canRedeem",
    args: address ? [holding.bottleId, address] : undefined,
    query: { enabled: contractsConfigured && !!address },
  });
  const canRedeem = !!canRedeemData;

  const outstanding = holding.bottle.totalUnits - holding.bottle.unitsRedeemed;
  const ownershipPct =
    outstanding === 0n ? 0 : Math.round((Number(holding.units) / Number(outstanding)) * 100);
  const price = tradePrice ?? holding.bottle.pricePerUnit;
  const value = holding.units * price;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {meta?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ipfsToHttp(meta.image)} alt={holding.bottle.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-xl bg-panel-2" />
        )}
        <div>
          <Link
            href={`/vault/${holding.bottleId.toString()}`}
            className="font-display text-lg font-normal text-ink hover:text-amber-deep transition-colors"
          >
            {holding.bottle.name}
          </Link>
          <p className="mt-1 text-sm text-ink-dim">
            {holding.units.toString()} / {holding.bottle.totalUnits.toString()} units held ({ownershipPct}%)
          </p>
          <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(100, ownershipPct)}%`, background: "var(--amber)" }}
            />
          </div>
          {!canRedeem && (
            <p className="mt-2 text-xs text-ink-dim">
              You hold {holding.units.toString()} / {outstanding.toString()} units — redemption requires
              100%.{" "}
              <Link href="/market" className="text-amber-deep hover:underline">
                Buy remaining units →
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-ink-dim">Est. value</p>
          <p className="font-data text-base font-semibold text-ink">
            {formatUnits(value, PAYMENT_TOKEN_DECIMALS)} {PAYMENT_TOKEN_SYMBOL}
          </p>
        </div>
        {canRedeem && (
          <button
            onClick={() => onRedeem(holding)}
            className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-deep"
          >
            Redeem
          </button>
        )}
        <button
          onClick={() => onList(holding)}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-amber"
        >
          Sell
        </button>
      </div>
    </div>
  );
}
