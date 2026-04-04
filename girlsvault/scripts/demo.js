// Demo 脚本：完整演示 GirlsVault 全流程
// 运行前确保 .env 里有 PRIVATE_KEY，且 Fuji 上已部署 Registry
// 用法: npx hardhat run scripts/demo.js --network fuji

const { ethers } = require("hardhat");

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS || "";

async function main() {
  if (!REGISTRY_ADDRESS) {
    throw new Error("请先设置 REGISTRY_ADDRESS 环境变量，或直接在此脚本中填入");
  }

  const [admin, validator1, validator2, validator3] = await ethers.getSigners();
  const beneficiary = admin; // Demo 中 admin 兼受益方

  console.log("=== GirlsVault Demo ===\n");
  console.log("Admin:", admin.address);

  // 1. 连接 Registry
  const registry = await ethers.getContractAt("GirlsVaultRegistry", REGISTRY_ADDRESS);

  // 2. 创建项目（2-of-3 多签）
  console.log("\n📝 Step 1: 创建「云南女童教育项目」...");
  const tx1 = await registry.createProject(
    "云南女童教育项目",
    "为云南偏远地区女童提供餐食与教育资助",
    beneficiary.address,
    [validator1.address, validator2.address, validator3.address],
    2
  );
  const receipt1 = await tx1.wait();
  const event = receipt1.logs.find((l) => l.fragment?.name === "ProjectCreated");
  const projectAddress = event.args.projectAddress;
  console.log("✅ 项目合约地址:", projectAddress);

  const project = await ethers.getContractAt("GirlsVaultProject", projectAddress);

  // 3. 添加里程碑
  console.log("\n📝 Step 2: 配置 3 个里程碑...");
  await (await project.addMilestone("女童入学注册确认", 3000)).wait();
  await (await project.addMilestone("学期中期物资发放确认", 3000)).wait();
  await (await project.addMilestone("学期结束出勤确认", 4000)).wait();
  console.log("✅ 里程碑配置完成（30% / 30% / 40%）");

  // 4. 捐款
  console.log("\n💰 Step 3: 捐款 1 AVAX（Tag: FOOD）...");
  const donateAmount = ethers.parseEther("1");
  await (await project.donate(1 /* FOOD */, { value: donateAmount })).wait();
  console.log("✅ 已捐款 1 AVAX，资金锁仓中");
  console.log("   合约余额:", ethers.formatEther(await project.getBalance()), "AVAX");

  // 5. 志愿者 A 提交验证
  console.log("\n🔍 Step 4: 志愿者 A 提交 M0 验证...");
  const proofA = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmProofA_registration_doc"));
  await (await project.connect(validator1).submitProof(0, proofA)).wait();
  const info1 = await project.getMilestoneInfo(0);
  console.log("✅ 已提交，当前验证数:", info1.proofCount.toString(), "/ 2");

  // 6. 志愿者 B 提交验证，触发释放
  console.log("\n🔍 Step 5: 志愿者 B 提交 M0 验证（触发 2-of-3 自动释放）...");
  const proofB = ethers.keccak256(ethers.toUtf8Bytes("ipfs://QmProofB_registration_doc"));
  const beneficiaryBefore = await ethers.provider.getBalance(beneficiary.address);
  await (await project.connect(validator2).submitProof(0, proofB)).wait();
  const beneficiaryAfter = await ethers.provider.getBalance(beneficiary.address);

  const released = ethers.formatEther(beneficiaryAfter - beneficiaryBefore);
  console.log("✅ 自动释放触发！受益方收到:", released, "AVAX");

  // 7. 最终状态
  console.log("\n=== 最终状态 ===");
  console.log("totalDonated:", ethers.formatEther(await project.totalDonated()), "AVAX");
  console.log("totalReleased:", ethers.formatEther(await project.totalReleased()), "AVAX");
  console.log("合约剩余:", ethers.formatEther(await project.getBalance()), "AVAX");

  const m0 = await project.getMilestoneInfo(0);
  console.log("M0 状态:", ["PENDING", "VERIFIED", "RELEASED"][m0.status]);

  console.log("\nSnowtrace:", `https://testnet.snowtrace.io/address/${projectAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
