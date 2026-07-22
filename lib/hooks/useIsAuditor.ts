"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
  VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
  VELLICHOR_VAULT_ABI,
  VELLICHOR_VAULT_ADDRESS,
  verificationConfigured,
  contractsConfigured,
} from "@/lib/contracts";

// keccak256("AUDITOR_ROLE") — computed directly via ethers, not guessed, and must
// match VellichorAuthenticityRegistry.AUDITOR_ROLE exactly or every role check here
// silently returns false instead of failing loudly.
const AUDITOR_ROLE = "0x59a1c48e5837ad7a7f3dcedcbe129bf3249ec4fbf651fd4f5e2600ead39fe2f5" as const;

/**
 * Gate for the internal bottle intake tool. A wallet is authorized if it holds
 * AUDITOR_ROLE on VellichorAuthenticityRegistry, or is the VellichorVault owner
 * (owner() is who listBottle() actually requires, so they need access too even if
 * a separate auditor role was granted to someone else).
 */
export function useIsAuditor() {
  const { address, isConnected } = useAccount();

  const { data: hasAuditorRole, isLoading: loadingRole } = useReadContract({
    address: VELLICHOR_AUTHENTICITY_REGISTRY_ADDRESS,
    abi: VELLICHOR_AUTHENTICITY_REGISTRY_ABI,
    functionName: "hasRole",
    args: address ? [AUDITOR_ROLE, address] : undefined,
    query: { enabled: verificationConfigured && isConnected && !!address },
  });

  const { data: vaultOwner, isLoading: loadingOwner } = useReadContract({
    address: VELLICHOR_VAULT_ADDRESS,
    abi: VELLICHOR_VAULT_ABI,
    functionName: "owner",
    query: { enabled: contractsConfigured },
  });

  const isVaultOwner =
    isConnected && !!address && !!vaultOwner && (vaultOwner as string).toLowerCase() === address.toLowerCase();

  return {
    isAuditor: !!hasAuditorRole || isVaultOwner,
    isLoading: loadingRole || loadingOwner,
  };
}
