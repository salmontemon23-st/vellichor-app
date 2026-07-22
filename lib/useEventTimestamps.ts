"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import type { Abi, AbiEvent } from "viem";

/**
 * Neither VellichorVault nor VellichorMarket store a listing/vaulting
 * timestamp on-chain — the only source of real time data is each event's
 * block. This reads every log for a single-indexed-id event (BottleListed by
 * bottleId, Listed by listingId) and maps that id to its block's unix
 * timestamp (seconds), for "Newest" sorting and 24h/7d time-window filters.
 *
 * Fails soft: on any RPC error (or before the client/address are ready) this
 * returns an empty map rather than throwing, so callers just see everything
 * as "no known timestamp" instead of crashing the page.
 */
export function useEventTimestamps(
  address: `0x${string}` | undefined,
  abi: Abi,
  eventName: string,
  idArgName: string
) {
  const publicClient = usePublicClient();
  const [timestamps, setTimestamps] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!address || !publicClient) return;
    let active = true;

    (async () => {
      try {
        const event = abi.find(
          (item) => item.type === "event" && item.name === eventName
        ) as AbiEvent | undefined;
        if (!event) return;

        const logs = await publicClient.getLogs({
          address,
          event,
          fromBlock: 0n,
          toBlock: "latest",
          strict: true,
        });

        const blockNumbers = [...new Set(logs.map((l) => l.blockNumber))];
        const blocks = await Promise.all(
          blockNumbers.map((bn) => publicClient.getBlock({ blockNumber: bn }))
        );
        const timeByBlock = new Map(blocks.map((b) => [b.number, Number(b.timestamp)]));

        const map: Record<string, number> = {};
        for (const log of logs) {
          const id = (log.args as Record<string, unknown>)[idArgName];
          const ts = timeByBlock.get(log.blockNumber);
          if (id === undefined || ts === undefined) continue;
          map[String(id)] = ts;
        }

        if (active) setTimestamps(map);
      } catch {
        if (active) setTimestamps({});
      }
    })();

    return () => {
      active = false;
    };
  }, [address, publicClient, abi, eventName, idArgName]);

  return timestamps;
}
