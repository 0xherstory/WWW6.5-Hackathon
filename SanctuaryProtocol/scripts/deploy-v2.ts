import hre from "hardhat";
import { Contract, Wallet } from "ethers";

async function main() {
  // 获取部署者账户
  const signers = await hre.ethers.getSigners();
  console.log("获取到的账户数量:", signers.length);
  
  if (signers.length === 0) {
    console.error("错误: 没有找到任何账户。请检查 PRIVATE_KEY 是否正确配置在 .env.local 文件中");
    process.exit(1);
  }
  
  const [deployer] = signers;
  
  console.log("=== SanctuaryProtocol v2.2 部署脚本 ===");
  console.log("部署者:", deployer.address);
  console.log("");

  // 生成4个随机钱包作为额外守护者（仅用于测试网演示）
  const guardianWallets = Array.from({ length: 4 }, () => Wallet.createRandom());
  
  // 1. 部署 PlantOHCardPlugin 实现合约
  console.log("1. 部署 PlantOHCardPlugin 实现合约...");
  const PlantOHCardPlugin = await hre.ethers.getContractFactory("PlantOHCardPlugin");
  
  // 先部署一个临时的协议地址（后面会更新）
  const tempProtocolAddress = deployer.address;
  const plantOHCardPlugin = await PlantOHCardPlugin.deploy(
    tempProtocolAddress,  // 临时协议地址
    deployer.address      // owner
  );
  await plantOHCardPlugin.waitForDeployment();
  const pluginAddress = await plantOHCardPlugin.getAddress();
  console.log("   PlantOHCardPlugin 部署成功:", pluginAddress);
  console.log("");

  // 2. 部署 SanctuaryProtocolV2 代理合约
  console.log("2. 部署 SanctuaryProtocolV2 代理合约...");
  const SanctuaryProtocolV2 = await hre.ethers.getContractFactory("SanctuaryProtocolV2");
  
  // 多签守护者配置（1个真实部署者 + 4个随机地址，仅用于测试网演示）
  const guardians = [
    deployer.address,
    guardianWallets[0].address,
    guardianWallets[1].address,
    guardianWallets[2].address,
    guardianWallets[3].address
  ];
  const requiredApprovals = 3; // 需要 3/5 签名
  
  console.log("   守护者列表:");
  guardians.forEach((g, i) => console.log(`     [${i + 1}] ${g}`));
  console.log(`   所需签名数: ${requiredApprovals}/${guardians.length}`);
  
  const proxy = await hre.upgrades.deployProxy(
    SanctuaryProtocolV2,
    [
      deployer.address,  // initial owner
      guardians,         // 多签守护者
      requiredApprovals  // 所需批准数
    ],
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  await proxy.waitForDeployment();
  
  const proxyAddress = await proxy.getAddress();
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  console.log("   代理合约地址:", proxyAddress);
  console.log("   实现合约地址:", implementationAddress);
  console.log("");

  // 3. 更新插件的协议地址
  console.log("3. 更新 PlantOHCardPlugin 的协议地址...");
  await plantOHCardPlugin.setProtocol(proxyAddress);
  console.log("   协议地址已更新为:", proxyAddress);
  console.log("");

  // 4. 提交插件审核
  console.log("4. 提交 PlantOHCardPlugin 审核...");
  const protocol = await hre.ethers.getContractAt("SanctuaryProtocolV2", proxyAddress);
  await protocol.submitPlugin(pluginAddress, deployer.address); // 用部署者作为审计者
  console.log("   插件已提交审核");
  console.log("");

  // 5. 审计确认
  console.log("5. 审计确认...");
  await protocol.confirmAudit(pluginAddress);
  console.log("   审计已通过");
  console.log("");

  // 6. 等待沙盒期（测试网可以手动设置短一点）
  console.log("6. 检查沙盒期...");
  const pluginInfo = await protocol.plugins(pluginAddress);
  const sandboxEnd = Number(pluginInfo.sandboxEnd);
  const now = Math.floor(Date.now() / 1000);
  
  if (sandboxEnd > now) {
    const waitSeconds = sandboxEnd - now;
    console.log(`   需要等待 ${waitSeconds} 秒才能注册...`);
    console.log("   (测试网可以手动调用 setSandboxPeriod 缩短)");
  } else {
    console.log("   沙盒期已结束，可以注册");
  }
  console.log("");

  // 7. 输出部署信息
  console.log("=== 部署完成 ===");
  console.log("");
  console.log("合约地址:");
  console.log(`  - PlantOHCardPlugin: ${pluginAddress}`);
  console.log(`  - SanctuaryProtocolV2 (Proxy): ${proxyAddress}`);
  console.log(`  - SanctuaryProtocolV2 (Implementation): ${implementationAddress}`);
  console.log("");
  console.log("多签配置:");
  console.log(`  - 守护者数量: ${guardians.length}`);
  console.log(`  - 所需签名: ${requiredApprovals}`);
  console.log("");
  console.log("下一步:");
  console.log("  1. 等待沙盒期结束");
  console.log("  2. 调用 registerPlugin() 注册插件");
  console.log("  3. 测试捐赠和领取功能");
  console.log("  4. 演示 UUPS 升级");
  console.log("");

  // 保存部署信息到文件
  const deploymentInfo = {
    network: (await hre.ethers.provider.getNetwork()).name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      plantOHCardPlugin: pluginAddress,
      sanctuaryProtocolV2Proxy: proxyAddress,
      sanctuaryProtocolV2Implementation: implementationAddress
    },
    multisig: {
      guardians: guardians,
      requiredApprovals: requiredApprovals
    },
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-v2.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("部署信息已保存到 deployment-v2.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
