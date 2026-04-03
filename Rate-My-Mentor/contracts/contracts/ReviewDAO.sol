// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./InternSBT.sol";

interface IReviewContract {
    function updateReviewStatus(uint256 _reviewId, uint8 _newStatus) external;
}

/**
 * @title ReviewDAO
 * @dev 专门用于处理 InternSBT 评价争议的极简 DAO
 * 核心逻辑：针对特定 ReviewID 发起“恢复”或“撤销”投票
 */
contract ReviewDAO is ReentrancyGuard {
    

    enum FailureReason { 
    None,           // 0: 成功
    QuorumFailed    // 1: 赞成票未达到比例
}
    struct Proposal {
        // --- Slot 1 (总计 232 bits, 完美打包) ---
        address proposer;            // 160 bits: 提案人
        uint32 id;                   // 32 bits: 提案自增 ID
        uint32 deadline;             // 32 bits: 截止时间戳 (支持到 2106 年)
        bool executed;               // 8 bits: 是否已执行

        // --- Slot 2 (总计 128 bits, 完美打包) ---
        uint32 votesFor;             // 32 bits: 赞成票 (一人一票制) 
        uint32 votesAgainst;         // 32 bits: 反对票
        uint32 executionTime;        // 32 bits: 时间锁解锁时间
        uint32 snapshotTotalSupply;  // 32 bits: 提案创建时的总人数快照 

        // --- Slot 3 & 4 (固定长度数据，拒绝 string 以节省 Gas) ---
        uint256 targetReviewId;      // 指向 ReviewContract 中的评价 ID 
    }

    // --- 状态变量 (打包 Slot 以节省 Gas) ---
    address public admin;              // 160 bits
    uint32 public votingDuration;      // 32 bits: 投票期时长 (秒) 
    uint32 public timelockDuration;    // 32 bits: 执行锁定时长 (秒) 
    uint8 public quorumPercentage = 10; // 8 bits: 法定人数比例 (1-100) 
    uint16 public minQuorumValue = 3;// 默认最少需要 3 个人参与，防止“光杆司令”过提案
    
    uint32 public nextProposalId;
    address public reviewContract;     // 目标评价合约地址
    InternSBT public sbtContract;      // SBT 凭证合约地址 

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted; 
    mapping(uint256 => bool) public hasActiveProposal;

    // --- 事件 ---
    event ProposalCreated(uint256 indexed id, uint256 indexed reviewId, address proposer);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support); 
    event ProposalExecuted(uint256 indexed id, bool passed, FailureReason reason);
    event ProposalTimelockStarted(uint256 indexed id, uint32 executionTime); 

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this"); 
        _;
    }

    constructor(
        address _sbtContract, 
        uint32 _votingDuration, 
        uint32 _timelockDuration
    ) {
        require(_sbtContract != address(0), "Invalid SBT address"); // ✅ 增加检查
        sbtContract = InternSBT(_sbtContract); 
        votingDuration = _votingDuration; 
        timelockDuration = _timelockDuration;
        admin = msg.sender;
    }

    // --- 管理员配置函数 ---

    function setReviewContract(address _reviewContract) external onlyAdmin {
        require(_reviewContract != address(0), "Invalid address");
        reviewContract = _reviewContract;
    }

    function setQuorumPercentage(uint8 _newPercentage) external onlyAdmin {
        require(_newPercentage >= 1 && _newPercentage <= 100, "Invalid quorum");
        quorumPercentage = _newPercentage;
    }

    // ✅ 新增：允许管理员调整保底人数（例如项目初期设为 3，后期设为 1）
    function setMinQuorumValue(uint16 _newValue) external onlyAdmin {
        minQuorumValue = _newValue;
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }

    // --- 核心业务函数 ---

    /**
     * @dev 创建提案：只需传入评价 ID 和操作意向
     */
    function createProposal(uint256 _reviewId, uint256 _tokenId) external returns (uint32) {
        // 检查该 Token 是否属于调用者，且是否有效
         require(sbtContract.ownerOf(_tokenId) == msg.sender, "Not your SBT");
         require(sbtContract.isValidCredential(_tokenId), "SBT is revoked or invalid");
       
        require(reviewContract != address(0), "ReviewContract not set");
        require(!hasActiveProposal[_reviewId], "Proposal already exists for this review"); // ← 新增校验
        hasActiveProposal[_reviewId] = true; // ← 标记该 review 已进入治理流程
        IReviewContract(reviewContract).updateReviewStatus(_reviewId, 1); // 1 = Disputed
        

        uint32 currentTotalSupply = uint32(sbtContract.totalSupply()); 

        proposals[nextProposalId] = Proposal({
            proposer: msg.sender,
            id: nextProposalId,
            deadline: uint32(block.timestamp) + votingDuration,
            executed: false,
            votesFor: 0,
            votesAgainst: 0,
            executionTime: 0,
            snapshotTotalSupply: currentTotalSupply,
            targetReviewId: _reviewId
        });

        emit ProposalCreated(nextProposalId, _reviewId, msg.sender);
        return nextProposalId++;
    }

    function vote(uint32 proposalId, bool support,uint256 _tokenId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting period over"); 
        // 1. 确保这个 Token 确实属于投票者
        require(sbtContract.ownerOf(_tokenId) == msg.sender, "Not your SBT");
        // 2. 调用 InternSBT 的 isValidCredential 检查 isActive 状态 
        require(sbtContract.isValidCredential(_tokenId), "SBT is revoked or invalid");


        require(!hasVoted[proposalId][msg.sender], "Already voted"); 
        if (support) {
            proposal.votesFor += 1; 
        } else {
            proposal.votesAgainst += 1; 
        }

        hasVoted[proposalId][msg.sender] = true; 
        emit Voted(proposalId, msg.sender, support);
    }

    function finalizeProposal(uint32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting period not yet over"); 
        require(!proposal.executed, "Proposal already executed"); 
        require(proposal.executionTime == 0, "Already finalized");

        uint32 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint32 calculatedQuorum = (proposal.snapshotTotalSupply * quorumPercentage) / 100;
        
       // ✅ 修改：将 uint16 提升为 uint32 进行比对，确保逻辑安全
        uint32 quorumNeeded = (calculatedQuorum > uint32(minQuorumValue)) ? calculatedQuorum : uint32(minQuorumValue);

        // 极端情况保底：防止总人数还没达到最小值导致的死锁
        if (quorumNeeded > proposal.snapshotTotalSupply) quorumNeeded = proposal.snapshotTotalSupply;


        if (totalVotes >= quorumNeeded && proposal.votesFor > proposal.votesAgainst) {
            proposal.executionTime = uint32(block.timestamp) + timelockDuration; 
            emit ProposalTimelockStarted(proposalId, proposal.executionTime);
        } else {
            proposal.executed = true; 
            hasActiveProposal[proposal.targetReviewId] = false; 
            emit ProposalExecuted(proposalId, false, FailureReason.QuorumFailed);
        }
    }

    /**
     * @dev 执行提案：在内部安全构造调用 ReviewContract 的指令
     */
    function executeProposal(uint32 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed"); 
        require(proposal.executionTime > 0 && block.timestamp >= proposal.executionTime, "In timelock"); 

        proposal.executed = true;
        hasActiveProposal[proposal.targetReviewId] = false; // ✅ 释放提案锁

        
        // 映射操作：Action.Restore -> Status.Normal (0); Action.Revoke -> Status.Revoked (2) 
        uint256 totalHolders = sbtContract.totalSupply();
        uint256 quorumNeeded = (totalHolders * quorumPercentage) / 100;
        if (quorumNeeded < minQuorumValue) quorumNeeded = minQuorumValue;

        if (proposal.votesFor >= quorumNeeded) {
         // 赞成票达到比例 → Revoked
         IReviewContract(reviewContract).updateReviewStatus(proposal.targetReviewId, 2);
        
        } else {
            // 未达到 → 恢复 Normal
            IReviewContract(reviewContract).updateReviewStatus(proposal.targetReviewId, 0);
            }

        emit ProposalExecuted(proposalId, true,FailureReason.None);
    }
}