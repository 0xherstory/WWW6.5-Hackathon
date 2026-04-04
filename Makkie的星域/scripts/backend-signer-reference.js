/**
 * backend-signer-reference.js
 * 平台后端签名服务参考（Node.js / Vercel / Cloudflare Worker）
 *
 * 这个服务持有平台签名私钥，收到前端请求后验证合法性，再用 EIP-712 签名。
 * 部署建议：Vercel Serverless Function 或 Cloudflare Worker
 */

import { ethers } from "ethers";

// ─── 环境变量（在部署平台设置，绝不写死在代码里） ─────────────────
const PLATFORM_SIGNER_PRIVATE_KEY = process.env.PLATFORM_SIGNER_PRIVATE_KEY; // 平台签名私钥
const CONTRACT_ADDRESS             = process.env.CONTRACT_ADDRESS;
const CHAIN_ID                     = 43113; // Fuji; 主网换成 43114

// EIP-712 Domain（必须和合约构造函数里的参数完全一致）
const DOMAIN = {
  name:              "MoodRealmStamp",
  version:           "1",
  chainId:           CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const TYPES = {
  MintRequest: [
    { name: "to",        type: "address" },
    { name: "planet",    type: "string"  },
    { name: "stampName", type: "string"  },
    { name: "dataHash",  type: "bytes32" },
    { name: "tokenURI",  type: "string"  },
    { name: "nonce",     type: "uint256" },
  ],
};

/**
 * POST /api/sign-mint
 * Body: { walletAddress, planet, stampName, dataHash, tokenURI, nonce }
 * Response: { signature }
 */
export async function signMintRequest(req, res) {
  // ── 基础校验（根据业务扩展，例如检查该用户是否真的完成了共鸣） ──
  const { walletAddress, planet, stampName, dataHash, tokenURI, nonce } = req.body;

  if (!walletAddress || !planet || !dataHash || !tokenURI || nonce === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 校验 planet 是有效星球名（防止伪造）
  const VALID_PLANETS = ["迷雾星球","泪海星球","债务星球","面具星球","枯竭星球","猎场星球","荆棘星球","藤蔓星球"];
  if (!VALID_PLANETS.includes(planet)) {
    return res.status(400).json({ error: "Invalid planet" });
  }

  // ── EIP-712 签名 ──────────────────────────────────────────────
  const signerWallet = new ethers.Wallet(PLATFORM_SIGNER_PRIVATE_KEY);

  const value = {
    to:        walletAddress,
    planet,
    stampName: stampName ?? "",
    dataHash,  // bytes32，前端传过来的 hex string
    tokenURI,
    nonce:     BigInt(nonce),
  };

  const signature = await signerWallet.signTypedData(DOMAIN, TYPES, value);

  return res.status(200).json({ signature });
}
