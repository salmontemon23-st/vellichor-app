"use client";

import { useReadContract } from "wagmi";
import {
  VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
  VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
  verificationConfigured,
} from "@/lib/contracts";

/** Read-only display of a bottle's on-chain authentication attestation, if one
 * exists. Renders nothing for bottles minted before this existed, or if the
 * registry isn't configured — this is purely informational, no admin controls.
 * Pass `showEmptyState` when this is the primary content of a section (e.g. an
 * "Audit" tab) rather than an inline aside, so an unattested bottle doesn't
 * just render a blank area. */
export function AuthenticationBadge({
  bottleId,
  showEmptyState = false,
}: {
  bottleId: bigint;
  showEmptyState?: boolean;
}) {
  const { data: isAttested } = useReadContract({
    address: VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
    abi: VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
    functionName: "isAttested",
    args: [bottleId],
    query: { enabled: verificationConfigured },
  });

  const { data: attestation } = useReadContract({
    address: VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
    abi: VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
    functionName: "attestations",
    args: [bottleId],
    query: { enabled: verificationConfigured && !!isAttested },
  });

  if (!verificationConfigured || !isAttested || !attestation) {
    if (!showEmptyState) return null;
    return (
      <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
        No authentication attestation recorded yet for this bottle.
      </p>
    );
  }

  const [notes, , timestamp] = attestation as [string, `0x${string}`, bigint];
  const date = new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber/15 text-amber-deep">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-ink">Authenticated</p>
      </div>
      {notes && <p className="mt-2 text-sm leading-relaxed text-ink-dim">{notes}</p>}
      <p className="mt-2 text-xs text-ink-dim">Verified {date}</p>
    </div>
  );
}
