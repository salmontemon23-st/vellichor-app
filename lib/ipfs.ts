const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

/** Converts an ipfs:// URI (or bare CID/path) into an HTTP gateway URL. */
export function ipfsToHttp(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}/${uri.slice("ipfs://".length)}`;
  }
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  return `${IPFS_GATEWAY}/${uri}`;
}

export interface BottleMetadata {
  name?: string;
  description?: string;
  image?: string;
  // Optional additional angles/provenance photos (front label, back label,
  // certificate, condition close-up). Not present in any bottle's metadata
  // yet — the item detail page's thumbnail strip only renders when a bottle
  // actually has these, rather than faking multiple photos from one image.
  images?: string[];
  attributes?: { trait_type: string; value: string }[];
  // Optional cooldown — unix seconds timestamp. Until this passes, the app
  // blurs this bottle's image everywhere it's shown (set at mint time,
  // entirely optional — most bottles won't have this field at all).
  revealAt?: number;
}

const metadataCache = new Map<string, Promise<BottleMetadata | null>>();

/** Fetches and caches bottle metadata JSON referenced by a Vault bottle's metadataURI. */
export function fetchBottleMetadata(metadataURI: string): Promise<BottleMetadata | null> {
  if (!metadataURI) return Promise.resolve(null);
  const cached = metadataCache.get(metadataURI);
  if (cached) return cached;

  const url = ipfsToHttp(metadataURI);
  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        // metadataURI points directly to an image instead of a JSON blob —
        // fall back to using it as the bottle image.
        return { image: url } as BottleMetadata;
      }
      return (await res.json()) as BottleMetadata;
    })
    .catch(() => null);

  metadataCache.set(metadataURI, promise);
  return promise;
}
