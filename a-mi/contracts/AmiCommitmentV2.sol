// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAmiCommitmentV1 {
    struct Commitment {
        uint256 id;
        address creator;
        string title;
        uint256 durationDays;
        string reminder;
        uint256 createdAt;
        bool active;
    }

    function getCommitment(uint256 commitmentId) external view returns (Commitment memory);
}

contract AmiCommitmentV2 {
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

    struct WitnessRecord {
        uint256 id;
        uint256 commitmentId;
        address witness;
        address commitmentOwner;
        uint256 createdAt;
    }

    uint256 public nextCommitmentId;
    uint256 public nextCheckInId;
    uint256 public witnessRecordCount;
    IAmiCommitmentV1 public immutable witnessCommitmentSource;

    mapping(uint256 => Commitment) private commitments;
    mapping(address => uint256[]) private ownerCommitmentIds;
    mapping(uint256 => CheckIn) private checkIns;
    mapping(uint256 => uint256[]) private commitmentCheckInIds;

    // Witness data is kept separate so the original commitment/check-in flow stays unchanged.
    // For witness validation, V1 commitment data is the source of truth.
    // The legacy V2 commitment storage below is no longer used as the witness existence/owner check.
    mapping(uint256 => address[]) private _commitmentWitnesses;
    mapping(uint256 => mapping(address => bool)) public hasWitnessed;
    mapping(uint256 => WitnessRecord) public witnessRecords;
    mapping(address => uint256[]) private _witnessRecordsByWitness;
    mapping(address => uint256[]) private _witnessRecordsByOwner;

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

    event WitnessCreated(
        uint256 indexed witnessRecordId,
        uint256 indexed commitmentId,
        address indexed witness,
        address commitmentOwner,
        uint256 createdAt
    );

    constructor(address v1CommitmentAddress) {
        require(v1CommitmentAddress != address(0), "V1 commitment address required");
        witnessCommitmentSource = IAmiCommitmentV1(v1CommitmentAddress);
    }

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

    function createWitness(uint256 commitmentId) external {
        IAmiCommitmentV1.Commitment memory commitment = _getWitnessCommitment(commitmentId);
        require(commitment.active, "Commitment inactive");
        require(msg.sender != commitment.creator, "Cannot witness own commitment");
        require(!hasWitnessed[commitmentId][msg.sender], "Already witnessed");

        uint256 witnessRecordId = witnessRecordCount;
        witnessRecordCount += 1;

        _commitmentWitnesses[commitmentId].push(msg.sender);
        hasWitnessed[commitmentId][msg.sender] = true;

        witnessRecords[witnessRecordId] = WitnessRecord({
            id: witnessRecordId,
            commitmentId: commitmentId,
            witness: msg.sender,
            commitmentOwner: commitment.creator,
            createdAt: block.timestamp
        });

        _witnessRecordsByWitness[msg.sender].push(witnessRecordId);
        _witnessRecordsByOwner[commitment.creator].push(witnessRecordId);

        emit WitnessCreated(
            witnessRecordId,
            commitmentId,
            msg.sender,
            commitment.creator,
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

    function getWitnessRecord(uint256 witnessRecordId) external view returns (WitnessRecord memory) {
        WitnessRecord memory witnessRecord = witnessRecords[witnessRecordId];
        require(witnessRecord.witness != address(0), "Witness record not found");
        return witnessRecord;
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

    function getWitnessCountByCommitment(uint256 commitmentId) external view returns (uint256) {
        return _commitmentWitnesses[commitmentId].length;
    }

    function getWitnessesByCommitment(uint256 commitmentId) external view returns (address[] memory) {
        return _commitmentWitnesses[commitmentId];
    }

    function getWitnessRecordIdsByWitness(address witness) external view returns (uint256[] memory) {
        return _witnessRecordsByWitness[witness];
    }

    function getWitnessRecordIdsByOwner(address owner) external view returns (uint256[] memory) {
        return _witnessRecordsByOwner[owner];
    }

    function isCommitmentCompleted(uint256 commitmentId) external view returns (bool) {
        require(commitmentId < nextCommitmentId, "Commitment not found");
        return getCheckInCount(commitmentId) >= commitments[commitmentId].durationDays;
    }

    function _getWitnessCommitment(uint256 commitmentId)
        internal
        view
        returns (IAmiCommitmentV1.Commitment memory commitment)
    {
        try witnessCommitmentSource.getCommitment(commitmentId) returns (
            IAmiCommitmentV1.Commitment memory fetchedCommitment
        ) {
            return fetchedCommitment;
        } catch {
            revert("Commitment not found");
        }
    }
}
