require("dotenv").config();
const fs = require("fs");
const path = require("path");

// bottle-1.webp is already pinned and bottle-1.json.image already points at
// its real CID (verified live on the Pinata gateway) — this only pins the
// JSON metadata file itself, the one remaining step from Task 1.

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
    throw new Error("PINATA_JWT is not set. Add it to .env before running this script.");
  }

  const jsonPath = path.join(__dirname, "..", "metadata", "bottle-1.json");
  console.log("=== Uploading bottle-1.json to IPFS ===");
  const jsonCid = await pinFile(jsonPath, "bottle-1.json");
  console.log(`Metadata CID: ${jsonCid}`);
  console.log(`Metadata URI: ipfs://${jsonCid}`);
  console.log("\nUse this as metadataURI for a future listBottle() call.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
