/**
 * test_flow.js — PurrChain 主流程端到端测试
 *
 * 链上测试说明：
 *   链上数据永久保留，脚本会自动检测哪些步骤已完成并跳过，
 *   只执行尚未完成的操作，可以安全地重复运行。
 *
 * 运行方式（本地）：
 *   npx hardhat node
 *   npx hardhat run scripts/test_flow.js --network localhost
 *
 * 运行方式（Fuji 测试网）：
 *   npx hardhat run scripts/test_flow.js --network fuji
 *
 * 演示模式（自动调短出猎时间）：
 *   DEMO=true npx hardhat run scripts/test_flow.js --network fuji
 */

const { ethers } = require("hardhat");

// ── 合约地址配置 ────────────────────────────────────────────
const ADDRESSES_LOCAL = {
  catRegistry:   "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  catNFT:        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  purrToken:     "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  equipmentNFT:  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  gameContract:  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  donationVault: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  adoptionVault: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
};

const ADDRESSES_FUJI = {
  catRegistry:   "0x96208e12E4Af9F76C2Ea46D86474c1a90919ac45",
  catNFT:        "0x2E7Ccd19c383102831a54de2dF57Ad46198D9e37",
  purrToken:     "0xf79B8fe6A79fe1eBA747842B6B6D00b26F5ed250",
  equipmentNFT:  "0xb00081765ce22319060e7286BAdeFdE0B75120Ce",
  gameContract:  "0x469853196b0201fFedDB53008dF11659e22815ee",
  donationVault: "0xc55D34E3F1e3B690872934359930A64fb82dd56A",
  adoptionVault: "0xFcbA7E3ddc86bfFCFeD0dE62e4F404d9f05878C9",
};

// ── 工具函数 ────────────────────────────────────────────────

function log(title) {
  console.log(`\n${"─".repeat(56)}`);
  console.log(`  ${title}`);
  console.log(`${"─".repeat(56)}`);
}

async function send(label, txPromise) {
  process.stdout.write(`  ⏳ ${label}...`);
  const tx = await txPromise;
  const receipt = await tx.wait();
  console.log(` ✅  (gas: ${receipt.gasUsed})`);
  return receipt;
}

function skip(label, reason) {
  console.log(`  ⏭️  ${label} — ${reason}`);
}

async function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}${detail ? " — " + detail : ""}`);
  } else {
    console.error(`  ❌ ${label} 失败${detail ? ": " + detail : ""}`);
    process.exit(1);
  }
}

async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

// ── 主流程 ───────────────────────────────────────────────────

async function main() {
  const network = await ethers.provider.getNetwork();
  const isLocalhost = network.chainId === 31337n;
  const isDemo = process.env.DEMO === "true";
  const ADDRESSES = isLocalhost ? ADDRESSES_LOCAL : ADDRESSES_FUJI;

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const shelter  = signers[1] ?? deployer;
  const user     = signers[2] ?? deployer;

  console.log(`\nowner  : ${deployer.address}`);
  console.log(`shelter: ${shelter.address}`);
  console.log(`user   : ${user.address}`);
  console.log(`网络   : ${isLocalhost ? "localhost" : "fuji"}`);
  console.log(`演示   : ${isDemo ? "是（出猎时间已调短）" : "否"}`);

  const catRegistry   = await ethers.getContractAt("CatRegistry",   ADDRESSES.catRegistry,   deployer);
  const catNFT        = await ethers.getContractAt("CatNFT",        ADDRESSES.catNFT,        deployer);
  const purrToken     = await ethers.getContractAt("PurrToken",     ADDRESSES.purrToken,     deployer);
  const equipmentNFT  = await ethers.getContractAt("EquipmentNFT",  ADDRESSES.equipmentNFT,  deployer);
  const gameContract  = await ethers.getContractAt("GameContract",  ADDRESSES.gameContract,  deployer);
  const donationVault = await ethers.getContractAt("DonationVault", ADDRESSES.donationVault, deployer);

  // ── 演示模式：最先调短出猎时间 ─────────────────────────
  if (isDemo) {
    log("演示模式：调短出猎时间（最先执行）");
    await send("owner.setHuntParams（短60s / 中120s / 长180s）",
      gameContract.connect(deployer).setHuntParams(
        [60, 120, 180],
        [1, 2, 3],
        [2, 5, 15]
      )
    );
  }

  // ── 场景 1：机构注册 & 审批 ──────────────────────────────
  log("1  机构注册 & 审批");

  const shelterInfo = await catRegistry.shelters(shelter.address);
  const shelterName = shelterInfo.name;

  if (shelterName.length === 0) {
    // 未注册，执行注册
    await send("shelter.registerShelter",
      catRegistry.connect(shelter).registerShelter("爱心猫舍", "台湾彰化")
    );
  } else {
    skip("shelter.registerShelter", `已注册（${shelterName}）`);
  }

  const shelterInfoAfter = await catRegistry.shelters(shelter.address);
  if (shelterInfoAfter.status !== 1n) {
    // 未审批，执行审批
    await send("owner.approveShelter",
      catRegistry.connect(deployer).approveShelter(shelter.address)
    );
  } else {
    skip("owner.approveShelter", "已审批");
  }

  const finalShelterInfo = await catRegistry.shelters(shelter.address);
  await check("机构状态为 Approved", finalShelterInfo.status === 1n);

  // ── 场景 2：机构登记猫咪 ─────────────────────────────────
  log("2  机构登记猫咪");

  // 读取当前链上已有的猫咪数量，决定是否需要登记
  const catCountBefore = await catRegistry.catCount();

  let catId;
  if (catCountBefore === 0n) {
    await send("shelter.addCat（小雀）",
      catRegistry.connect(shelter).addCat(
        "小雀",
        1,
        "Female",
        "温顺活泼的小雀猫，期待一个温暖的家",
        [
          "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage1.json",
          "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage2_junior.json",
          "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/cat_stage3.json",
          "ipfs://bafybeiewjp2e4gmewiotq6pi2snbfta2gltblnaymdhbzkhv2hcq3psij4/genesis.json",
        ]
      )
    );
    catId = 0n;
  } else {
    catId = 0n; // 使用第一只猫
    const existingCat = await catRegistry.getCat(catId);
    skip("shelter.addCat", `已有猫咪：${existingCat.name}（id=${catId}）`);
  }

  const catInfo = await catRegistry.getCat(catId);
  await check("猫咪存在", catInfo.shelter !== ethers.ZeroAddress, `id=${catId} name=${catInfo.name}`);

  // ── 场景 3：新用户入场 ───────────────────────────────────
  log("3  新用户入场");

  // 3-1 领全家福
  let portraitTokenId;
  const hasPortrait = await catNFT.hasClaimedFamilyPortrait(user.address);
  if (!hasPortrait) {
    const nftSupplyBefore = await catNFT.totalSupply();
    await send("user.claimFamilyPortrait",
      catNFT.connect(user).claimFamilyPortrait()
    );
    portraitTokenId = nftSupplyBefore; // 新 mint 的 tokenId
  } else {
    // 已领过，找到用户持有的全家福 tokenId
    // 通过扫描 totalSupply 找到属于 user 且 type=3 的第一个 NFT
    const total = await catNFT.totalSupply();
    for (let i = 0n; i < total; i++) {
      try {
        const owner = await catNFT.ownerOf(i);
        const nType = await catNFT.nftType(i);
        if (owner.toLowerCase() === user.address.toLowerCase() && nType === 3n) {
          portraitTokenId = i;
          break;
        }
      } catch {}
    }
    if (portraitTokenId === undefined) {
      // 全家福已被销毁，跳过后续依赖全家福的步骤
      console.log("  ⚠️  全家福已销毁，跳过全家福相关验证");
      portraitTokenId = null;
    } else {
      skip("user.claimFamilyPortrait", `已领取（tokenId=${portraitTokenId}）`);
    }
  }

  if (portraitTokenId !== null) {
    const portraitType = await catNFT.nftType(portraitTokenId);
    await check("全家福 NFT type=3", portraitType === 3n);
  }

  // 3-2 领欢迎 PURR
  const hasWelcome = await purrToken.hasClaimedWelcome(user.address);
  if (!hasWelcome && portraitTokenId !== null) {
    const purrBefore = await purrToken.balanceOf(user.address);
    await send("user.claimWelcomeTokens",
      purrToken.connect(user).claimWelcomeTokens(portraitTokenId)
    );
    const purrAfter = await purrToken.balanceOf(user.address);
    await check("获得 20 PURR",
      purrAfter - purrBefore === ethers.parseEther("20"),
      `余额: ${ethers.formatEther(purrAfter)} PURR`
    );
  } else {
    skip("user.claimWelcomeTokens", hasWelcome ? "已领取" : "全家福已销毁");
  }

  // 3-3 购买 PURR
  const purrBalance = await purrToken.balanceOf(user.address);
  if (purrBalance < ethers.parseEther("50")) {
    await send("user.buyTokens（补充 PURR）",
      purrToken.connect(user).buyTokens({ value: ethers.parseEther("0.1") })
    );
  } else {
    skip("user.buyTokens", `余额充足（${ethers.formatEther(purrBalance)} PURR）`);
  }
  console.log(`  当前 PURR 余额: ${ethers.formatEther(await purrToken.balanceOf(user.address))} PURR`);

  // 3-4 领免费初始猫
  let starterCatTokenId;
  const hasStarterCat = await catNFT.hasClaimedStarterCat(user.address);
  if (!hasStarterCat) {
    const nftSupplyBefore = await catNFT.totalSupply();
    await send("user.claimStarterCat",
      gameContract.connect(user).claimStarterCat(catId)
    );
    starterCatTokenId = nftSupplyBefore;
  } else {
    // 已领过，找到 StarterCat tokenId
    const realCatId = await catNFT.starterCatOf(user.address);
    const tokenIds = await catNFT.getUserCatTokenIds(user.address, realCatId);
    // tokenIds[0] 是 stage1 的 tokenId
    starterCatTokenId = tokenIds[0];
    skip("user.claimStarterCat", `已领取（tokenId=${starterCatTokenId}）`);
  }

  const starterCatType = await catNFT.nftType(starterCatTokenId);
  await check("StarterCat NFT type=4", starterCatType === 4n);

  const stage = await catNFT.userCatStage(user.address, catId);
  await check("初始阶段 stage>=1", stage >= 1n, `stage=${stage}`);

  // ── 场景 4：商店购买道具 ─────────────────────────────────
  log("4  商店购买道具");

  const currentFood    = await gameContract.foodBalance(user.address);
  const currentCan     = await gameContract.canBalance(user.address);
  const currentBooster = await gameContract.boosterBalance(user.address);

  if (currentFood < 2n) {
    await send(`user.buyCatFood(${2n - currentFood})`,
      gameContract.connect(user).buyCatFood(2n - currentFood)
    );
  } else {
    skip("user.buyCatFood", `库存充足（${currentFood}个）`);
  }

  if (currentCan < 1n) {
    await send("user.buyCatCan(1)",
      gameContract.connect(user).buyCatCan(1)
    );
  } else {
    skip("user.buyCatCan", `库存充足（${currentCan}个）`);
  }

  if (currentBooster < 1n) {
    await send("user.buyBooster(1)",
      gameContract.connect(user).buyBooster(1)
    );
  } else {
    skip("user.buyBooster", `库存充足（${currentBooster}个）`);
  }

  const food    = await gameContract.foodBalance(user.address);
  const can     = await gameContract.canBalance(user.address);
  const booster = await gameContract.boosterBalance(user.address);
  await check("猫粮≥2，罐罐≥1，加速符≥1",
    food >= 2n && can >= 1n && booster >= 1n,
    `food=${food} can=${can} booster=${booster}`
  );

  // ── 场景 5：出猎 → 等待 → 结算 ──────────────────────────
  log("5  出猎 → 结算");

  const currentHuntInfo = await gameContract.huntInfo(starterCatTokenId);
  const stamina = await gameContract.staminaOf(user.address);
  console.log(`  出猎前体力: ${stamina}`);

  if (currentHuntInfo.status === 0n) {
    // Idle 状态，可以出猎
    await send("user.startHunt（短途+罐罐+加速符）",
      gameContract.connect(user).startHunt(
        starterCatTokenId,
        0,    // HuntDuration.Short
        2,    // HuntItem.Can
        true  // useBooster
      )
    );
  } else {
    skip("user.startHunt", "猫咪正在出猎中，直接等待结算");
  }

  const huntInfo = await gameContract.huntInfo(starterCatTokenId);
  await check("猫咪状态为 Hunting", huntInfo.status === 1n);
  console.log(`  实际出猎时长: ${Number(huntInfo.effectiveDuration)} 秒`);

  // 等待出猎结束
  const now = BigInt(Math.floor(Date.now() / 1000));
  const endTime = huntInfo.departureTime + huntInfo.effectiveDuration;

  if (isLocalhost) {
    const waitSec = Number(huntInfo.effectiveDuration) + 1;
    console.log(`  ⏩ localhost 快进 ${waitSec} 秒`);
    await increaseTime(waitSec);
  } else if (now < endTime) {
    const waitMs = Number(endTime - now) * 1000 + 3000;
    console.log(`  ⏳ 等待 ${Math.ceil(waitMs / 1000)} 秒...`);
    await new Promise(r => setTimeout(r, waitMs));
  } else {
    console.log(`  ⏩ 出猎时间已到，直接结算`);
  }

  const matBefore = await gameContract.materialBalance(user.address);
  await send("user.settleHunt",
    gameContract.connect(user).settleHunt(starterCatTokenId)
  );

  const matAfter = await gameContract.materialBalance(user.address);
  await check("获得材料碎片", matAfter > matBefore,
    `碎片: ${matBefore} → ${matAfter}`
  );
  await check("猫咪回到 Idle",
    (await gameContract.huntInfo(starterCatTokenId)).status === 0n
  );

  // ── 场景 6：碎片合成 → 抽卡 ─────────────────────────────
  log("6  碎片合成抽卡券 → 抽卡");

  let tickets = await gameContract.gachaTickets(user.address);
  console.log(`  当前抽卡券: ${tickets}`);

  if (tickets === 0n) {
    const frags = await gameContract.materialBalance(user.address);
    if (frags >= 10n) {
      await send("user.mergeFragments(1)",
        gameContract.connect(user).mergeFragments(1)
      );
    } else {
      await send("user.buyCatFood(3)（凑消费门槛换券）",
        gameContract.connect(user).buyCatFood(3)
      );
    }
    tickets = await gameContract.gachaTickets(user.address);
  }

  await check("有抽卡券", tickets >= 1n, `券数: ${tickets}`);

  const equipBefore = await equipmentNFT.totalSupply();
  await send("user.gacha",
    gameContract.connect(user).gacha()
  );
  const equipAfter = await equipmentNFT.totalSupply();
  await check("抽出装备 NFT", equipAfter > equipBefore);

  const equipTokenId = equipBefore;
  const equip = await equipmentNFT.getEquipment(equipTokenId);
  console.log(`  装备名称: ${equip.name}`);
  console.log(`  装备槽位: ${["武器", "背包", "靴子"][equip.slot]}`);
  console.log(`  稀有度:   ${["Common", "Fine", "Rare", "Legendary"][equip.rarity]}`);

  // ── 场景 7：给猫穿装备 ──────────────────────────────────
  log("7  穿装备");

  const alreadyEquipped = await equipmentNFT.isEquipped(equipTokenId);
  if (!alreadyEquipped) {
    await send("user.equipItem",
      gameContract.connect(user).equipItem(starterCatTokenId, equipTokenId)
    );
  } else {
    skip("user.equipItem", "装备已穿戴");
  }

  await check("装备已穿戴", await equipmentNFT.isEquipped(equipTokenId));

  const bonuses = await equipmentNFT.getCatBonuses(starterCatTokenId);
  console.log(`  猫咪当前加成 — rarityB:${bonuses.totalRarity} carryB:${bonuses.totalCarry} speedB:${bonuses.totalSpeed}`);

  // ── 场景 8：每周领抽卡券 ────────────────────────────────
  log("8  每周领抽卡券");

  const lastClaim = await gameContract.lastClaimTime(starterCatTokenId);
  const cooldown  = 7n * 24n * 3600n;
  const nowBigInt = BigInt(Math.floor(Date.now() / 1000));

  if (nowBigInt >= lastClaim + cooldown) {
    await send("user.claimWeeklyTicket（StarterCat）",
      gameContract.connect(user).claimWeeklyTicket(starterCatTokenId)
    );
    console.log(`  领券后抽卡券: ${await gameContract.gachaTickets(user.address)}`);
  } else {
    const remaining = Number(lastClaim + cooldown - nowBigInt);
    skip("user.claimWeeklyTicket", `冷却中，还剩约 ${Math.ceil(remaining / 3600)} 小时`);
  }

  // 验证 7 天冷却
  try {
    await gameContract.connect(user).claimWeeklyTicket.staticCall(starterCatTokenId);
    await check("7天冷却校验", false, "应该 revert 但没有");
  } catch {
    await check("7天冷却生效", true);
  }

  // ── 场景 9：云领养（捐款触发 CloudAdopted NFT）──────────
  log("9  云领养（捐款）");

  const threshold = await donationVault.stageThreshold();
  console.log(`  捐款阈值: ${ethers.formatEther(threshold)} AVAX`);

  const donationStage = await donationVault.donationStage(user.address, catId);
  if (donationStage === 0n) {
    const nftTotalBefore = await catNFT.totalSupply();
    await send(`user.donate（${ethers.formatEther(threshold)} AVAX）`,
      donationVault.connect(user).donate(catId, { value: threshold })
    );
    const nftTotalAfter = await catNFT.totalSupply();
    await check("触发 CloudAdopted NFT mint", nftTotalAfter > nftTotalBefore);

    const cloudTokenId = nftTotalBefore;
    const cloudType = await catNFT.nftType(cloudTokenId);
    await check("CloudAdopted NFT type=1", cloudType === 1n);
  } else {
    skip("user.donate", `已捐款，当前捐款阶段=${donationStage}`);
    await check("云领养阶段已推进", donationStage >= 1n, `stage=${donationStage}`);
  }

  // ── 场景 10：销毁全家福换 PURR ──────────────────────────
  log("10  销毁全家福换 PURR");

  if (portraitTokenId !== null) {
    try {
      // 先确认全家福还在
      await catNFT.ownerOf(portraitTokenId);

      const purrB4 = await purrToken.balanceOf(user.address);
      await send("user.burnFamilyPortraitForTokens",
        purrToken.connect(user).burnFamilyPortraitForTokens(portraitTokenId)
      );
      const purrAf = await purrToken.balanceOf(user.address);
      await check("获得 30 PURR",
        purrAf - purrB4 === ethers.parseEther("30"),
        `${ethers.formatEther(purrB4)} → ${ethers.formatEther(purrAf)} PURR`
      );
    } catch {
      skip("user.burnFamilyPortraitForTokens", "全家福已销毁");
    }
  } else {
    skip("user.burnFamilyPortraitForTokens", "全家福不存在");
  }

  // 验证全家福已销毁
  if (portraitTokenId !== null) {
    try {
      await catNFT.ownerOf(portraitTokenId);
      await check("全家福已销毁", false, "应该 revert 但没有");
    } catch {
      await check("全家福 NFT 已销毁", true);
    }
  }

  // ── 汇总 ────────────────────────────────────────────────
  log("全部测试通过 🎉");

  console.log(`
  最终状态：
    PURR 余额:    ${ethers.formatEther(await purrToken.balanceOf(user.address))} PURR
    材料碎片:     ${await gameContract.materialBalance(user.address)}
    抽卡券:       ${await gameContract.gachaTickets(user.address)}
    装备总数:     ${await equipmentNFT.totalSupply()}
    NFT 总数:     ${await catNFT.totalSupply()}
  `);
}

main().catch((err) => {
  console.error("\n❌ 测试失败：", err.message);
  if (err.data) console.error("链上错误数据：", err.data);
  process.exitCode = 1;
});
