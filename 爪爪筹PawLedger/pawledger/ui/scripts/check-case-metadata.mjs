import { readFile } from "node:fs/promises";
import { ethers } from "ethers";

const DEFAULT_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const DEFAULT_LEDGER = "0x7C2BBb15Cc5becD532ad10B696C35ebbDbFE92C3";

function parseArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

async function loadAbi() {
  const abiPath = new URL("../src/abis/PawLedger.json", import.meta.url);
  const raw = await readFile(abiPath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const rpc = parseArg("--rpc") || process.env.RPC_URL || DEFAULT_RPC;
  const address =
    parseArg("--address") || process.env.PAWLEDGER_ADDRESS || DEFAULT_LEDGER;
  const requestedCaseId = parseArg("--case-id");

  const abi = await loadAbi();
  const provider = new ethers.JsonRpcProvider(rpc);
  const pawLedger = new ethers.Contract(address, abi, provider);

  const total = Number(await pawLedger.getCasesCount());
  if (total === 0) {
    console.log("No cases found on contract");
    return;
  }

  const caseId = requestedCaseId !== null ? Number(requestedCaseId) : total - 1;
  if (!Number.isInteger(caseId) || caseId < 0 || caseId >= total) {
    throw new Error(`Invalid case id ${requestedCaseId}. Valid range: 0..${total - 1}`);
  }

  const data = await pawLedger.cases(caseId);
  let metadata = null;
  try {
    metadata = JSON.parse(data.ipfsMetadata);
  } catch {
    metadata = { raw: data.ipfsMetadata };
  }

  const images = Array.isArray(metadata.images) ? metadata.images : [];

  console.log(`CONTRACT=${address}`);
  console.log(`CASE_ID=${caseId}`);
  console.log(`CASES_TOTAL=${total}`);
  console.log(`RESCUER=${data.rescuer}`);
  console.log(`STATUS=${Number(data.status)}`);
  console.log(`TITLE=${metadata.title || ""}`);
  console.log(`IMAGE_CID_COUNT=${images.length}`);

  images.forEach((cid, index) => {
    console.log(`IMAGE_CID_${index}=${cid}`);
    console.log(`IMAGE_GATEWAY_${index}=https://gateway.pinata.cloud/ipfs/${cid}`);
  });
}

main().catch((err) => {
  console.error("CASE_METADATA_CHECK_FAIL");
  console.error(err.message || String(err));
  process.exit(1);
});
