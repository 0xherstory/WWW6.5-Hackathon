/**
 * 收益分配模拟脚本 - distribute-profit.js
 * 任务16：演示收益分配功能
 *
 * 功能：为指定池分配模拟收益（管理员专用）
 *
 * 使用方法：
 *   本地：POOL_ID=1 PROFIT=50 npx hardhat run scripts/distribute-profit.js --network hardhat
 *   Fuji：POOL_ID=1 PROFIT=50 npx hardhat run scripts/distribute-profit.js --network fuji
 *
 * 环境变量：
 *   POOL_ID  - 要分配收益的池ID（默认：1）
 *   PROFIT   - 收益金额，HRT单位（默认：50）
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
	const poolId = Number(process.env.POOL_ID || "1");
	const profitAmount = process.env.PROFIT || "50";

	console.log(`💰 收益分配演示脚本`);
	console.log(`   池ID：${poolId}`);
	console.log(`   收益金额：${profitAmount} HRT\n`);

	const [deployer] = await hre.ethers.getSigners();
	console.log(`管理员账户：${deployer.address}`);

	// 读取合约配置
	const configPath = path.join(__dirname, "..", "deployed-contracts.json");
	if (!fs.existsSync(configPath)) {
		console.error("❌ 未找到 deployed-contracts.json，请先运行部署脚本");
		process.exit(1);
	}

	const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
	const { HerRiseToken: tokenAddress, HerRiseMain: mainAddress } = config.contracts;

	const HerRiseToken = await hre.ethers.getContractFactory("HerRiseToken");
	const HerRiseMain = await hre.ethers.getContractFactory("HerRiseMain");
	const tokenContract = HerRiseToken.attach(tokenAddress);
	const mainContract = HerRiseMain.attach(mainAddress);

	// 查询池信息
	const poolInfo = await mainContract.getPoolInfo(poolId);
	console.log(`\n池信息：`);
	console.log(`  名称：${poolInfo.name}`);
	console.log(`  成员数：${poolInfo.memberCount}`);
	console.log(`  总存款：${hre.ethers.formatEther(poolInfo.totalDeposits)} HRT`);

	if (Number(poolInfo.totalDeposits) === 0) {
		console.error("❌ 该池中没有存款，无法分配收益");
		process.exit(1);
	}

	// 查询分配前各成员余额
	console.log("\n分配前成员余额：");
	const memberCount = Number(poolInfo.memberCount);
	const membersBefore = [];
	for (let i = 0; i < memberCount; i++) {
		const addr = await mainContract.poolMemberList(poolId, i);
		const bal = await tokenContract.balanceOf(addr);
		membersBefore.push({ addr, balance: bal });
		console.log(`  ${addr.slice(0, 10)}...：${hre.ethers.formatEther(bal)} HRT`);
	}

	// 执行收益分配
	console.log(`\n⏳ 正在分配收益（${profitAmount} HRT）...`);
	const profitWei = hre.ethers.parseEther(profitAmount);
	const tx = await mainContract.connect(deployer).distributeProfit(poolId, profitWei);
	const receipt = await tx.wait();
	console.log(`✅ 交易确认：${receipt.hash}`);

	// 查询分配后各成员余额
	console.log("\n分配后成员余额（收益）：");
	for (const { addr, balance: beforeBal } of membersBefore) {
		const afterBal = await tokenContract.balanceOf(addr);
		const profit = afterBal - beforeBal;
		const memberInfo = await mainContract.getUserPoolInfo(poolId, addr);
		const share = (Number(memberInfo.depositAmount) / Number(poolInfo.totalDeposits)) * 100;
		console.log(`  ${addr.slice(0, 10)}...：`);
		console.log(`    余额 ${hre.ethers.formatEther(beforeBal)} → ${hre.ethers.formatEther(afterBal)} HRT`);
		console.log(`    获得收益：${hre.ethers.formatEther(profit)} HRT（份额：${share.toFixed(1)}%）`);
	}

	console.log(`\n🎉 收益分配完成！`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
