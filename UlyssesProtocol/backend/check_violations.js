const { Stake } = require('./db');
const { ethers } = require('ethers');
require("dotenv").config();
const fs = require("fs");

async function patrol() {
    console.log("🔍 警察巡逻中：正在检查是否有用户违约...");

    // 1. 查询数据库中所有“监控中(status: 0)”的记录
    const activeStakes = await Stake.findAll({ where: { status: 0 } });
    const now = Math.floor(Date.now() / 1000);

    for (let stake of activeStakes) {
        // 2. 判定逻辑：如果当前时间 > 预设到期时间 = 违约！
        if (now > stake.unlockTime) {
            console.log(`🚨 发现违约用户: ${stake.userAddress}！准备执行 Slash...`);
            
            // 3. 这里就是你要调用合约 Slash 函数的地方
            // await executeSlash(stake.userAddress); 
            
            // 4. 更新状态为“已处理/已违约”
            stake.status = 2; 
            await stake.save();
        }
    }
}

// 每 30 秒巡逻一次
setInterval(patrol, 30000);