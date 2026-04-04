const hre = require("hardhat");
const path = require("path");

async function main() {
  const signers = await hre.ethers.getSigners();
  // 使用 signers[7-9]，避开 girlsvault 占用的 signers[0-6]（deployer/beneficiaries/validators）
  const [admin,,,,,,, xiaoli, xiaowang, xiaozhang] = signers;

  // 根据当前网络读取对应部署地址
  const networkName = hre.network.name;
  const deployedPath = path.join(__dirname, `../frontend/src/utils/deployed.${networkName}.json`);
  const deployed = require(deployedPath);
  const { HerTimeToken, HerTimeService, HerTimeReputation, HerTimeSkillNFT } = deployed.contracts;

  const token = await hre.ethers.getContractAt("HerTimeToken", HerTimeToken);
  const service = await hre.ethers.getContractAt("HerTimeService", HerTimeService);
  const reputation = await hre.ethers.getContractAt("HerTimeReputation", HerTimeReputation);
  const skillNFT = await hre.ethers.getContractAt("HerTimeSkillNFT", HerTimeSkillNFT);

  console.log("=== HerTime Demo ===\n");
  console.log("Admin:    ", admin.address);
  console.log("小李 (需求方):", xiaoli.address);
  console.log("小王 (服务方):", xiaowang.address);
  console.log("小张 (观察者):", xiaozhang.address);

  // Step 1: 注册成员
  console.log("\n--- Step 1: 成员注册 ---");
  await (await service.connect(xiaoli).register()).wait();
  await (await service.connect(xiaowang).register()).wait();
  console.log("小李 HRT:", hre.ethers.formatEther(await token.balanceOf(xiaoli.address)));
  console.log("小王 HRT:", hre.ethers.formatEther(await token.balanceOf(xiaowang.address)));

  // Step 2: 小李发布需求「育儿接送，1小时」
  console.log("\n--- Step 2: 小李发布服务需求 ---");
  const tx = await service.connect(xiaoli).postService(
    0,     // LIFE_SUPPORT
    1,     // 1 小时
    false  // 不匿名
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(l => {
    try { return service.interface.parseLog(l).name === "ServicePosted"; } catch { return false; }
  });
  const parsed = service.interface.parseLog(event);
  const serviceId = parsed.args[0];
  console.log("服务 ID:", serviceId);

  // Step 3: 小王接单
  console.log("\n--- Step 3: 小王接单 ---");
  await (await service.connect(xiaowang).acceptService(serviceId)).wait();
  console.log("接单成功！");

  // Step 4: 双方确认完成
  console.log("\n--- Step 4: 双方确认完成 ---");
  await (await service.connect(xiaoli).confirmCompletion(serviceId)).wait();
  await (await service.connect(xiaowang).confirmCompletion(serviceId)).wait();
  console.log("小李 HRT:", hre.ethers.formatEther(await token.balanceOf(xiaoli.address)), "(消费了 1 HRT)");
  console.log("小王 HRT:", hre.ethers.formatEther(await token.balanceOf(xiaowang.address)), "(获得了 1 HRT)");

  // Step 5: 双方提交评分
  console.log("\n--- Step 5: 双盲评分 ---");
  const commentHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("非常好的服务！"));
  await (await reputation.connect(xiaoli).submitRating(serviceId, 5, commentHash)).wait();
  console.log("小李已提交评分（暂不公开）");
  await (await reputation.connect(xiaowang).submitRating(serviceId, 5, commentHash)).wait();
  console.log("小王已提交评分 -> 双方都提交，声誉自动更新！");

  console.log("小李声誉分:", (await reputation.getAvgScore(xiaoli.address)).toString(), "(x100)");
  console.log("小王声誉分:", (await reputation.getAvgScore(xiaowang.address)).toString(), "(x100)");

  // Step 6: 检查 NFT（当前次数不够，但展示查询）
  console.log("\n--- Step 6: 技能 NFT 状态 ---");
  const skills = await skillNFT.getSkills(xiaowang.address);
  const skillNames = ["倾听者", "就医陪伴", "育儿伙伴", "技能导师", "社区守护者", "危机支持者"];
  skills.forEach((has, i) => {
    if (has) console.log(`  ✓ 小王持有: ${skillNames[i]}`);
  });

  console.log("\n=== Demo 完成！贡献永不消失。===");
}

main().catch((e) => { console.error(e); process.exit(1); });
