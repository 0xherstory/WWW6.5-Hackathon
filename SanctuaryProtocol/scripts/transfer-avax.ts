import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("发送账户:", deployer.address);
  console.log("余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "AVAX");

  // 接收地址
  const recipients = [
    "0xc2de584f88217C6Ad15C12Ea35Acf92713669280",
    "0x6442A5ae7EF7D73BF2c1c66C33C87Eb368c9D211"
  ];

  for (const recipient of recipients) {
    console.log(`\n转账给 ${recipient}...`);
    const tx = await deployer.sendTransaction({
      to: recipient,
      value: ethers.parseEther("0.5"), // 每个地址转 0.5 AVAX
    });
    await tx.wait();
    console.log("  ✅ 转账成功");
    
    const balance = await deployer.provider.getBalance(recipient);
    console.log(`  新余额: ${ethers.formatEther(balance)} AVAX`);
  }

  console.log("\n=== 完成 ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
