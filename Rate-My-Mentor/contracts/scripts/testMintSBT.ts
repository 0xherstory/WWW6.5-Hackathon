import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// Fuji deployed address (see contracts/ignition/deployments/chain-43113/deployed_addresses.json)
const INTERN_SBT_ADDRESS =
  process.env.INTERN_SBT_ADDRESS ??
  "0x0F51f416471AD9678251b68948d1bEE72925822a";

const ABI = [
  "function mintSBT(string calldata _credentialId, string calldata _companyId, bytes32 _credentialHash, uint256 _expireTime, bytes calldata _signature) external",
  "function isValidCredential(uint256 _tokenId) external view returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "event SBTMinted(address indexed walletAddress, uint256 indexed tokenId, bytes32 indexed credentialHash)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_FUJI_RPC_URL);
  const userWallet = new ethers.Wallet(process.env.AVALANCHE_PRIVATE_KEY!, provider);
  const backendWallet = new ethers.Wallet(process.env.AVALANCHE_PRIVATE_KEY!, provider);

  const credentialId = "cred-001";
  const companyId = "company-001";
  const credentialHash = ethers.keccak256(ethers.toUtf8Bytes("test-credential-001"));
  const expireTime = Math.floor(Date.now() / 1000) + 3600;

  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    ["string", "address", "string", "bytes32", "uint256"],
    [credentialId, userWallet.address, companyId, credentialHash, expireTime]
  );
  const hash = ethers.keccak256(encoded);
  const signature = await backendWallet.signMessage(ethers.getBytes(hash));

  const contract = new ethers.Contract(INTERN_SBT_ADDRESS, ABI, userWallet);
  
  console.log("正在铸造 SBT...");
  const tx = await contract.mintSBT(credentialId, companyId, credentialHash, expireTime, signature);
  console.log("交易已发送:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ SBT 铸造成功！");

  // Extract tokenId from event logs (best-effort)
  try {
    for (const log of receipt.logs) {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "SBTMinted") {
        console.log("minted tokenId:", parsed.args.tokenId.toString());
        break;
      }
    }
  } catch {
    // ignore parsing issues
  }

  const total = await contract.totalSupply();
  console.log("当前总持有人数:", total.toString());
}

main().catch(console.error);
