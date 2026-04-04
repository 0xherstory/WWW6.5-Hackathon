// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// 直接通过 GitHub 路径引用你仓库中的依赖，解决 Remix 本地路径报错
import "github.com/AimerMike/eyechain-pulse/contracts/UserManagement.sol";
import "github.com/AimerMike/eyechain-pulse/contracts/RiskManagement.sol";

/**
 * @title DataSharingAndRewards
 * @dev 核心商业逻辑：实现 B2B 数据变现与用户激励闭环
 */
contract DataSharingAndRewards is AccessControl, ReentrancyGuard {
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    IERC20 public rewardToken;
    UserManagement public userManagement;
    RiskManagement public riskManagement;

    // 状态变量
    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public lastRewardedEventId;
    
    // 经济模型参数
    uint256 public dataAccessFee = 0.01 ether; // 机构购买每条数据的单价
    uint256 public treasuryShare = 30;         // 30% 留给 DAO 库房，70% 分给用户

    event DataShared(address indexed user, uint256 eventId, uint256 reward);
    event RewardClaimed(address indexed user, uint256 amount);
    event InstitutionPaymentReceived(address indexed institution, uint256 amount);

    constructor(
        address admin, 
        address _userManagement, 
        address _riskManagement, 
        address _rewardToken
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DAO_ROLE, admin);
        
        userManagement = UserManagement(_userManagement);
        riskManagement = RiskManagement(_riskManagement);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @notice 触发奖励 (由后端或授权角色根据数据贡献度触发)
     * @dev 解决了“只出不进”：奖励的基础是该数据具备医学研究价值（RPN高）
     */
    function triggerReward(address _user) external onlyRole(DAO_ROLE) {
        require(userManagement.registeredUsers(_user), "EyeChain: User not registered");
        
        // 从 RiskManagement 获取最新的 FMEA 评估结果
        RiskManagement.RiskEvent memory ev = riskManagement.getLastEvent(_user);
        
        // 幂等性校验：防止同一事件被重复奖励
        require(ev.eventId > lastRewardedEventId[_user] || (ev.eventId == 0 && lastRewardedEventId[_user] == 0), "EyeChain: Event already processed");

        // RPN 动态奖励算法：
        // 基础奖励 1 Token + (风险分 * 0.01 Token)
        // 意味着低头时间越长、姿态越差的数据，卖给机构的价格越高，用户分红越多
        uint256 baseReward = 1e18; 
        uint256 riskBonus = uint256(ev.totalRisk) * 1e16; 
        uint256 totalReward = baseReward + riskBonus;

        pendingRewards[_user] += totalReward;
        lastRewardedEventId[_user] = ev.eventId;

        emit DataShared(_user, ev.eventId, totalReward);
    }

    /**
     * @notice 用户手动领取累积的 Token 奖励
     */
    function claimReward() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "EyeChain: No pending rewards");
        require(rewardToken.balanceOf(address(this)) >= amount, "EyeChain: Treasury low, awaiting institutional funding");

        pendingRewards[msg.sender] = 0;
        bool success = rewardToken.transfer(msg.sender, amount);
        require(success, "EyeChain: Transfer failed");

        emit RewardClaimed(msg.sender, amount);
    }

    /**
     * @notice B2B 接口：医疗机构支付费用购买数据访问权限
     * @dev 资金进入合约，为用户奖励池提供流动性
     */
    function purchaseData(uint256 _recordCount) external payable onlyRole(INSTITUTION_ROLE) {
        uint256 requiredFee = _recordCount * dataAccessFee;
        require(msg.value >= requiredFee, "EyeChain: Insufficient fee");
        
        emit InstitutionPaymentReceived(msg.sender, msg.value);
    }

    // --- DAO 管理功能 ---

    function setFees(uint256 _newFee, uint256 _newShare) external onlyRole(DAO_ROLE) {
        require(_newShare <= 100, "Invalid share");
        dataAccessFee = _newFee;
        treasuryShare = _newShare;
    }

    function withdrawTreasury() external onlyRole(DAO_ROLE) {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
