const PINATA_JWT = process.env.VITE_PINATA_JWT;

if (!PINATA_JWT) {
  console.error("Missing VITE_PINATA_JWT in environment");
  process.exit(1);
}

async function main() {
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    app: "pawledger",
    type: "pinata-smoke-test",
    timestamp,
  });

  const blob = new Blob([body], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, `pawledger-smoke-${Date.now()}.json`);
  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: "pawledger-smoke",
      keyvalues: { test: "true", source: "cli" },
    })
  );
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log("PINATA_SMOKE_OK");
  console.log(`CID=${data.IpfsHash}`);
  console.log(`GATEWAY_URL=https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
}

main().catch((err) => {
  console.error("PINATA_SMOKE_FAIL");
  console.error(err.message || String(err));
  process.exit(1);
});
