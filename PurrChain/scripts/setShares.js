/**
 * setShares.js — 配置 AVAX 收益分配比例
 * 用法：npx hardhat run scripts/setShares.js --network fuji
 */
const { ethers } = require("hardhat");

const PURR_TOKEN = "0xE9F6089908CC054dF4095f227566F0b3696279B1";

// 收款方和比例（万分比，总和必须 = 10000）
// 示例：owner 独占 100%
const RECIPIENTS = [
  "0x99d23e329CBF9989581De6b6D15A7d2C3DD342df",  // owner
];
const SHARES = [10000];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Owner: ${deployer.address}`);

  const total = SHARES.reduce((a, b) => a + b, 0);
  if (total !== 10000) { console.error("❌ 比例总和必须为 10000"); process.exit(1); }

  const c = new ethers.Contract(
    PURR_TOKEN,
    ["function setShares(address[],uint256[]) external"],
    deployer
  );
  process.stdout.write("设置分账比例...");
  const tx = await c.setShares(RECIPIENTS, SHARES);
  await tx.wait();
  console.log(" ✅");
  console.log("✅ setShares 完成");
}
main().catch(e => { console.error(e); process.exit(1); });
