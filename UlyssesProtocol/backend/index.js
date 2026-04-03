const { ethers } = require("ethers");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();
const { sequelize, Stake } = require("./db");

const app = express();
app.use(cors());
const PORT = 3001;

// --- 核心模块：区块链监听警察 ---
async function startChainListener() {
    try {
        // 1. 环境检查
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const abi = JSON.parse(fs.readFileSync("./abi.json", "utf8"));
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);

        console.log("-----------------------------------------");
        console.log("🚨 链下警察已穿好制服，正在巡逻 Fuji 测试网...");
        console.log(`📍 监控合约: ${process.env.CONTRACT_ADDRESS}`);

        // 2. 监听真实的 Staked 事件 (根据你给的正式 ABI)
        // 参数顺序：user, target, amount, weight, startTime, unlockTime
        contract.on("Staked", async (user, target, amount, weight, startTime, unlockTime) => {
            console.log(`\n🔔 发现新质押！`);
            console.log(`👤 用户: ${user}`);
            console.log(`🎯 目标: ${target}`);
            console.log(`💰 金额: ${ethers.formatEther(amount)} tokens`);
            console.log(`⏳ 解锁时间戳: ${unlockTime}`);

            try {
                // 3. 自动同步到数据库 (核心模块 I)
                await Stake.create({
                    userAddress: user,
                    targetAddress: target,
                    amount: ethers.formatEther(amount),
                    unlockTime: Number(unlockTime),
                    status: 0
                });
                console.log("💾 记录已成功写入数据库。");
            } catch (dbErr) {
                console.error("❌ 数据库写入失败:", dbErr);
            }
        });

    } catch (error) {
        console.error("❌ 启动警察脚本失败，请检查 .env 或 abi.json:", error);
    }
}

// --- 核心模块：提供给前端的接口 ---
app.get("/history", async (req, res) => {
    const { address } = req.query; // 获取前端传来的地址参数
    let filter = {};
    if (address) {
        filter = { userAddress: address.toLowerCase() };
    }
    // 查找该用户的所有记录
    const data = await Stake.findAll({ 
        where: filter,
        order: [['createdAt', 'DESC']] 
    });
    res.json(data);
});

// --- 启动程序 ---
async function main() {
    // 首先同步数据库结构
    await sequelize.sync(); 
    console.log("✅ 数据库结构已就绪");

    // 开启监听
    startChainListener();

    // 开启 Web 服务
    app.listen(PORT, () => {
        console.log(`🌐 前端接口已开通: http://localhost:${PORT}/history`);
        console.log("-----------------------------------------");
    });
}

main();

// 每隔 1 分钟扫描一次数据库
setInterval(async () => {
    const now = Math.floor(Date.now() / 1000);
    // 找出所有 1. 正在监控中(status:0) 且 2. 时间已过解锁时间(unlockTime) 的记录
    const expiredStakes = await Stake.findAll({
        where: {
            status: 0,
            unlockTime: { [Sequelize.Op.lt]: now } // lt 代表 "小于"
        }
    });

    for (let stake of expiredStakes) {
        console.log(`🚨 发现潜在违约：用户 ${stake.userAddress} 质押已过期！`);
        // 下一步：执行罚没逻辑
    }
}, 60000);

// 执行罚没函数
async function executeSlash(offender, target) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const watcherWallet = new ethers.Wallet(process.env.WATCHER_PRIVATE_KEY, provider);
    const abi = JSON.parse(fs.readFileSync("./abi.json", "utf8"));
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, watcherWallet);

    console.log(`🔨 正在对 ${offender} 发起罚没请求...`);
    const tx = await contract.slash(offender, target);
    await tx.wait(); // 等待链上确认
    console.log(`✅ 罚没成功！交易哈希: ${tx.hash}`);
}