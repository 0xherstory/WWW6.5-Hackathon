// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Vault.sol";
import "./Reputation.sol";
import "./GoalNFT.sol";

/**
 * @title GoalManager
 * @dev 光合契约核心管理合约：支持严格/成长模式结算及三方仲裁逻辑
 */
contract GoalManager is Ownable, ReentrancyGuard {
    // --- 状态定义 ---
    enum Status { OPEN, MATCHED, IN_PROGRESS, COMPLETED, FAILED, SETTLED,DISPUTED }
    enum SettlementMode { STRICT, GROWTH }
    enum Reason { CREATOR_FAULT, PARTNER_FAULT, MUTUAL_AGREEMENT }

    struct Bid {
        address bidder;      // 竞拍者地址
        uint deposit;        // 竞拍时缴纳的押金
        uint shareRatio;     // 分成比例 (0-100)
        SettlementMode mode; // 选定的结算模式
    }

    struct Goal {
        address creator;           // 发起人
        string desc;               // 目标描述
        uint reward;               // 原始奖金金额
        uint deadline;             // 截止时间戳
        address partner;           // 确定的合作伙伴
        Status status;             // 当前状态
        uint totalMilestones;      // 总里程碑数
        uint completedMilestones;  // 已完成里程碑数
        uint selectedBidIndex;     // 最终选中的竞拍索引

        uint lastProofTime;      // 伙伴最后一次提交打卡的时间
        bool pendingReview;      // 是否处于待审核状态
    }

    // --- 全局变量 ---
    uint public goalCount;
    mapping(uint => Goal) public goals;
    mapping(uint => Bid[]) public bids;

    address public arbitrator; // 指定仲裁员地址
    uint public arbitrationFee = 0.01 ether; // 设定一个固定的仲裁费门槛

    Vault public vault;
    Reputation public rep;
    GoalNFT public nft;

    // --- 事件 ---
    event GoalCreated(uint indexed id, address creator, uint reward);
    event GoalSettled(uint indexed id, Reason reason);
    event GoalDisputed(uint indexed id, address indexed creator, address indexed partner);
    event ProofSubmitted(uint indexed id, string proofHash, uint timestamp);

    // --- 权限控制 ---
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address payable _vault, address _rep, address _nft) Ownable(msg.sender) {
        vault = Vault(_vault);
        rep = Reputation(_rep);
        nft = GoalNFT(_nft);
        arbitrator = msg.sender; // 默认初始化仲裁员为部署者
    }

    // 设置新的仲裁员地址-----
    function setArbitrator(address _newArb) external onlyOwner {
        arbitrator = _newArb;
    }
    // 设置仲裁员的费用
    function setArbitrationFee(uint _fee) external onlyOwner {
        arbitrationFee = _fee;
    }

    /**
     * @notice 发起一个新的互助目标
     * @param duration 持续时长（秒）
     * @param milestones 任务分解的阶段总数
     */
    function createGoal(string memory desc, uint duration, uint milestones) external payable {
        require(msg.value > 0, "No reward");
        require(milestones > 0, "Milestones must > 0");

        // 将随交易发送的 ETH 存入 Vault 对应的项目池
        vault.deposit{value: msg.value}(goalCount);

        goals[goalCount] = Goal({
            creator: msg.sender,
            desc: desc,
            reward: msg.value,
            deadline: block.timestamp + duration,
            partner: address(0),
            status: Status.OPEN,
            totalMilestones: milestones,
            completedMilestones: 0,
            selectedBidIndex: 0,
            lastProofTime: 0,         
            pendingReview: false   
        });
        
        emit GoalCreated(goalCount, msg.sender, msg.value);
        goalCount++;
    }

    /**
     * @notice 合作伙伴或投资者参与竞拍
     * @param shareRatio 希望分得奖金的百分比
     * @param mode 结算模式选择（严格/成长）
     */
    function bid(uint id, uint shareRatio, SettlementMode mode) external payable {
        require(goals[id].status == Status.OPEN, "Goal not open for bidding");
        require(shareRatio <= 100, "Invalid ratio");
        
        // 存入押金到项目池
        vault.deposit{value: msg.value}(id);

        bids[id].push(Bid({
            bidder: msg.sender,
            deposit: msg.value,
            shareRatio: shareRatio,
            mode: mode
        }));
    }

    // 发布者选择合作伙伴
    function acceptBid(uint id, uint index) external {
        Goal storage g = goals[id];
        require(msg.sender == g.creator, "Only creator can accept bid");
        require(g.status == Status.OPEN, "Goal already matched");
        
        g.partner = bids[id][index].bidder;
        g.selectedBidIndex = index;
        g.status = Status.MATCHED;
    }
/**
 * @notice 未被选中的竞拍者取回押金
 * @param id 目标ID
 * @param bidIndex 竞拍索引
 */
    function claimRefund(uint id, uint bidIndex) external {
        Goal storage g = goals[id];
        Bid storage b = bids[id][bidIndex];

        // 只有在目标已经选定合作伙伴，且自己不是那个合作伙伴时，才能退款
        require(g.status != Status.OPEN, "Goal still open for bidding");
        require(msg.sender == b.bidder, "Only bidder can claim");
        require(msg.sender != g.partner, "Partner cannot refund through this");
        require(b.deposit > 0, "No deposit or already refunded");

        uint amount = b.deposit;
        b.deposit = 0; // 防止重入攻击 (Re-entrancy)

        vault.payout(id, msg.sender, amount);
    }

// --- 伙伴提交证明，启动 1 天倒计时 ---
function submitProof(uint id, string memory proofHash) external {
    Goal storage g = goals[id];
    require(msg.sender == g.partner, "Only partner");
    require(g.status == Status.MATCHED || g.status == Status.IN_PROGRESS, "Invalid status");

    g.lastProofTime = block.timestamp;
    g.pendingReview = true;
    
    if (g.status == Status.MATCHED) g.status = Status.IN_PROGRESS;
    // 触发事件通知前端显示倒计时
    emit ProofSubmitted(id, proofHash, block.timestamp);
}

// --- 自动确认：如果发布者 1 天没动静，伙伴可以跳过发布者直接确认 ---
function autoConfirmMilestone(uint id) external {
    Goal storage g = goals[id];
    require(g.status != Status.DISPUTED, "In dispute");
    require(g.pendingReview, "No proof pending");
    require(block.timestamp >= g.lastProofTime + 1 days, "Still in 1-day review period");
  
    g.pendingReview = false;
    g.completedMilestones++;
    
    if (g.completedMilestones == g.totalMilestones) {
        g.status = Status.COMPLETED;
    }
}

// --- 发布者拒绝：如果在 1 天内发现有问题，发布者可以拒绝并冻结，进入仲裁 ---
function rejectProof(uint id) external  payable  {
    Goal storage g = goals[id];
    require(msg.sender == g.creator, "Only creator");
    require(g.pendingReview, "Nothing to reject");
    require(msg.value >= arbitrationFee, "Must pay arbitration fee to dispute");
    // 将仲裁费存入 Vault 的项目池中暂存
    vault.deposit{value: msg.value}(id);

    g.pendingReview = false;
    g.status = Status.DISPUTED; // 关键：进入争议状态，锁定合约
    // 拒绝后不增加里程碑，将状态标记为纠纷，等待 arbitrator 介入
    emit GoalDisputed(id, g.creator, g.partner);

}
    /**
     * @notice 发布者确认一个里程碑完成
     */
    function confirmMilestone(uint id) external {
        Goal storage g = goals[id];
        require(msg.sender == g.creator, "Only creator can confirm");
        require(g.completedMilestones < g.totalMilestones, "Goal already finished");
        
        g.completedMilestones++;
        if (g.status == Status.MATCHED) g.status = Status.IN_PROGRESS;
        
        // 如果所有阶段都确认了，自动转为完成状态
        if (g.completedMilestones == g.totalMilestones) {
            g.status = Status.COMPLETED;
        }
    }



    /**
     * @notice 最终结算与争议仲裁（核心逻辑）
     * @param reason 仲裁理由，仅在非 COMPLETED 状态下生效
     */
    function settle(uint id, Reason reason) external onlyArbitrator nonReentrant{
        Goal storage g = goals[id];
        Bid storage b = bids[id][g.selectedBidIndex];

        bool isExpired = block.timestamp > g.deadline;
        // 允许结算的条件：1.已完成 2.已超时 3.处于争议状态
        require(
        g.status == Status.COMPLETED || isExpired || g.status == Status.DISPUTED, 
        "Goal still active and no dispute"
    );
        require(g.status != Status.SETTLED, "Already settled");

    

        if (g.status == Status.COMPLETED) {
            // 情况A：双方愉快合作完成，根据既定模式分钱
            _distribute(id, 100); 
        } else {
            // 情况B：任务未完成，由仲裁员判定责任
        
            if (reason == Reason.CREATOR_FAULT) {
                // --- 情况 1：发布者恶意拒绝 (发布者输) ---
                // 发布者责任（如拒绝确认里程碑）：全额奖金 + 押金 补偿给伙伴
                vault.payout(id, g.partner, g.reward + b.deposit);
               //  仲裁费已经在创建/拒绝时存入了 vault 的池子
               // 2. 国库拿到：发布者质押的仲裁费 (作为平台惩罚)
                vault.payout(id, vault.treasury(), arbitrationFee);
                rep.decrease(g.creator);
            } 
            else if (reason == Reason.PARTNER_FAULT) {
                // --- 情况 2：伙伴违约 (伙伴输) ---------------
                // 伙伴责任（如半路跑路）：退回发布者奖金与仲裁费，扣除伙伴押金（留在Vault）
                vault.payout(id, g.creator, g.reward + arbitrationFee);
                // 2. 伙伴押金留在池子里，后续由管理员通过 withdrawExcess 提取到国库
                rep.decrease(g.partner);
            } 
            else {
                // --- 情况 3：协议放弃 (平局) ------------------
                // 双方协议终止：按目前进度结算，各回各家
                // 各自退回，仲裁费退给发布者或平分（根据你的偏好）
                vault.payout(id, g.creator, g.reward + arbitrationFee);
                vault.payout(id, g.partner, b.deposit);
                _distribute(id, (g.completedMilestones * 100 / g.totalMilestones));
            }
        }
        g.status = Status.SETTLED;
        emit GoalSettled(id, reason);
    }

    // 内部计算与拨付资金
    function _distribute(uint id, uint forcedProgress) internal {
        Goal storage g = goals[id];
        Bid storage b = bids[id][g.selectedBidIndex];

        // 严格模式强制要求100%进度，否则由仲裁判定
        uint progress = (b.mode == SettlementMode.STRICT) ? 100 : (g.completedMilestones * 100 / g.totalMilestones);
        
        // 如果是强制分配（协议放弃），取较小值
        if(forcedProgress < progress) progress = forcedProgress;

        // 计算公式：奖金 * 进度比例 * 伙伴分成比
        uint partnerReward = (g.reward * progress / 100) * b.shareRatio / 100;
        // 发布者拿回：剩余的奖金部分
        uint creatorRefund = g.reward - (g.reward * progress / 100 * b.shareRatio / 100);

        // 伙伴拿走：分红 + 自己的押金
        vault.payout(id, g.partner, partnerReward + b.deposit);
        // 发布者拿走：剩余部分
        vault.payout(id, g.creator, creatorRefund);
        // 荣誉体系
        rep.increase(g.creator);
        rep.increase(g.partner);
        nft.mint(g.creator);// 为发布者铸造一个成就勋章
    }
}