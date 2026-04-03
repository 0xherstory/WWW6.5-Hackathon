import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const INTERN_SBT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function mintSBT(string calldata _credentialId, string calldata _companyId, bytes32 _credentialHash, uint256 _expireTime, bytes calldata _signature) external",
  "function isValidCredential(uint256 _tokenId) external view returns (bool)",
  "function totalSupply() external view returns (uint256)"
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
  await tx.wait();
  console.log("✅ SBT 铸造成功！");

  const total = await contract.totalSupply();
  console.log("当前总持有人数:", total.toString());
}

main().catch(console.error);
