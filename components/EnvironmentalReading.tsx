"use client";

import { useReadContract } from "wagmi";
import {
  VELLICHOR_ENVIRONMENTAL_ORACLE_ABI,
  VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS,
  verificationConfigured,
} from "@/lib/contracts";

/** Read-only display of a bottle's latest recorded storage-condition reading,
 * if one exists. No admin controls — just what's on-chain. */
export function EnvironmentalReading({ bottleId }: { bottleId: bigint }) {
  const { data: count } = useReadContract({
    address: VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS,
    abi: VELLICHOR_ENVIRONMENTAL_ORACLE_ABI,
    functionName: "readingCount",
    args: [bottleId],
    query: { enabled: verificationConfigured },
  });

  const hasReading = !!count && (count as bigint) > 0n;

  const { data: reading } = useReadContract({
    address: VELLICHOR_ENVIRONMENTAL_ORACLE_ADDRESS,
    abi: VELLICHOR_ENVIRONMENTAL_ORACLE_ABI,
    functionName: "latestReading",
    args: [bottleId],
    query: { enabled: verificationConfigured && hasReading },
  });

  if (!verificationConfigured || !hasReading || !reading) {
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        No storage-condition reading recorded yet for this bottle.
      </p>
    );
  }

  const { temperatureCelsiusX10, humidityPercent, notes, timestamp } = reading as {
    temperatureCelsiusX10: number;
    humidityPercent: number;
    notes: string;
    timestamp: bigint;
  };

  const date = new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="eyebrow">Temperature</p>
          <p className="mt-1 font-data text-2xl font-semibold text-ink">
            {(temperatureCelsiusX10 / 10).toFixed(1)}
            <span className="ml-1 text-base font-medium text-ink-dim">°C</span>
          </p>
        </div>
        <div>
          <p className="eyebrow">Humidity</p>
          <p className="mt-1 font-data text-2xl font-semibold text-ink">
            {humidityPercent}
            <span className="ml-1 text-base font-medium text-ink-dim">%</span>
          </p>
        </div>
      </div>
      {notes && <p className="mt-4 text-sm leading-relaxed text-ink-dim">{notes}</p>}
      <p className="mt-2 text-xs text-ink-dim">Recorded {date}</p>
    </div>
  );
}
