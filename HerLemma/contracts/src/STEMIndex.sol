// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Owned.sol";

error NotManager();

contract STEMIndex is Owned {
    struct GlobalStats {
        uint256 totalParticipants;
        uint256 totalExplanations;
        uint256 totalUnderstoodVotes;
        uint256 totalTipsWei;
        uint256 totalBounties;
        uint256 totalBountyRewardsWei;
        uint256 totalPlatformFeesWei;
    }

    struct ConceptStats {
        uint256 explanations;
        uint256 understoodVotes;
        uint256 tipsWei;
        uint256 bounties;
        uint256 bountyRewardsWei;
    }

    struct UserStats {
        uint256 explanationsCreated;
        uint256 explanationsValidated;
        uint256 understoodVotesReceived;
        uint256 understoodVotesCast;
        uint256 avaxEarnedWei;
        uint256 proveEarned;
        uint256 bountyWins;
    }

    address public manager;
    GlobalStats public globalStats;

    mapping(bytes32 => ConceptStats) public conceptStats;
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public seenParticipant;

    event ManagerUpdated(address indexed manager);

    constructor(address initialOwner) Owned(initialOwner) {}

    modifier onlyManager() {
        if (msg.sender != manager) revert NotManager();
        _;
    }

    function setManager(address newManager) external onlyOwner {
        if (newManager == address(0)) revert ZeroAddress();
        manager = newManager;
        emit ManagerUpdated(newManager);
    }

    function recordExplanation(bytes32 conceptKey, address author) external onlyManager {
        _trackParticipant(author);
        globalStats.totalExplanations += 1;
        conceptStats[conceptKey].explanations += 1;
        userStats[author].explanationsCreated += 1;
    }

    function recordUnderstoodVote(
        bytes32 conceptKey,
        address author,
        address voter,
        uint256 authorProveReward,
        uint256 voterProveReward,
        bool firstValidation
    ) external onlyManager {
        _trackParticipant(author);
        _trackParticipant(voter);

        globalStats.totalUnderstoodVotes += 1;
        conceptStats[conceptKey].understoodVotes += 1;

        userStats[author].understoodVotesReceived += 1;
        userStats[voter].understoodVotesCast += 1;
        userStats[author].proveEarned += authorProveReward;
        userStats[voter].proveEarned += voterProveReward;

        if (firstValidation) {
            userStats[author].explanationsValidated += 1;
        }
    }

    function recordTip(
        bytes32 conceptKey,
        address author,
        address tipper,
        uint256 authorAmount,
        uint256 platformFee,
        uint256 authorProveReward
    ) external onlyManager {
        _trackParticipant(author);
        _trackParticipant(tipper);

        uint256 grossAmount = authorAmount + platformFee;
        globalStats.totalTipsWei += grossAmount;
        globalStats.totalPlatformFeesWei += platformFee;

        conceptStats[conceptKey].tipsWei += grossAmount;
        userStats[author].avaxEarnedWei += authorAmount;
        userStats[author].proveEarned += authorProveReward;
    }

    function recordBountyCreated(bytes32 conceptKey, address creator) external onlyManager {
        _trackParticipant(creator);
        globalStats.totalBounties += 1;
        conceptStats[conceptKey].bounties += 1;
    }

    function recordBountySettled(
        bytes32 conceptKey,
        address winner,
        uint256 winnerAmount,
        uint256 platformFee,
        uint256 proveReward
    ) external onlyManager {
        _trackParticipant(winner);

        globalStats.totalBountyRewardsWei += winnerAmount;
        globalStats.totalPlatformFeesWei += platformFee;

        conceptStats[conceptKey].bountyRewardsWei += winnerAmount;

        userStats[winner].avaxEarnedWei += winnerAmount;
        userStats[winner].proveEarned += proveReward;
        userStats[winner].bountyWins += 1;
    }

    function _trackParticipant(address participant) internal {
        if (participant == address(0) || seenParticipant[participant]) return;
        seenParticipant[participant] = true;
        globalStats.totalParticipants += 1;
    }
}

