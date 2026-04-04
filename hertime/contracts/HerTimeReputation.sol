// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IHerTimeSkillNFT {
    function checkAndMint(address member) external;
}

/// @title HerTime Reputation
/// @notice 双盲评分提交与声誉分计算。双方都提交后自动公开并更新声誉。
contract HerTimeReputation is AccessControl {
    bytes32 public constant SERVICE_CONTRACT_ROLE = keccak256("SERVICE_CONTRACT_ROLE");

    struct Rating {
        uint8 score;          // 1-5
        bytes32 commentHash;  // IPFS hash of comment text
        bool submitted;
    }

    struct ReputationRecord {
        uint256 totalScore;
        uint256 ratingCount;
        uint256 totalServiceCount;                    // 总服务次数
        mapping(uint8 => uint256) serviceCountByTag;  // 按 tag 分类的服务次数
    }

    // serviceId => rater => Rating（双盲：提交后暂不公开）
    mapping(bytes32 => mapping(address => Rating)) private _ratings;

    // serviceId => 是否已解锁评分
    mapping(bytes32 => bool) public ratingUnlocked;

    // serviceId => [requester, provider]（用于校验评分身份）
    mapping(bytes32 => address[2]) public serviceParties;

    // serviceId => 双方是否都已提交
    mapping(bytes32 => bool) public bothSubmitted;

    // 成员声誉档案
    mapping(address => ReputationRecord) private _records;

    IHerTimeSkillNFT public skillNFT;

    event RatingSubmitted(bytes32 indexed serviceId, address indexed rater);
    event RatingRevealed(bytes32 indexed serviceId, uint8 score0, uint8 score1);
    event ReputationUpdated(address indexed member, uint256 newAvgScoreX100);
    event ServiceRecorded(address indexed provider, uint8 tag, uint256 newCount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setSkillNFT(address _skillNFT) external onlyRole(DEFAULT_ADMIN_ROLE) {
        skillNFT = IHerTimeSkillNFT(_skillNFT);
    }

    /// @notice Service 合约服务完成后调用，解锁评分并记录提供方服务次数
    function unlockRating(
        bytes32 _serviceId,
        address _requester,
        address _provider,
        uint8 _tag
    ) external onlyRole(SERVICE_CONTRACT_ROLE) {
        ratingUnlocked[_serviceId] = true;
        serviceParties[_serviceId] = [_requester, _provider];
        // 记录提供方在该 tag 下的服务次数
        _records[_provider].serviceCountByTag[_tag]++;
        _records[_provider].totalServiceCount++;
        emit ServiceRecorded(_provider, _tag, _records[_provider].serviceCountByTag[_tag]);
    }

    /// @notice 提交评分（双盲：提交后分数不立即公开）
    function submitRating(
        bytes32 _serviceId,
        uint8 _score,
        bytes32 _commentHash
    ) external {
        require(ratingUnlocked[_serviceId], "Rating not unlocked");
        require(_score >= 1 && _score <= 5, "Score must be 1-5");

        address[2] memory parties = serviceParties[_serviceId];
        require(
            msg.sender == parties[0] || msg.sender == parties[1],
            "Not a party to this service"
        );

        Rating storage r = _ratings[_serviceId][msg.sender];
        require(!r.submitted, "Already submitted");

        r.score = _score;
        r.commentHash = _commentHash;
        r.submitted = true;

        emit RatingSubmitted(_serviceId, msg.sender);

        // 双方都提交后自动公开并更新声誉
        if (_ratings[_serviceId][parties[0]].submitted &&
            _ratings[_serviceId][parties[1]].submitted) {
            _revealAndUpdate(_serviceId);
        }
    }

    function _revealAndUpdate(bytes32 _serviceId) internal {
        address[2] memory parties = serviceParties[_serviceId];
        uint8 score0 = _ratings[_serviceId][parties[1]].score; // parties[0] 收到的分
        uint8 score1 = _ratings[_serviceId][parties[0]].score; // parties[1] 收到的分

        bothSubmitted[_serviceId] = true;

        _updateRecord(parties[0], score0);
        _updateRecord(parties[1], score1);

        emit RatingRevealed(_serviceId, score0, score1);
    }

    function _updateRecord(address _member, uint8 _score) internal {
        ReputationRecord storage rec = _records[_member];
        rec.totalScore += _score;
        rec.ratingCount++;

        uint256 avg = (rec.totalScore * 100) / rec.ratingCount;
        emit ReputationUpdated(_member, avg);

        // 通知 SkillNFT 合约检查是否达到 mint 条件
        if (address(skillNFT) != address(0)) {
            skillNFT.checkAndMint(_member);
        }
    }

    /// @notice 查询声誉均分（scaled x100，即 450 = 4.50 分）
    function getAvgScore(address _member) external view returns (uint256) {
        ReputationRecord storage rec = _records[_member];
        if (rec.ratingCount == 0) return 0;
        return (rec.totalScore * 100) / rec.ratingCount;
    }

    /// @notice 查询某 tag 下的服务次数（供 SkillNFT 合约使用）
    function getServiceCount(address _member, uint8 _tag) external view returns (uint256) {
        return _records[_member].serviceCountByTag[_tag];
    }

    /// @notice 查询总服务次数
    function getTotalServiceCount(address _member) external view returns (uint256) {
        return _records[_member].totalServiceCount;
    }

    /// @notice 查询评分是否已提交（不暴露分数）
    function hasSubmitted(bytes32 _serviceId, address _rater) external view returns (bool) {
        return _ratings[_serviceId][_rater].submitted;
    }

    /// @notice 双方都提交后，查询对方给自己的分
    function getMyScore(bytes32 _serviceId) external view returns (uint8) {
        require(bothSubmitted[_serviceId], "Ratings not revealed yet");
        address[2] memory parties = serviceParties[_serviceId];
        if (msg.sender == parties[0]) {
            return _ratings[_serviceId][parties[1]].score;
        } else if (msg.sender == parties[1]) {
            return _ratings[_serviceId][parties[0]].score;
        }
        revert("Not a party");
    }
}
