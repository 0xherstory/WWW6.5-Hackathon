const { ethers, getAddress } = require("ethers");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { sequelize, Stake } = require("./db");
const { Op } = require("sequelize");

const app = express();
app.use(cors());
const PORT = 3001;

// --- 【新增配置】土狗币监控参数 ---
const SHIT_COIN_ADDRESS = "0x6D4aE566094D4E298b59eF0E243e9aBcE374C2Ba";
const MIN_ERC20_ABI = [
    "function balanceOf(address account) external view returns (uint256)"
];

// --- 全局变量与初始化 ---
let lastScannedBlock = 0;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const pk = process.env.WATCHER_PRIVATE_KEY?.trim();

if (!pk) {
    console.error("❌ 错误: .env 中未设置 WATCHER_PRIVATE_KEY");
    process.exit(1);
}
const watcherWallet = new ethers.Wallet(pk, provider);

// --- 核心模块 I：自动化执行罚没 (Slash) ---
async function executeSlash(stakeRecord) {
    try {
        const abi = JSON.parse(fs.readFileSync("./abi.json", "utf8"));
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, watcherWallet);

        console.log(`🔨 [执法中] 正在对违约用户 ${stakeRecord.userAddress} 发起罚没...`);
        
        // 调用合约的 slash 方法
        const tx = await contract.slash(stakeRecord.userAddress, stakeRecord.targetAddress);
        console.log(`⏳ 交易已提交，哈希: ${tx.hash}`);
        
        await tx.wait(); // 等待链上确认
        
        // 更新数据库状态：2 代表已罚没
        await stakeRecord.update({ status: 2 });
        console.log(`✅ [执法成功] 用户 ${stakeRecord.userAddress} 的质押已被罚没。`);
        
    } catch (error) {
        console.error(`❌ [执法失败] 用户 ${stakeRecord.userAddress}:`, error.reason || error.message);
        if (error.message.toLowerCase().includes("already slashed")) {
            await stakeRecord.update({ status: 2 });
        }
    }
}

// --- 核心模块 II：区块链轮询警察 ---
async function pollChainEvents() {
    try {
        const abi = JSON.parse(fs.readFileSync("./abi.json", "utf8"));
        const currentBlock = await provider.getBlockNumber();

        if (lastScannedBlock === 0) {
            lastScannedBlock = currentBlock;
            return;
        }

        if (currentBlock <= lastScannedBlock) return;

        console.log(`🔍 正在扫描区块: ${lastScannedBlock + 1} -> ${currentBlock}`);

        const contractAddress = getAddress(process.env.CONTRACT_ADDRESS.trim());
        const contract = new ethers.Contract(contractAddress, abi, provider);

        const events = await contract.queryFilter("Staked", lastScannedBlock + 1, currentBlock);
        
        for (let event of events) {
            const [user, target, amount, weight, startTime, unlockTime] = event.args;
            console.log(`\n🔔 发现新质押！用户: ${user}`);

            await Stake.findOrCreate({
                where: { 
                    userAddress: user.toLowerCase(), 
                    unlockTime: Number(unlockTime) 
                },
                defaults: {
                    userAddress: user.toLowerCase(),
                    targetAddress: target.toLowerCase(),
                    amount: ethers.formatEther(amount),
                    unlockTime: Number(unlockTime),
                    status: 0
                }
            });
            console.log("💾 记录已同步至数据库。");
        }

        lastScannedBlock = currentBlock;

    } catch (error) {
        console.error("⚠️ 链上扫描出错:", error.message);
    }
}

// --- 核心模块 III：动态判定巡逻逻辑 (每个用户查自己的禁忌币) ---
async function startTimers() {
    // 1. 每 8 秒拉取一次新事件
    setInterval(pollChainEvents, 8000);

    // 2. 每 20 秒检查一次违约情况
    setInterval(async () => {
        const now = Math.floor(Date.now() / 1000);
        
        try {
            const activeStakes = await Stake.findAll({ where: { status: 0 } });

            for (let stake of activeStakes) {
                // 【核心改动】：不再使用全局常量，而是用数据库里存的那个 targetAddress
                const userForbiddenToken = stake.targetAddress; 
                
                // 只有当这个地址看起来像个合约地址时才检查
                if (ethers.isAddress(userForbiddenToken)) {
                    const shitCoinContract = new ethers.Contract(userForbiddenToken, MIN_ERC20_ABI, provider);
                    
                    try {
                        const balance = await shitCoinContract.balanceOf(stake.userAddress);
                        if (balance > 0n) {
                            console.log(`🚨 破戒抓捕！用户 ${stake.userAddress} 持有了他承诺不买的币: ${userForbiddenToken}`);
                            await executeSlash(stake);
                            continue; 
                        }
                    } catch (tokenErr) {
                        // 如果查余额失败（比如地址填错了），记录一下但不崩溃
                        console.error(`⚠️ 无法查询代币 ${userForbiddenToken} 的余额:`, tokenErr.message);
                    }
                }

                // 【判定逻辑 B】：检查时间是否过期
                if (stake.unlockTime < now) {
                    console.log(`⏰ 时间到！用户 ${stake.userAddress} 挑战成功（或超时未取）。`);
                    await executeSlash(stake);
                }
            }
        } catch (err) {
            console.error("❌ 定'时巡逻任务出错:", err);
        }
    }, 20000);
}

// --- API 接口 ---
app.get("/history", async (req, res) => {
    try {
        const { address } = req.query;
        let filter = {};
        if (address) {
            filter = { userAddress: address.toLowerCase() };
        }
        const data = await Stake.findAll({ 
            where: filter,
            order: [['createdAt', 'DESC']] 
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "获取历史记录失败" });
    }
});

// --- 主程序入口 ---
async function main() {
    try {
        // 第一次运行请保留 { force: true }，成功后建议改为 await sequelize.sync();
        await sequelize.sync({ force: true }); 
        console.log("✅ 数据库结构已【强制刷新】就绪");

        await startTimers();

        app.listen(PORT, () => {
            console.log("-----------------------------------------");
            console.log("🚨 Ulysses 后端警察已上线！");
            console.log(`🛡️ 监控目标: ${SHIT_COIN_ADDRESS}`);
            console.log(`🌐 API 地址: http://localhost:${PORT}/history`);
            console.log("-----------------------------------------");
        });
    } catch (err) {
        console.error("❌ 程序启动失败:", err);
    }
}
main();