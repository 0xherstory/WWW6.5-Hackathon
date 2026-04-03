const Token = artifacts.require("Token");
const Badge = artifacts.require("Badge");
const LearningRecord = artifacts.require("LearningRecord");

module.exports = async function (deployer) {
    // 部署代币合约
    await deployer.deploy(Token, 1000000); // 100万初始代币
    const tokenInstance = await Token.deployed();

    // 部署徽章合约
    await deployer.deploy(Badge);
    const badgeInstance = await Badge.deployed();

    // 部署学习记录合约
    await deployer.deploy(LearningRecord, tokenInstance.address, badgeInstance.address);
};