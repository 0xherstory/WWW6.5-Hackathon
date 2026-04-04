/**
 * setAdmins.js — 为所有合约批量设置管理员
 *
 * 用法：
 *   npx hardhat run scripts/setAdmins.js --network fuji
 *
 * 说明：
 *   管理员（admin）可执行大部分 owner 操作，但不能转移 ownership。
 *   CatRegistry 的机构审批采用多数投票制：
 *     - 投票者 = owner + 所有 admin
 *     - 超过半数投 approve → 机构通过，超过半数投 reject → 机构拒绝
 *   所以 admin 越多，单票通过门槛越高。
 *   Demo 阶段建议 owner 独自投票（不设 admin），1票即可通过。
 */

const { ethers } = require("hardhat");

// ── 填入需要授权的管理员地址 ─────────────────────────────────
const ADMINS = [
  "0xA80deB694775DD09e5141b2097A879c7419309c0",
  "0xc3AE0Fd5d1Be2A5d19bb683E43fFa0D3991a074d",
];

// ── 填入部署后的合约地址 ──────────────────────────────────────
const ADDRESSES = {
  catRegistry:   "0x00eeC3763FAaA03A8d758C87E623Fb30318198bf",
  catNFT:        "0xe0C9746BE2f5b09B130f21677E396Ced226372d9",
  adoptionVault: "0x42b4E7784Daed2Ef06d9fC14D89Ee1d76454d08C",
  donationVault: "0x809FDA8D72823E6781A9aCbfCb7eb2193B2b2E7f",
  purrToken:     "0xE9F6089908CC054dF4095f227566F0b3696279B1",
  equipmentNFT:  "0xE909bEe5bf2675967D720D586Dc749460163B149",
  gameContract:  "0x5A7425Cd5a5A7Febe1E1AcA81b4B5285005750F0",
};

const ABI = ["function setAdmin(address,bool) external"];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\nOwner: ${deployer.address}`);

  if (ADMINS.length === 0) {
    console.log("⚠️  ADMINS 列表为空，跳过所有设置。");
    console.log("   若要添加管理员，请在 ADMINS 数组中填入地址后重新运行。");
    return;
  }

  console.log(`管理员列表（共 ${ADMINS.length} 个）：`);
  ADMINS.forEach(a => console.log(`  ${a}`));
  console.log(`\n注意：设置后投票多数门槛 = floor((1 + ${ADMINS.length}) / 2) + 1 = ${Math.floor((1 + ADMINS.length) / 2) + 1} 票`);
  console.log("");

  for (const [name, addr] of Object.entries(ADDRESSES)) {
    if (addr.includes("填入")) {
      console.log(`⚠️  跳过 ${name}（地址未填入）`);
      continue;
    }
    const c = new ethers.Contract(addr, ABI, deployer);
    for (const admin of ADMINS) {
      const adminAddr = admin.toLowerCase();
      process.stdout.write(`  ${name}.setAdmin(${admin.slice(0,10)}...)...`);
      try {
        const tx = await c.setAdmin(admin, true);
        await tx.wait();
        console.log(" ✅");
      } catch (e) {
        console.log(` ❌ ${e.message?.slice(0, 80)}`);
      }
    }
  }

  console.log("\n✅ setAdmins 完成");
}

main().catch(e => { console.error(e); process.exit(1); });
