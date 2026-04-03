// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RescueLink
 * @notice 它援 RescueLink — 救助 Case 关键事件存证合约
 * @dev 只发事件，不存状态，gas 极低，隐私安全
 */
contract RescueLink {

    // ─── 事件定义 ───────────────────────────────────────────

    /// @notice Case 创建
    /// @param caseId     链下 Case ID 的 keccak256 哈希
    /// @param metaHash   Case 摘要（标题+城市+动物类型+时间）的哈希
    /// @param operator   发起人钱包地址
    event CaseCreated(
        bytes32 indexed caseId,
        bytes32 metaHash,
        address indexed operator,
        uint256 timestamp
    );

    /// @notice 上传凭证或进展更新
    /// @param evidenceHash  凭证内容（图片URL+描述）的哈希
    /// @param evidenceType  "medical" | "progress" | "receipt"
    event EvidenceAdded(
        bytes32 indexed caseId,
        bytes32 evidenceHash,
        string  evidenceType,
        address indexed operator,
        uint256 timestamp
    );

    /// @notice 服务完成签收（医疗、运输、寄养等）
    /// @param serviceType  "medical" | "transport" | "foster" | "neuter"
    event ServiceConfirmed(
        bytes32 indexed caseId,
        string  serviceType,
        bytes32 receiptHash,
        address indexed operator,
        uint256 timestamp
    );

    /// @notice Case 接管转交
    event CaseTransferred(
        bytes32 indexed caseId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /// @notice 积分核销（链下积分余额的关键核销记录）
    /// @param redeemHash  核销摘要（用户ID+积分数量+兑换内容）的哈希
    event PointsRedeemed(
        address indexed user,
        bytes32 redeemHash,
        uint256 timestamp
    );

    // ─── 函数定义 ───────────────────────────────────────────

    /// @notice 发起救助 Case 存证
    function createCase(
        bytes32 caseId,
        bytes32 metaHash
    ) external {
        emit CaseCreated(caseId, metaHash, msg.sender, block.timestamp);
    }

    /// @notice 上传凭证或进展更新存证
    function addEvidence(
        bytes32 caseId,
        bytes32 evidenceHash,
        string calldata evidenceType
    ) external {
        emit EvidenceAdded(caseId, evidenceHash, evidenceType, msg.sender, block.timestamp);
    }

    /// @notice 服务完成签收存证
    function confirmService(
        bytes32 caseId,
        string calldata serviceType,
        bytes32 receiptHash
    ) external {
        emit ServiceConfirmed(caseId, serviceType, receiptHash, msg.sender, block.timestamp);
    }

    /// @notice Case 接管转交存证
    function transferCase(
        bytes32 caseId,
        address newOwner
    ) external {
        emit CaseTransferred(caseId, msg.sender, newOwner, block.timestamp);
    }

    /// @notice 积分核销存证
    function redeemPoints(
        bytes32 redeemHash
    ) external {
        emit PointsRedeemed(msg.sender, redeemHash, block.timestamp);
    }
}
