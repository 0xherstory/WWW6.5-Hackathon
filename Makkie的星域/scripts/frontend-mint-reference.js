/**
 * frontend-mint-reference.js
 * 前端 doMint() 改造参考（不要直接复制，理解后整合进 index.html）
 *
 * 依赖：ethers v6（在 index.html 里通过 CDN 引入）
 *   <script src="https://cdn.jsdelivr.net/npm/ethers@6.13.0/dist/ethers.umd.min.js"></script>
 *
 * 完整流程：
 *   1. 计算 dataHash（本地数据哈希，隐私承诺）
 *   2. 上传 metadata 到 Pinata → 得到 ipfsURI
 *   3. 向平台后端请求 EIP-712 签名
 *   4. 调用合约 mintStamp()
 *   5. 等待交易确认，写 localStorage
 */

// ─── 合约配置（部署后填入） ─────────────────────────────────────
const CONTRACT_ADDRESS = "0x你的合约地址";
const CONTRACT_ABI = [
  "function mintStamp(string planet, string stampName, bytes32 dataHash, string tokenURI, bytes signature) external",
  "function nonces(address) view returns (uint256)",
  "function verifyDataHash(uint256 tokenId, bytes32 preimage) view returns (bool)",
  "event StampMinted(address indexed owner, uint256 indexed tokenId, string planet, string stampName, bytes32 dataHash, uint64 mintedAt)"
];

// ─── Step 1：计算 dataHash ───────────────────────────────────────
/**
 * 原像字段固定顺序：planet, stampName, personId, intensity, protect, timestamp
 * personId/intensity/protect 是私密本地数据，永不上链
 */
function computeDataHash(entry) {
  // entry = { planet, stampName, personId, intensity, protect, t }
  return ethers.solidityPackedKeccak256(
    ["string", "string", "string", "string", "string", "uint64"],
    [
      entry.planet    ?? "",
      entry.stampName ?? "",
      entry.personId  ?? "",
      entry.intensity ?? "",
      entry.protect   ?? "",
      BigInt(Math.floor((entry.t ?? Date.now()) / 1000)), // 秒级 uint64
    ]
  );
}

// ─── Step 2：上传 metadata 到 Pinata ────────────────────────────
async function uploadMetadataToPinata(entry, dataHash) {
  const PINATA_JWT = "你的_Pinata_JWT"; // 建议从后端中转，不要暴露在前端

  // NFT metadata 格式（ERC-721 标准）
  const metadata = {
    name: entry.stampName || `${entry.planet} 印记`,
    description: `情绪星域 · ${entry.planet} · ${new Date(entry.t).toLocaleDateString("zh-CN")}`,
    image: `ipfs://你的图片CID/${entry.planet}.webp`, // 预先上传的图片 CID
    attributes: [
      { trait_type: "Planet",     value: entry.planet },
      { trait_type: "Stamp Name", value: entry.stampName || "未命名" },
      { trait_type: "Data Hash",  value: dataHash },   // 承诺哈希公开
      // 注意：personId/intensity/protect 不在这里，只在 dataHash 里
    ],
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({ pinataContent: metadata }),
  });

  if (!res.ok) throw new Error("Pinata upload failed: " + (await res.text()));
  const { IpfsHash } = await res.json();
  return `ipfs://${IpfsHash}`;
}

// ─── Step 3：向平台后端请求签名 ──────────────────────────────────
async function requestMintSignature({ walletAddress, planet, stampName, dataHash, tokenURI, nonce }) {
  // 后端接口（你自己实现，见下方 backend-signer-reference.js）
  const res = await fetch("https://你的后端/api/sign-mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, planet, stampName, dataHash, tokenURI, nonce }),
  });
  if (!res.ok) throw new Error("签名请求失败: " + (await res.text()));
  const { signature } = await res.json();
  return signature;
}

// ─── Step 4+5：主函数，替换 doMint() ────────────────────────────
async function doMintOnChain(stampName) {
  // 关闭命名弹窗
  document.getElementById("stamp-name-modal").classList.remove("is-open");

  // 获取最新旅程记录（链上铸造的那条）
  let journey = [];
  try { journey = JSON.parse(localStorage.getItem("moodRealm_journey") || "[]"); } catch(e) {}
  if (!journey[0]) { alert("找不到旅程记录"); return; }
  const entry = { ...journey[0], stampName };

  try {
    // 1. 连接 MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const wallet   = await signer.getAddress();

    // 2. 计算 dataHash
    const dataHash = computeDataHash(entry);

    // 3. 上传 metadata
    document.getElementById("result-nft-line").textContent = "正在上传元数据…";
    const tokenURI = await uploadMetadataToPinata(entry, dataHash);

    // 4. 获取 nonce
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const nonce = await contract.nonces(wallet);

    // 5. 请求平台签名
    document.getElementById("result-nft-line").textContent = "等待平台授权…";
    const signature = await requestMintSignature({
      walletAddress: wallet,
      planet: entry.planet,
      stampName: entry.stampName ?? "",
      dataHash,
      tokenURI,
      nonce: nonce.toString(),
    });

    // 6. 发送交易
    document.getElementById("result-nft-line").textContent = "铸造中，请在 MetaMask 确认…";
    const tx = await contract.mintStamp(entry.planet, entry.stampName ?? "", dataHash, tokenURI, signature);
    document.getElementById("result-nft-line").textContent = `交易已发送：${tx.hash.slice(0, 14)}…`;

    // 7. 等待确认
    const receipt = await tx.wait(1);
    const mintedEvent = receipt.logs
      .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
      .find(e => e?.name === "StampMinted");
    const tokenId = mintedEvent?.args?.tokenId ?? "?";

    // 8. 写 localStorage（附上 tokenId 和 txHash）
    journey[0].stampName = stampName;
    journey[0].minted    = true;
    journey[0].dataHash  = dataHash;
    journey[0].txHash    = tx.hash;
    journey[0].tokenId   = tokenId.toString();
    localStorage.setItem("moodRealm_journey", JSON.stringify(journey));

    document.getElementById("result-nft-line").textContent =
      `星球印记 NFT #${tokenId}「${stampName || "无名"}」已铸造 · ${tx.hash.slice(0, 14)}…`;

    runTransitionThen(() => renderStampScene(stampName));

  } catch (err) {
    console.error("Mint failed:", err);
    document.getElementById("result-nft-line").textContent = "铸造失败：" + (err?.reason || err?.message || "未知错误");
  }
}
