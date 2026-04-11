// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ElephantLedger {
    // 定义事件：当日常劳动被记录时触发（只记录时长和前端算好的价值，不存敏感信息）
    event LaborMinted(address indexed user, string category, uint256 durationMins, uint256 value, uint256 timestamp);
    
    // 定义事件：当月度档案（默克尔树根）上链确权时触发
    event MonthlyArchiveSealed(address indexed user, string month, string merkleRoot, uint256 timestamp);

    /**
     * @dev 批量上链日常劳动记录（一键打包上链时调用）
     * @param category 劳动分类（如：清洁与收纳）
     * @param durationMins 劳动时长（分钟）
     * @param value 创造的参考经济价值
     */
    function mintDailyLabor(string memory category, uint256 durationMins, uint256 value) public {
        // 记录数据并打上当前区块的绝对时间戳
        emit LaborMinted(msg.sender, category, durationMins, value, block.timestamp);
    }

    /**
     * @dev 将整个月的劳动记录哈希树根封存上链，用于后续对接司法存证
     * @param month 月份标识（如：2026-03）
     * @param merkleRoot 该月所有记录生成的默克尔树根哈希
     */
    function sealMonthlyArchive(string memory month, string memory merkleRoot) public {
        // 永久封存该月的证据树根
        emit MonthlyArchiveSealed(msg.sender, month, merkleRoot, block.timestamp);
    }
}