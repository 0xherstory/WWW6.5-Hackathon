// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./InternSBT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReviewContract is Ownable {

    enum ReviewStatus { Normal, Disputed, Revoked }

// ── 数据结构 (新增 5 个维度的存储) ───────────────────
    struct Review {

        uint256 credentialId;   // 由哪个凭证发起 (对应 SBT 的 tokenId)
        bytes32 targetId;       // 评价对象 ID
        bytes32 cid;            // IPFS 地址
        
        // ▼▼▼ 以下变量完美打包在同一个 32 bytes 的 Storage Slot 中，极其省 Gas ▼▼▼
        uint32  createdAt;          // 提交时间 (4 bytes)
        ReviewStatus status;        // 状态 (1 byte)
        uint8   overallScore;       // 总评分 (1 byte)
        uint8   growthScore;        // 1. 成长支持 (1 byte)
        uint8   clarityScore;       // 2. 预期清晰度 (1 byte)
        uint8   communicationScore; // 3. 沟通质量 (1 byte)
        uint8   workloadScore;      // 4. 工作强度 (1 byte)
        uint8   respectScore;       // 5. 尊重与包容 (1 byte)
        // ▲▲▲ 总计占用 10 bytes，完美挤入一个 Slot ▲▲▲
    }

    struct TargetStats {
        uint128 totalScore;
        uint128 reviewCount;
    }

    // ── 状态变量 ──────────────────────────────────────
    InternSBT public sbtContract;
    uint256 private _reviewIdCounter; 

    mapping(uint256 => Review) public reviews; 
    
    // 防刷单：同一个凭证 (credentialId) 对同一个对象只能评价一次
    mapping(uint256 => mapping(bytes32 => bool)) public hasReviewed;
    mapping(bytes32 => TargetStats) public targetStats;

    // ── 事件 ──────────────────────────────────────────
    event ReviewSubmitted(
        uint256 indexed reviewId,
        bytes32 indexed targetId,
        string  targetType,     // 对应 targetType (mentor/team/company)，存链下
        uint256 indexed credentialId,
        uint8   overallScore,
        uint8[5] dimensionScores, // 抛出 5 个维度的分数数组，供后端解析
        bytes32 cid,
        uint256 createdAt
    );

    event ReviewStatusUpdated(
        uint256 indexed reviewId,
        bytes32 indexed targetId,
        ReviewStatus oldStatus,
        ReviewStatus newStatus
    );

    constructor(address _sbtContract) Ownable(msg.sender) {
        require(_sbtContract != address(0), "Invalid SBT address");
        sbtContract = InternSBT(_sbtContract);
        _reviewIdCounter = 1;
    }

    // ── 核心函数：提交评价 ────────────────────────────
    function submitReview(
        uint256 _credentialId, 
        bytes32 _targetId,
        string calldata _targetType, 
        uint8   _overallScore,
        uint8[5] calldata _dimScores, // 前端按固定顺序传入数组：[成长, 预期, 沟通, 强度, 尊重]
        bytes32 _cid
    ) external {
        // 1. 验证归属权与有效性
        require(_cid != bytes32(0), "CID cannot be empty");
        require(sbtContract.ownerOf(_credentialId) == msg.sender, "Not your credential");
        require(sbtContract.isValidCredential(_credentialId), "Credential not active");

        // 2. 防刷单限制
        require(!hasReviewed[_credentialId][_targetId], "Already reviewed this target");
        require(_overallScore >= 1 && _overallScore <= 5, "Score must be 1-5");
        require(
            _dimScores[0] >= 1 && _dimScores[0] <= 5 &&
            _dimScores[1] >= 1 && _dimScores[1] <= 5 &&
            _dimScores[2] >= 1 && _dimScores[2] <= 5 &&
            _dimScores[3] >= 1 && _dimScores[3] <= 5 &&
            _dimScores[4] >= 1 && _dimScores[4] <= 5,
            "Dimension scores must be 1-5"
            );

        // 3. 存储评价
        uint256 currentReviewId = _reviewIdCounter++;
        reviews[currentReviewId] = Review({
            credentialId: _credentialId,
            targetId: _targetId,
            overallScore: _overallScore,
            cid: _cid,
            status: ReviewStatus.Normal,
            createdAt: uint32(block.timestamp),
            growthScore: _dimScores[0],
            clarityScore: _dimScores[1],
            communicationScore: _dimScores[2],
            workloadScore: _dimScores[3],
            respectScore: _dimScores[4]
        });

    
        hasReviewed[_credentialId][_targetId] = true;
        _incrementScore(_targetId, _overallScore);

        // 4. 触发事件
        emit ReviewSubmitted(
            currentReviewId, _targetId, _targetType, _credentialId,
            _overallScore,_dimScores, _cid, block.timestamp
        );
    }

    // ── 申诉函数：未来由 DAO 调用 ─────────────────────
    function updateReviewStatus(uint256 _reviewId, uint8 _newStatus) external onlyOwner {
        Review storage r = reviews[_reviewId];
        require(r.credentialId != 0, "Review does not exist");

        ReviewStatus newStatusEnum = ReviewStatus(_newStatus); // ✅ 显式转换
        
        ReviewStatus oldStatus = r.status;
        if (oldStatus == newStatusEnum) return; // ✅ 使用转换后的枚举
        // 核心约束：只允许特定的状态流转
        require(
        (oldStatus == ReviewStatus.Normal   && newStatusEnum == ReviewStatus.Disputed) || // ✅ 改为 newStatusEnum
        (oldStatus == ReviewStatus.Disputed && newStatusEnum == ReviewStatus.Normal)   || // ✅ 改为 newStatusEnum
        (oldStatus == ReviewStatus.Disputed && newStatusEnum == ReviewStatus.Revoked),    // ✅ 改为 newStatusEnum
        "Invalid status transition"
    );

        r.status = newStatusEnum; // ✅ 正确赋值
        bytes32 tId = r.targetId;

   

      // 聚合分数动态增减
      if (oldStatus == ReviewStatus.Normal && newStatusEnum != ReviewStatus.Normal) { // ✅ 改为 newStatusEnum
      _decrementScore(tId, r.overallScore);
      } else if (oldStatus != ReviewStatus.Normal && newStatusEnum == ReviewStatus.Normal) { // ✅ 改为 newStatusEnum
      _incrementScore(tId, r.overallScore);
      }
        emit ReviewStatusUpdated(_reviewId, tId, oldStatus, newStatusEnum);
    }

    // 内部加减分逻辑...
    function _incrementScore(bytes32 _tId, uint8 _score) internal {
        targetStats[_tId].totalScore += uint128(_score) * 100;
        targetStats[_tId].reviewCount += 1;
    }

    function _decrementScore(bytes32 _tId, uint8 _score) internal {
        if (targetStats[_tId].reviewCount > 0) {
            targetStats[_tId].totalScore -= uint128(_score) * 100;
            targetStats[_tId].reviewCount -= 1;
        }
    }

    function getReputationScore(bytes32 _targetId) external view returns (uint128) {
        if (targetStats[_targetId].reviewCount == 0) return 0;
        return targetStats[_targetId].totalScore / targetStats[_targetId].reviewCount;
    }
}