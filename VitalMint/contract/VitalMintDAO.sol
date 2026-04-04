// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VitalMintToken.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VitalMintDAO
 * @dev DAO 治理：科研资助方向投票、产品迭代优先级投票
 */
contract VitalMintDAO is AccessControl, ReentrancyGuard {
    bytes32 public constant PROPOSAL_CREATOR_ROLE = keccak256("PROPOSAL_CREATOR_ROLE");

    VitalMintToken public vmtToken;

    enum ProposalType {
        RESEARCH_GRANT,     // 科研资助
        PRODUCT_FEATURE,    // 产品功能
        PARAMETER_ADJUST    // 参数调整
    }

    enum ProposalState {
        Pending,
        Active,
        Rejected,
        Executed
    }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        address targetAddress;      // 资助接收方或合约地址
        uint256 targetAmount;       // 目标金额（VMT）
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;
    
    uint256 public minVotePower = 100 * 10 ** 18;  // 最小投票权重 100 VMT
    uint256 public votingPeriod = 7 days;

    event ProposalCreated(
        uint256 indexed id, 
        address proposer, 
        string title, 
        ProposalType proposalType,
        uint256 targetAmount
    );
    event Voted(uint256 indexed id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    constructor(address _vmtToken) {
        require(_vmtToken != address(0), "Invalid token address");
        vmtToken = VitalMintToken(_vmtToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROPOSAL_CREATOR_ROLE, msg.sender);
    }

    function createProposal(
        string calldata _title,
        string calldata _description,
        ProposalType _proposalType,
        address _targetAddress,
        uint256 _targetAmount
    ) external onlyRole(PROPOSAL_CREATOR_ROLE) returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_targetAmount > 0, "Invalid target amount");
        
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: _title,
            description: _description,
            proposalType: _proposalType,
            targetAddress: _targetAddress,
            targetAmount: _targetAmount,
            startBlock: block.timestamp,
            endBlock: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender, _title, _proposalType, _targetAmount);
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startBlock, "Voting not started");
        require(block.timestamp <= proposal.endBlock, "Voting ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        uint256 voteWeight = vmtToken.balanceOf(msg.sender);
        require(voteWeight >= minVotePower, "Insufficient voting power");

        hasVoted[_proposalId][msg.sender] = true;
        if (_support) {
            proposal.forVotes += voteWeight;
        } else {
            proposal.againstVotes += voteWeight;
        }

        emit Voted(_proposalId, msg.sender, _support, voteWeight);
    }

    function executeProposal(uint256 _proposalId) external nonReentrant {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endBlock, "Voting still active");
        require(!proposal.executed, "Already executed");

        bool passed = proposal.forVotes > proposal.againstVotes;
        require(passed, "Proposal rejected");

        proposal.executed = true;

        if (proposal.proposalType == ProposalType.RESEARCH_GRANT) {
            require(proposal.targetAddress != address(0), "Invalid recipient");
            vmtToken.mint(proposal.targetAddress, proposal.targetAmount);
        }

        emit ProposalExecuted(_proposalId);
    }

    function getProposalState(uint256 _proposalId) external view returns (ProposalState) {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.executed) return ProposalState.Executed;
        if (block.timestamp < proposal.startBlock) return ProposalState.Pending;
        if (block.timestamp > proposal.endBlock) {
            return (proposal.forVotes > proposal.againstVotes) ? ProposalState.Executed : ProposalState.Rejected;
        }
        return ProposalState.Active;
    }

    function setMinVotePower(uint256 _newMin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minVotePower = _newMin;
    }

    function setVotingPeriod(uint256 _newPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingPeriod = _newPeriod;
    }
}