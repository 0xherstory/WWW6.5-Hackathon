// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SisterhoodMembership.sol";
import "./SisterhoodTreasury.sol";

contract SisterhoodVoting {
    SisterhoodMembership public membership;
    SisterhoodTreasury public treasury;

    struct Proposal {
        address payable recipient;
        uint256 amount;
        string reason;
        uint256 voteStart;
        uint256 voteEnd;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    Proposal[] public proposals;

    event ProposalCreated(uint256 indexed proposalId, address recipient, uint256 amount, string reason);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _membership, address payable _treasury) {
        membership = SisterhoodMembership(_membership);
        treasury = SisterhoodTreasury(_treasury);
    }

    function createProposal(address payable recipient, uint256 amount, string calldata reason) external {
        require(membership.isActive(msg.sender), "Only members can propose");
        uint256 proposalId = proposals.length;
        Proposal storage p = proposals.push();
        p.recipient = recipient;
        p.amount = amount;
        p.reason = reason;
        p.voteStart = block.number;
        p.voteEnd = block.number + 100; // 约25分钟（取决于出块速度）
        p.executed = false;
        emit ProposalCreated(proposalId, recipient, amount, reason);
    }

    function vote(uint256 proposalId, bool support) external {
        require(membership.isActive(msg.sender), "Only members can vote");
        Proposal storage p = proposals[proposalId];
        require(block.number < p.voteEnd, "Voting ended");
        require(block.number >= p.voteStart, "Voting not started");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        if (support) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }
        emit Voted(proposalId, msg.sender, support);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(block.number >= p.voteEnd, "Voting still ongoing");
        require(!p.executed, "Already executed");

        uint256 totalVotes = p.yesVotes + p.noVotes;
        require(totalVotes > 0, "No votes cast");
        require(p.yesVotes * 3 >= totalVotes * 2, "Not enough yes votes"); // 2/3多数

        p.executed = true;
        treasury.releaseFunds(p.recipient, p.amount, p.reason);
        emit ProposalExecuted(proposalId);
    }

    function getProposalVotes(uint256 proposalId) external view returns (uint256 yes, uint256 no, bool executed) {
        Proposal storage p = proposals[proposalId];
        return (p.yesVotes, p.noVotes, p.executed);
    }
}
