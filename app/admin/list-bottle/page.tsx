"use client";

import { useAccount } from "wagmi";
import { useIsAuditor } from "@/lib/hooks/useIsAuditor";
import { BottleIntakeWizard } from "@/components/admin/BottleIntakeWizard";

export default function ListBottlePage() {
  const { isConnected } = useAccount();
  const { isAuditor, isLoading } = useIsAuditor();

  return (
    <div className="container py-12">
      {!isConnected ? (
        <p className="mx-auto max-w-md rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          Connect a wallet to continue.
        </p>
      ) : isLoading ? (
        <p className="mx-auto max-w-md rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          Checking access…
        </p>
      ) : !isAuditor ? (
        <p className="mx-auto max-w-md rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-dim">
          This wallet doesn&apos;t have AUDITOR_ROLE on VellichorAuthenticityRegistry or Vault
          ownership. Access denied.
        </p>
      ) : (
        <BottleIntakeWizard />
      )}
    </div>
  );
}
