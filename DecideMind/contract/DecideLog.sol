// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // 适配Remix，和你之前部署版本一致

// 决策存证合约：保存用户决策记录，不可篡改
contract DecisionLog {
    // 定义决策记录结构体（存储关键信息）
    struct DecisionRecord {
        address user;       // 发起决策的用户钱包地址
        string question;    // 用户的决策问题
        string aiResult;    // AI分析结果（优势+风险+建议）
        uint256 timestamp;  // 上链时间（区块时间）
    }

    // 存储所有决策记录（数组，可查询）
    DecisionRecord[] public allDecisions;

    // 上链存证方法：前端调用此方法，保存决策记录
    // 对应前端analysis/page.js里的saveDecision调用
    function saveDecision(string calldata question, string calldata aiResult) external {
        allDecisions.push(DecisionRecord({
            user: msg.sender,       // 自动获取调用者（用户）钱包地址
            question: question,     // 前端传入的决策问题
            aiResult: aiResult,     // 前端传入的AI分析结果
            timestamp: block.timestamp // 自动获取当前区块时间
        }));
    }

    // 辅助查询方法：获取存证记录总数（演示时可展示，加分）
    function getDecisionCount() external view returns (uint256) {
        return allDecisions.length;
    }

    // 辅助查询方法：根据索引查询单条记录（演示时可展示）
    function getDecisionByIndex(uint256 index) external view returns (
        address user,
        string memory question,
        string memory aiResult,
        uint256 timestamp
    ) {
        require(index < allDecisions.length, "Record does not exist");
        DecisionRecord memory record = allDecisions[index];
        return (
            record.user,
            record.question,
            record.aiResult,
            record.timestamp
        );
    }
}
