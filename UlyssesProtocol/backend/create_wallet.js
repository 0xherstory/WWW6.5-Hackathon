const { ethers } = require("ethers");

// 生成一个新的随机钱包
const wallet = ethers.Wallet.createRandom();

console.log("--- 🚨 请将以下信息保存好，不要发给任何人！ ---");
console.log("警察地址 (Address):", wallet.address);
console.log("私钥 (Private Key):", wallet.privateKey);
console.log("------------------------------------------------");