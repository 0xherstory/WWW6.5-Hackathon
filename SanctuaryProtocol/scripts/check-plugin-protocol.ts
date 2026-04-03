import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";
  const expectedProtocol = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  
  const plugin = await ethers.getContractAt("PlantOHCardPlugin", pluginAddress);

  console.log("检查插件合约...\n");
  
  const protocol = await plugin.protocol();
  console.log("插件中的 protocol 地址:", protocol);
  console.log("期望的 protocol 地址:", expectedProtocol);
  console.log("是否匹配:", protocol.toLowerCase() === expectedProtocol.toLowerCase());
  
  const owner = await plugin.owner();
  console.log("\n插件 owner:", owner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
