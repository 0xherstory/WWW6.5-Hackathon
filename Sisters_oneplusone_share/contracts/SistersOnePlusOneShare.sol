// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Sisters-OnePlusOne-Share (SOOS)
 * @dev 一个基于信任最小化的女性互助拼单托管合约
 * 包含：双向身份验证、超时取消、申诉仲裁机制
 */
contract SistersOnePlusOneShare {
    
    // 交易状态枚举
    enum Status { Open, Joined, Completed, Disputed, Cancelled }

    struct Deal {
        address initiator;     // 姐妹 A
        address participant;   // 姐妹 B
        uint256 totalPrice;    // 商品总价
        uint256 stake;         // B 需要支付的金额 (totalPrice / 2)
        uint256 deadline;      // 拼单截止时间
        Status status;         // 当前状态
        string itemDetail;     // 商品信息 (建议存 IPFS 哈希)
    }

    // 状态变量
    mapping(uint256 => Deal) public deals;
    mapping(address => bool) public isVerifiedSister; // 模拟身份验证白名单
    uint256 public dealCount;
    address public arbiter; // 仲裁者（实际项目中可以是 DAO 或 多签地址）

    // 事件追踪
    event DealCreated(uint256 indexed dealId, address initiator, uint256 deadline);
    event DealJoined(uint256 indexed dealId, address participant);
    event DealFinished(uint256 indexed dealId);
    event DisputeRaised(uint256 indexed dealId, address by);

    // 修饰符：仅限已验证的姐妹
    modifier onlyVerified() {
        require(isVerifiedSister[msg.sender], "SOOS: Only verified sisters allowed");
        _;
    }

    constructor() {
        arbiter = msg.sender; // 初始开发阶段，部署者为仲裁者
        // 预填你自己作为验证用户，方便测试
        isVerifiedSister[msg.sender] = true;
    }

    /**
     * @dev 1. 发起拼单 (A 需要验证)
     */
    function createDeal(string memory _detail, uint256 _totalPrice, uint256 _durationHours) 
        external 
        onlyVerified 
    {
        dealCount++;
        deals[dealCount] = Deal({
            initiator: msg.sender,
            participant: address(0),
            totalPrice: _totalPrice,
            stake: _totalPrice / 2,
            deadline: block.timestamp + (_durationHours * 1 hours),
            status: Status.Open,
            itemDetail: _detail
        });

        emit DealCreated(dealCount, msg.sender, deals[dealCount].deadline);
    }

    /**
     * @dev 2. 加入拼单 (B 需要验证并支付)
     */
    function joinDeal(uint256 _dealId) 
        external 
        payable 
        onlyVerified 
    {
        Deal storage deal = deals[_dealId];
        require(deal.status == Status.Open, "SOOS: Deal not open");
        require(block.timestamp < deal.deadline, "SOOS: Deal expired");
        require(msg.value == deal.stake, "SOOS: Incorrect payment amount");
        require(msg.sender != deal.initiator, "SOOS: Cannot join your own deal");

        deal.participant = msg.sender;
        deal.status = Status.Joined;

        emit DealJoined(_dealId, msg.sender);
    }

    /**
     * @dev 3. 确认收货 (仅限 B 操作，资金转给 A)
     */
    function confirmAndRelease(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.participant, "SOOS: Only participant can confirm");
        require(deal.status == Status.Joined, "SOOS: Invalid status");

        deal.status = Status.Completed;
        payable(deal.initiator).transfer(deal.stake);

        emit DealFinished(_dealId);
    }

    /**
     * @dev 4. 超时取消 (无人加入时，A 可以撤回)
     */
    function cancelExpiredDeal(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.initiator, "SOOS: Only initiator");
        require(deal.status == Status.Open, "SOOS: Cannot cancel now");
        require(block.timestamp >= deal.deadline, "SOOS: Not expired yet");

        deal.status = Status.Cancelled;
        // 如果 A 在发起时交了保证金，这里可以退款
    }

    /**
     * @dev 5. 发起申诉 (B 发现问题时锁定资金)
     */
    function raiseDispute(uint256 _dealId) external {
        Deal storage deal = deals[_dealId];
        require(msg.sender == deal.participant, "SOOS: Only participant can dispute");
        require(deal.status == Status.Joined, "SOOS: Too late to dispute");

        deal.status = Status.Disputed;
        emit DisputeRaised(_dealId, msg.sender);
    }

    /**
     * @dev 6. 仲裁处理 (仅限仲裁者)
     */
    function resolveDispute(uint256 _dealId, bool refundToB) external {
        require(msg.sender == arbiter, "SOOS: Only arbiter");
        Deal storage deal = deals[_dealId];
        require(deal.status == Status.Disputed, "SOOS: Not in dispute");

        deal.status = Status.Completed;
        if (refundToB) {
            payable(deal.participant).transfer(deal.stake);
        } else {
            payable(deal.initiator).transfer(deal.stake);
        }
    }

    // --- 辅助功能 ---

    // 模拟身份认证方法（实际应对接 Polygon ID 或 SBT）
    function verifySister(address _sister) external {
        require(msg.sender == arbiter, "SOOS: Only admin can verify");
        isVerifiedSister[_sister] = true;
    }

    // 允许合约接收测试代币
    receive() external payable {}
}