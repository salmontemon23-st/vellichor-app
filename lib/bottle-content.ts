import type { BottleMetadata } from "./ipfs";

/**
 * Local fallback content for bottles whose on-chain metadataURI is empty or
 * unresolvable. The Vault contract has no update function, so a bottle's
 * metadataURI can never be fixed on-chain once listed — this fills in the
 * description/attributes the frontend still wants to show, keyed by
 * bottleId. Merged on top of whatever IPFS returns (real metadata still
 * wins field-by-field if it's ever present).
 *
 * Empty on this fresh mainnet deployment — the testnet-specific override
 * (keyed by testnet bottleId "3") didn't carry over, since mainnet's bottle
 * numbering starts over from 1 and that key would otherwise misattach a
 * testnet bottle's description to whatever real bottle becomes id 3 here.
 */
export const BOTTLE_CONTENT_OVERRIDES: Record<string, BottleMetadata> = {};
