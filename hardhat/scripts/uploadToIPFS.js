require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Uploads metadata/bottle-1.webp and metadata/bottle-1.json to IPFS via Pinata,
// then rewrites bottle-1.json's placeholder image URI with the real image CID.
// Requires PINATA_JWT in .env (see .env.example).

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API = "https://api.pinata.cloud";

async function pinFile(filePath, fileName) {
  const data = new FormData();
  const blob = new Blob([fs.readFileSync(filePath)]);
  data.append("file", blob, fileName);
  data.append("pinataMetadata", JSON.stringify({ name: fileName }));

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Pinata upload failed for ${fileName}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.IpfsHash;
}

async function main() {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT is not set. Add it to .env (see .env.example) before running this script.");
  }

  const metadataDir = path.join(__dirname, "..", "metadata");
  const webpPath = path.join(metadataDir, "bottle-1.webp");
  const jsonPath = path.join(metadataDir, "bottle-1.json");

  console.log("=== Uploading bottle-1.webp to IPFS ===");
  const imageCid = await pinFile(webpPath, "bottle-1.webp");
  // pinFileToIPFS pins the single file itself, so the CID resolves directly
  // to the file bytes on a gateway — it is NOT a directory, so no /filename
  // suffix should be appended (that 404s).
  console.log(`Image CID: ${imageCid}`);
  console.log(`Image URI: ipfs://${imageCid}`);

  console.log("\n=== Updating bottle-1.json with real image URI ===");
  const metadata = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  metadata.image = `ipfs://${imageCid}`;
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2) + "\n");
  console.log("bottle-1.json updated locally.");

  console.log("\n=== Uploading bottle-1.json to IPFS ===");
  const jsonCid = await pinFile(jsonPath, "bottle-1.json");
  console.log(`Metadata CID: ${jsonCid}`);
  console.log(`Metadata URI: ipfs://${jsonCid}`);

  console.log("\n=== Done ===");
  console.log(`Use this as metadataURI for listBottle(): ipfs://${jsonCid}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
