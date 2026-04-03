import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // 用 trustedBackend 的私钥签名
  const backendWallet = new ethers.Wallet(process.env.AVALANCHE_PRIVATE_KEY!);

  // 填入要铸造 SBT 的用户钱包地址
  const userAddress = "0x70D01ddFe5BFD1030282368a9f7F10087750f5a3";
  const credentialId = "cred-001";
  const companyId = "company-001";
  const credentialHash = ethers.keccak256(ethers.toUtf8Bytes("test-credential-001"));
  const expireTime = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
  const chainId = 43113; // Fuji

  const messageHash = ethers.solidityPackedKeccak256(
    ["string", "address", "string", "bytes32", "uint256"],
    [credentialId, userAddress, companyId, credentialHash, expireTime]
  );

  // 注意：合约用的是 abi.encode 不是 encodePacked
  // 需要改用 AbiCoder
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    ["string", "address", "string", "bytes32", "uint256"],
    [credentialId, userAddress, companyId, credentialHash, expireTime]
  );
  const hash = ethers.keccak256(encoded);
  const signature = await backendWallet.signMessage(ethers.getBytes(hash));

  console.log("credentialHash:", credentialHash);
  console.log("expireTime:", expireTime);
  console.log("signature:", signature);
}

main();