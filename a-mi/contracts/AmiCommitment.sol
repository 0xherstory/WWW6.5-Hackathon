// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AmiCommitment {
    struct Commitment {
        uint256 id;
        address creator;
        string title;
        uint256 durationDays;
        string reminder;
        uint256 createdAt;
        bool active;
    }

    struct CheckIn {
        uint256 id;
        uint256 commitmentId;
        address creator;
        string content;
        string mood;
        string proofURI;
        uint256 createdAt;
    }

    uint256 public nextCommitmentId;
    uint256 public nextCheckInId;

    mapping(uint256 => Commitment) private commitments;
    mapping(address => uint256[]) private ownerCommitmentIds;
    mapping(uint256 => CheckIn) private checkIns;
    mapping(uint256 => uint256[]) private commitmentCheckInIds;

    event CommitmentCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        uint256 durationDays,
        uint256 createdAt
    );

    event CheckInCreated(
        uint256 indexed id,
        uint256 indexed commitmentId,
        address indexed creator,
        string mood,
        uint256 createdAt
    );

    function createCommitment(
        string memory title,
        uint256 durationDays,
        string memory reminder
    ) external returns (uint256 commitmentId) {
        require(bytes(title).length > 0, "Title required");
        require(durationDays > 0, "Duration must be > 0");

        commitmentId = nextCommitmentId;
        nextCommitmentId += 1;

        commitments[commitmentId] = Commitment({
            id: commitmentId,
            creator: msg.sender,
            title: title,
            durationDays: durationDays,
            reminder: reminder,
            createdAt: block.timestamp,
            active: true
        });

        ownerCommitmentIds[msg.sender].push(commitmentId);

        emit CommitmentCreated(
            commitmentId,
            msg.sender,
            title,
            durationDays,
            block.timestamp
        );
    }

    function createCheckIn(
        uint256 commitmentId,
        string memory content,
        string memory mood,
        string memory proofURI
    ) external returns (uint256 checkInId) {
        require(commitmentId < nextCommitmentId, "Commitment not found");

        Commitment memory commitment = commitments[commitmentId];

        require(commitment.creator != address(0), "Commitment not found");
        require(msg.sender == commitment.creator, "Not commitment creator");
        require(commitment.active, "Commitment inactive");
        require(bytes(content).length > 0, "Content required");
        require(bytes(mood).length > 0, "Mood required");

        checkInId = nextCheckInId;
        nextCheckInId += 1;

        checkIns[checkInId] = CheckIn({
            id: checkInId,
            commitmentId: commitmentId,
            creator: msg.sender,
            content: content,
            mood: mood,
            proofURI: proofURI,
            createdAt: block.timestamp
        });

        commitmentCheckInIds[commitmentId].push(checkInId);

        emit CheckInCreated(
            checkInId,
            commitmentId,
            msg.sender,
            mood,
            block.timestamp
        );
    }

    function getCommitment(uint256 commitmentId) external view returns (Commitment memory) {
        Commitment memory commitment = commitments[commitmentId];
        require(commitment.creator != address(0), "Commitment not found");
        return commitment;
    }

    function getCheckIn(uint256 checkInId) external view returns (CheckIn memory) {
        CheckIn memory checkIn = checkIns[checkInId];
        require(checkIn.creator != address(0), "Check-in not found");
        return checkIn;
    }

    function getMyCommitments() external view returns (uint256[] memory) {
        return ownerCommitmentIds[msg.sender];
    }

    function getCommitmentsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerCommitmentIds[owner];
    }

    function getCheckInIdsByCommitment(uint256 commitmentId) external view returns (uint256[] memory) {
        require(commitmentId < nextCommitmentId, "Commitment not found");
        return commitmentCheckInIds[commitmentId];
    }

    function getCheckInCount(uint256 commitmentId) public view returns (uint256) {
        require(commitmentId < nextCommitmentId, "Commitment not found");
        return commitmentCheckInIds[commitmentId].length;
    }

    function isCommitmentCompleted(uint256 commitmentId) external view returns (bool) {
        require(commitmentId < nextCommitmentId, "Commitment not found");
        return getCheckInCount(commitmentId) >= commitments[commitmentId].durationDays;
    }
}
