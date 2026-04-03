import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查两个地址
  const addresses = [
    "0xc2de584f88217C6Ad15C12Ea35Acf92713669280",
    "0x6442A5ae7EF7D73BF2c1c66C33C87Eb368c9D211"
  ];

  for (const addr of addresses) {
    console.log(`\n地址: ${addr}`);
    const donated = await sanctuary.totalDonated(addr);
    const hasClaimed = await sanctuary.hasClaimed(addr);
    const isDonor = await sanctuary.isDonor(addr);
    console.log(`  捐赠金额: ${ethers.formatEther(donated)} AVAX`);
    console.log(`  已领取: ${hasClaimed}`);
    console.log(`  是捐赠者: ${isDonor}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
