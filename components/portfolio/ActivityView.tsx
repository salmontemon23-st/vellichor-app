"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { usePortfolioData } from "@/lib/hooks/usePortfolioData";
import { usePortfolioActivity } from "@/lib/hooks/usePortfolioActivity";
import { useWalletModal } from "@/lib/wallet-modal";
import { contractsConfigured } from "@/lib/contracts";
import { PortfolioEmptyState } from "@/components/PortfolioEmptyState";
import { robinhoodChain } from "@/lib/chains";
import {
  ACTIVITY_TYPE_GROUPS,
  activityTypeGroup,
  formatActivityDate,
  formatActivityEntry,
  type ActivityTypeGroup,
} from "@/lib/portfolioActivityFormat";

type SortDir = "asc" | "desc";

export function ActivityView() {
  const { address, isConnected } = useAccount();
  const { bottlesById } = usePortfolioData();
  const { open } = useWalletModal();
  const { entries, isLoading } = usePortfolioActivity(address);

  const [search, setSearch] = useState("");
  const [typeGroup, setTypeGroup] = useState<ActivityTypeGroup>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    const fromTs = dateFrom ? BigInt(Math.floor(new Date(dateFrom).getTime() / 1000)) : null;
    const toTs = dateTo ? BigInt(Math.floor(new Date(dateTo).getTime() / 1000) + 86400) : null;

    const filtered = entries
      .map((entry) => ({ entry, ...formatActivityEntry(entry, bottlesById) }))
      .filter(({ entry, type, assetName }) => {
        if (typeGroup !== "all" && activityTypeGroup(entry) !== typeGroup) return false;
        if (fromTs !== null && entry.timestamp < fromTs) return false;
        if (toTs !== null && entry.timestamp >= toTs) return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (!assetName.toLowerCase().includes(q) && !type.toLowerCase().includes(q)) return false;
        }
        return true;
      });

    filtered.sort((a, b) =>
      sortDir === "desc" ? Number(b.entry.timestamp - a.entry.timestamp) : Number(a.entry.timestamp - b.entry.timestamp)
    );
    return filtered;
  }, [entries, bottlesById, search, typeGroup, dateFrom, dateTo, sortDir]);

  if (!contractsConfigured) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        Contract addresses are not configured yet.
      </p>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 py-24 text-center">
        <p className="font-display text-xl font-normal text-ink">Connect your wallet to see your activity</p>
        <button
          onClick={open}
          className="mt-6 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white hover:bg-amber-deep"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isLoading && entries.length === 0) {
    return (
      <PortfolioEmptyState
        title="No activity yet"
        body="Buys, listings, and redemptions for this wallet will show up here."
        ctaLabel="Go to Market"
        ctaHref="/market"
        variant="list"
      />
    );
  }

  const explorerBase = robinhoodChain.blockExplorers?.default.url;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by bottle, activity, etc..."
          className="min-w-[220px] flex-1 rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink placeholder:text-ink-dim/70 focus:border-amber focus:outline-none"
        />
        <select
          value={typeGroup}
          onChange={(e) => setTypeGroup(e.target.value as ActivityTypeGroup)}
          className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-ink focus:border-amber focus:outline-none"
        >
          {Object.entries(ACTIVITY_TYPE_GROUPS).map(([key, label]) => (
            <option key={key} value={key}>
              View: {label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm text-ink-dim">
          <label className="flex items-center gap-1.5">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-line bg-panel px-2 py-1.5 text-sm text-ink focus:border-amber focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-line bg-panel px-2 py-1.5 text-sm text-ink focus:border-amber focus:outline-none"
            />
          </label>
        </div>
      </div>

      {isLoading && <p className="text-sm text-ink-dim">Loading activity…</p>}

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-panel-2 text-xs uppercase tracking-wide text-ink-dim">
            <tr>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Asset Name</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">
                <button
                  onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  className="flex items-center gap-1 hover:text-ink"
                >
                  Date {sortDir === "desc" ? "↓" : "↑"}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && !isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-ink-dim">
                  No matching activity.
                </td>
              </tr>
            )}
            {rows.map(({ entry, type, assetName, amount }) => (
              <tr key={entry.key} className="align-top">
                <td className="px-5 py-4 font-medium text-ink">{type}</td>
                <td className="px-5 py-4 text-ink-dim">{assetName}</td>
                <td className="px-5 py-4 text-ink-dim">{amount}</td>
                <td className="px-5 py-4 text-ink-dim">
                  <div>{formatActivityDate(entry.timestamp)}</div>
                  {explorerBase && (
                    <a
                      href={`${explorerBase}/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-amber-deep hover:underline"
                    >
                      View tx →
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
