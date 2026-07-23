import { NextRequest, NextResponse } from "next/server";

// Server-side only — PINATA_JWT never reaches the client bundle (no
// NEXT_PUBLIC_ prefix). Takes the bottle photo + metadata fields from the
// mint form, pins the image then the metadata JSON to IPFS via Pinata, and
// returns the resulting metadataURI for listBottle().
const PINATA_API = "https://api.pinata.cloud";

async function pinFile(jwt: string, blob: Blob, fileName: string): Promise<string> {
  const data = new FormData();
  data.append("file", blob, fileName);
  data.append("pinataMetadata", JSON.stringify({ name: fileName }));

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Pinata upload failed for ${fileName}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.IpfsHash as string;
}

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json({ error: "PINATA_JWT is not configured on the server." }, { status: 500 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const image = form.get("image");
  const name = form.get("name");
  const description = form.get("description");
  const attributesJson = form.get("attributes");
  const revealAtRaw = form.get("revealAt");

  if (!(image instanceof Blob) || image.size === 0) {
    return NextResponse.json({ error: "A bottle photo is required." }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Bottle name is required." }, { status: 400 });
  }

  let attributes: { trait_type: string; value: string }[] = [];
  if (typeof attributesJson === "string" && attributesJson.trim()) {
    try {
      attributes = JSON.parse(attributesJson);
    } catch {
      return NextResponse.json({ error: "attributes must be valid JSON." }, { status: 400 });
    }
  }

  let revealAt: number | undefined;
  if (typeof revealAtRaw === "string" && revealAtRaw.trim()) {
    const parsed = Number(revealAtRaw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json({ error: "revealAt must be a positive unix timestamp." }, { status: 400 });
    }
    revealAt = parsed;
  }

  try {
    const IMAGE_EXT_BY_TYPE: Record<string, string> = {
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/jpeg": "jpg",
    };
    const imageExt = IMAGE_EXT_BY_TYPE[image.type] ?? "jpg";
    const imageCid = await pinFile(jwt, image, `bottle.${imageExt}`);

    const metadata = {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : "",
      image: `ipfs://${imageCid}`,
      attributes,
      ...(revealAt ? { revealAt } : {}),
    };

    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const metadataCid = await pinFile(jwt, metadataBlob, "metadata.json");

    return NextResponse.json({ metadataURI: `ipfs://${metadataCid}`, imageURI: `ipfs://${imageCid}` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
