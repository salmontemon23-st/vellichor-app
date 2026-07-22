/**
 * Shared types for the off-chain redemption fulfillment flow (spec Part 2,
 * Step 5). Kept in a separate file (no Node built-ins) so client components
 * can safely `import type` from it without pulling the fs-backed store
 * (lib/redemption-store.ts) into the browser bundle.
 *
 * This data — shipping address, contact info, ID document reference — is
 * intentionally never written on-chain. See VellichorVault.sol's
 * requestRedemption(): it only burns units, it has no shipping/KYC concept.
 */

export type RedemptionStatus = "pending_info" | "submitted" | "verified" | "shipped" | "delivered";

export interface RedemptionFormFields {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  idDocumentName: string;
}

export interface RedemptionFulfillment extends RedemptionFormFields {
  id: string;
  wallet: string;
  bottleId: string;
  status: RedemptionStatus;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Only "pending_info" and "submitted" reflect wallet-controlled next steps
 * (fill in / edit the form). "verified" and "shipped" are set by
 * Vellichor's team/compliance process, not by this frontend — but the
 * bottle should still stay visible in Portfolio's "Pending Redemption"
 * section through "verified" since it hasn't shipped yet. Only "shipped"
 * and "delivered" are treated as complete and dropped from that section.
 */
export const REDEMPTION_STATUS_COPY: Record<RedemptionStatus, { message: string; cta: string }> = {
  pending_info: {
    message: "Action needed: complete your shipping & ID details",
    cta: "Complete redemption details",
  },
  submitted: {
    message: "Submitted — awaiting verification",
    cta: "View / edit submission",
  },
  verified: {
    message: "Verified — preparing your shipment",
    cta: "View / edit submission",
  },
  shipped: {
    message: "Shipped",
    cta: "View submission",
  },
  delivered: {
    message: "Delivered",
    cta: "View submission",
  },
};
