/**
 * deploy.js — PurrChain v2 一键部署脚本
 *
 * 用法：
 *   npx hardhat run scripts/deploy.js --network fuji
 *
 * 部署顺序：
 *   1. CatRegistry
 *   2. CatNFT
 *   3. PurrToken
 *   4. DonationVault
 *   5. AdoptionVault
 *   6. EquipmentNFT
 *   7. GameContract
 *
 * 自动配置：
 *   - 所有权限（setAuthorizedMinter / setAuthorizedContract / setGameContract）
 *   - 12个装备模板（武器/背包/靴子 × 4稀有度）
 *   - 3个 Collection 收藏系列
 */

const { ethers } = require("hardhat");

// ── 工具函数 ────────────────────────────────────────────────
function log(title) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"─".repeat(60)}`);
}

async function deploy(name, ...args) {
  process.stdout.write(`  ⏳ 部署 ${name}...`);
  const Factory   = await ethers.getContractFactory(name);
  const contract  = await Factory.deploy(...args);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(` ✅  ${address}`);
  return contract;
}

async function send(label, txPromise) {
  process.stdout.write(`  ⏳ ${label}...`);
  const tx      = await txPromise;
  const receipt = await tx.wait();
  console.log(` ✅  (gas: ${receipt.gasUsed})`);
}

// ── 主流程 ───────────────────────────────────────────────────
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX`);

  // ── 1. CatRegistry ──────────────────────────────────────
  log("1  CatRegistry");
  const catRegistry = await deploy("CatRegistry");

  // ── 2. CatNFT ───────────────────────────────────────────
  log("2  CatNFT");
  const catNFT = await deploy("CatNFT",
    await catRegistry.getAddress()
  );

  // ── 3. PurrToken ─────────────────────────────────────────
  log("3  PurrToken");
  const purrToken = await deploy("PurrToken",
    await catNFT.getAddress(),
    await catRegistry.getAddress()
  );

  // ── 4. DonationVault ─────────────────────────────────────
  log("4  DonationVault");
  const donationVault = await deploy("DonationVault",
    await catRegistry.getAddress(),
    await catNFT.getAddress()
  );

  // ── 5. AdoptionVault ─────────────────────────────────────
  log("5  AdoptionVault");
  const adoptionVault = await deploy("AdoptionVault",
    await catRegistry.getAddress(),
    await catNFT.getAddress()
  );

  // ── 6. EquipmentNFT ──────────────────────────────────────
  log("6  EquipmentNFT");
  const equipmentNFT = await deploy("EquipmentNFT");

  // ── 7. GameContract ──────────────────────────────────────
  log("7  GameContract");
  const gameContract = await deploy("GameContract",
    await catNFT.getAddress(),
    await purrToken.getAddress(),
    await equipmentNFT.getAddress()
  );

  // ── 权限配置 ──────────────────────────────────────────────
  log("权限配置");

  await send("catNFT.setAuthorizedMinter(purrToken)",
    catNFT.setAuthorizedMinter(await purrToken.getAddress(), true));
  await send("catNFT.setAuthorizedMinter(donationVault)",
    catNFT.setAuthorizedMinter(await donationVault.getAddress(), true));
  await send("catNFT.setAuthorizedMinter(adoptionVault)",
    catNFT.setAuthorizedMinter(await adoptionVault.getAddress(), true));
  await send("catNFT.setAuthorizedMinter(gameContract)",
    catNFT.setAuthorizedMinter(await gameContract.getAddress(), true));

  await send("catRegistry.setAuthorizedContract(donationVault)",
    catRegistry.setAuthorizedContract(await donationVault.getAddress(), true));
  await send("catRegistry.setAuthorizedContract(adoptionVault)",
    catRegistry.setAuthorizedContract(await adoptionVault.getAddress(), true));

  await send("purrToken.setGameContract(gameContract)",
    purrToken.setGameContract(await gameContract.getAddress(), true));

  await send("equipmentNFT.setGameContract(gameContract)",
    equipmentNFT.setGameContract(await gameContract.getAddress()));

  // ── 装备模板 ──────────────────────────────────────────────
  log("装备模板（12个）");

  const templates = [
    // slot=0 武器 (利爪/挂饰) - 强化"探险稀有度"
    { slot:0, rarity:0, name:"竹节护爪",   lore:"修竹微凉，护其爪牙，探险山野之初选",             rarityB:200,  safetyB:0, carryB:0,   speedB:0    },
    { slot:0, rarity:1, name:"洗墨银钩",   lore:"如文人笔触，钩月无声，月影下寒芒微露",           rarityB:600,  safetyB:0, carryB:0,   speedB:0    },
    { slot:0, rarity:2, name:"金铃缀玉",   lore:"灵动如金铃，温润如古玉，贵气天成避凶趋吉",       rarityB:1200, safetyB:0, carryB:0,   speedB:0    },
    { slot:0, rarity:3, name:"麒麟锦绣",   lore:"瑞兽护持，锦绣入魂，传说中惊动山海的神器",       rarityB:2500, safetyB:0, carryB:0,   speedB:0    },
    // slot=1 背包 (布袋/行囊) - 增加"负重能力"
    { slot:1, rarity:0, name:"粗麻布兜",   lore:"市井寻常物，胜在轻便，可装几枚咸鱼干",           rarityB:0, safetyB:0, carryB:200,  speedB:0    },
    { slot:1, rarity:1, name:"青染绫罗袋", lore:"苏绣青染，丝缕绵密，内部别有乾坤",               rarityB:0, safetyB:0, carryB:600,  speedB:0    },
    { slot:1, rarity:2, name:"檀木百宝匣", lore:"千年古木所制，异香萦绕，纳百财而不漏",           rarityB:0, safetyB:0, carryB:1200, speedB:0    },
    { slot:1, rarity:3, name:"乾坤绣帕",   lore:"方寸之帕，袖里乾坤，可纳江河湖海",               rarityB:0, safetyB:0, carryB:2500, speedB:0    },
    // slot=2 靴子 (足衣/软底) - 提升"行走速度"
    { slot:2, rarity:0, name:"草编软垫",   lore:"清凉透气，行走乡野间，落地无声",                 rarityB:0, safetyB:0, carryB:0,   speedB:200  },
    { slot:2, rarity:1, name:"锦缎绒靴",   lore:"内衬软绒，如踏云端，奔跑间轻盈如风",             rarityB:0, safetyB:0, carryB:0,   speedB:600  },
    { slot:2, rarity:2, name:"踏雪无痕",   lore:"白绸覆面，纵使穿行霜雪，亦不沾半点泥尘",         rarityB:0, safetyB:0, carryB:0,   speedB:1200 },
    { slot:2, rarity:3, name:"御风乘云履", lore:"仙家遗宝，步步生莲，瞬息千里不在话下",           rarityB:0, safetyB:0, carryB:0,   speedB:2500 },
  ];

  for (const t of templates) {
    await send(`addEquipTemplate(${t.name})`,
      gameContract.addEquipTemplate(
        t.rarity, t.slot, t.name, t.lore,
        t.rarityB, t.safetyB, t.carryB, t.speedB
      )
    );
  }

  // ── 输出合约地址 ──────────────────────────────────────────
  log("✅ 部署完成 — 合约地址");

  const addresses = {
    catRegistry:   await catRegistry.getAddress(),
    catNFT:        await catNFT.getAddress(),
    purrToken:     await purrToken.getAddress(),
    donationVault: await donationVault.getAddress(),
    adoptionVault: await adoptionVault.getAddress(),
    equipmentNFT:  await equipmentNFT.getAddress(),
    gameContract:  await gameContract.getAddress(),
  };

  for (const [name, addr] of Object.entries(addresses)) {
    console.log(`  ${name.padEnd(14)}: ${addr}`);
  }

  // ── 本地网络：缩短出猎时间 + Demo 数据 ────────────────────
  const network = await ethers.provider.getNetwork();
  const isLocalhost = network.chainId === 31337n;

  if (isLocalhost) {
    log("🛠  本地网络：缩短出猎时间（10s/20s/40s）");
    await send("setHuntParams",
      gameContract.setHuntParams(
        [10, 20, 40],
        [1, 2, 3],
        [2, 5, 15]
      )
    );

    log("🛠  本地网络：注册 Demo 机构并登记雀猫");
    // deployer 兼做机构
    await send("registerShelter",
      catRegistry.registerShelter("爱心猫舍 (Demo)", "台湾彰化"));
    await send("voteApprove (owner)",
      catRegistry.voteApprove(deployer.address, true));

    await send("addCat (雀猫)",
      catRegistry.addCat(
        "雀猫", 1, "female",
        "活泼好动的小雀猫，等待有缘人的守护",
        ["", "", ""]   // URI 留空，部署后通过管理员界面或 updateCatStageURI 填入
      )
    );
    console.log("  ℹ️  catId=0 已登记（雀猫），URI 待管理员界面设置，机构地址 = deployer");
  }

  console.log("\n📋 复制以上地址到以下文件：");
  console.log("  - scripts/setAdmins.js   (ADDRESSES 对象)");
  console.log("  - scripts/setShares.js   (PURR_TOKEN 地址)");
  console.log("  - src/lib/contracts.ts   (ADDRESSES 对象)");
  console.log("\n⚠️  部署后必须执行：");
  console.log("  npx hardhat run scripts/setAdmins.js --network fuji");
  console.log("  npx hardhat run scripts/setShares.js --network fuji");
  console.log("  （然后在前端或 console 注册机构并登记猫咪）");
  console.log("\n📝 所有 NFT URI 均需在管理员界面设置，部署后无任何预设 URI：");
  console.log("  - 全家福 URI：管理员界面 → 全家福 NFT URI 管理 → 推进季度");
  console.log("  - Genesis URI：管理员界面 → 合约配置 → setGenesisURI");
  console.log("  - 收藏系列：管理员界面 → 游戏配置 → 收藏系列管理 → 添加新系列");
  console.log("  - 装备 URI：管理员界面 → 装备 NFT URI 设置（slot × rarity 共12种）");
  console.log("\n⚠️  Fuji 测试网演示时需手动缩短出猎时间：");
  console.log("  gameContract.setHuntParams([10, 20, 40], [1,2,3], [2,5,15])");
}

main().catch(err => { console.error(err); process.exit(1); });
