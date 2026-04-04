// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PleafToken.sol";
import "./SeedToken.sol";
import "./SeasonManager.sol";
import "./GlobalEcology.sol";
import "./GardenEnvironment.sol";

/**
 * @title PlantDAO
 * @dev DAO 治理合约（生态调节版）
 * - $PLEAF 持有者可发起提案和投票
 * - 提案类别: 活动/经济/功能/治理/生态
 * - 可调节: 奖励倍率/生态阈值/病害防治/季节参数
 */
contract PlantDAO is Ownable {
    PleafToken public pleafToken;

    enum ProposalState { Active, Passed, Failed, Executed }
    enum ProposalCategory { Activity, Economy, Feature, Governance, Ecology }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        ProposalCategory category;
        uint256 createdTime;
        uint256 votingDeadline;
        uint256 votesFor;
        uint256 votesAgainst;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
        ProposalState state;
    }

    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public quorumPercentage = 50;

    mapping(uint256 => Proposal) public proposals;

    // 关联合约地址（用于执行治理操作）
    address public seedToken;
    address public seasonManager;
    address public globalEcology;
    address public gardenEnvironment;
    address public plantCare;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalStateChanged(uint256 indexed proposalId, ProposalState newState);

    constructor(address _pleafToken) {
        pleafToken = PleafToken(_pleafToken);
    }

    function setContracts(address _seed, address _season, address _ecology, address _garden, address _care) external onlyOwner {
        seedToken = _seed;
        seasonManager = _season;
        globalEcology = _ecology;
        gardenEnvironment = _garden;
        plantCare = _care;
    }

    function createProposal(
        string memory title,
        string memory description,
        ProposalCategory category
    ) external returns (uint256) {
        require(pleafToken.balanceOf(msg.sender) >= 1e18, "Need at least 1 PLEAF to propose");

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.category = category;
        proposal.createdTime = block.timestamp;
        proposal.votingDeadline = block.timestamp + votingPeriod;
        proposal.state = ProposalState.Active;

        emit ProposalCreated(proposalId, msg.sender, title);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp < proposal.votingDeadline, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 weight = pleafToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = weight;

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.Active, "Proposal not active");
        require(block.timestamp >= proposal.votingDeadline, "Voting period not ended");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        if (totalVotes == 0) {
            proposal.state = ProposalState.Failed;
        } else if (proposal.votesFor > proposal.votesAgainst) {
            proposal.state = ProposalState.Passed;
        } else {
            proposal.state = ProposalState.Failed;
        }

        emit ProposalStateChanged(proposalId, proposal.state);
    }

    // ============ 生态治理执行函数（需提案通过后调用）============

    function executeSetDailyCap(uint256 newCap) external onlyOwner {
        SeedToken(seedToken).setDailyRewardCap(newCap);
    }

    function executeSetEcologyMultiplier(uint256 multiplier) external onlyOwner {
        SeedToken(seedToken).setEcologyMultiplier(multiplier);
    }

    function executeSetSeason( uint8 season) external onlyOwner {
        SeasonManager(seasonManager).setSeason(SeasonManager.Season(season));
    }

    function executeSetEcologyThresholds(uint256 thriving, uint256 declining) external onlyOwner {
        GlobalEcology(globalEcology).setThresholds(thriving, declining);
    }

    function executeSetEcologyMultipliers(uint256 thriving, uint256 balanced, uint256 declining) external onlyOwner {
        GlobalEcology(globalEcology).setMultipliers(thriving, balanced, declining);
    }

    function executeSetGardenBonuses(uint256 thriving, uint256 normal, uint256 neglected) external onlyOwner {
        GardenEnvironment(gardenEnvironment).setBonuses(thriving, normal, neglected);
    }

    function executeSetDiseaseActive(uint256 diseaseId, bool active) external onlyOwner {
        SeasonManager(seasonManager).setDiseaseActive(diseaseId, active);
    }

    function executeResolveEcologyEvent(uint256 eventId) external onlyOwner {
        GlobalEcology(globalEcology).resolveEvent(eventId);
    }

    function executeRecalculateEcology() external onlyOwner {
        GlobalEcology(globalEcology).recalculateIndex();
    }

    // ============ View Functions ============

    function getProposalInfo(uint256 proposalId) external view returns (
        string memory title, string memory description, address proposer,
        ProposalCategory category, uint256 createdTime, uint256 votingDeadline,
        uint256 votesFor, uint256 votesAgainst, ProposalState state
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title, proposal.description, proposal.proposer,
            proposal.category, proposal.createdTime, proposal.votingDeadline,
            proposal.votesFor, proposal.votesAgainst, proposal.state
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    function getVotingPower(address account) external view returns (uint256) {
        return pleafToken.getVotingPower(account);
    }
}