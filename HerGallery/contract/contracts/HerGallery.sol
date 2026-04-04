// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HerGallery {
    enum SubmissionStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    struct Exhibition {
        uint256 id;
        address curator;
        string title;
        string contentHash;
        string coverHash;
        string[] tags;
        uint256 createdAt;
        bool stakeWithdrawn;
        bool flagged;
        uint256 tipPool;
        uint256 submissionCount;
    }

    struct Submission {
        uint256 id;
        uint256 exhibitionId;
        address creator;
        string contentType;
        SubmissionStatus status;
        string contentHash;
        string title;
        string description;
        uint256 createdAt;
        uint256 recommendCount;
        uint256 witnessCount;
        bool flagged;
    }

    uint256 public constant CREATION_FEE = 0.001 ether;
    uint256 public constant MIN_SUBMISSIONS_FOR_STAKE_WITHDRAWAL = 10;

    address public immutable owner;
    uint256 public platformTipPool;

    Exhibition[] private exhibitions;
    Submission[] private submissions;

    mapping(uint256 => uint256[]) private exhibitionSubmissionIds;
    mapping(uint256 => mapping(address => bool)) public hasRecommended;
    mapping(uint256 => mapping(address => bool)) public hasWitnessed;
    mapping(address => bool) public hasSubmitted;
    mapping(address => string) public usernames;
    mapping(address => bool) public hasSetUsername;

    event ExhibitionCreated(uint256 indexed id, string title, address indexed curator);
    event SubmissionCreated(uint256 indexed id, uint256 indexed exhibitionId, address indexed creator);
    event SubmissionApproved(uint256 indexed submissionId, uint256 indexed exhibitionId);
    event SubmissionRejected(uint256 indexed submissionId, uint256 indexed exhibitionId);
    event Recommended(uint256 indexed submissionId, address indexed recommender, uint256 newCount);
    event Witnessed(uint256 indexed submissionId, address indexed witness, uint256 newCount);
    event StakeWithdrawn(uint256 indexed exhibitionId, address indexed curator, uint256 amount);
    event SubmissionFlagged(uint256 indexed submissionId, uint256 indexed exhibitionId);
    event ExhibitionFlagged(uint256 indexed exhibitionId);
    event TipReceived(address indexed sender, uint256 indexed exhibitionId, uint256 amount, bool isPlatformTip);
    event TipsWithdrawn(uint256 indexed exhibitionId, address indexed curator, uint256 amount);
    event FirstSubmission(address indexed user, uint256 submissionId);
    event RecommendMilestone(address indexed creator, uint256 submissionId, uint256 recommendCount);
    event UsernameSet(address indexed user, string username);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier exhibitionExists(uint256 exhibitionId) {
        require(exhibitionId < exhibitions.length, "Exhibition does not exist");
        _;
    }

    modifier submissionExists(uint256 submissionId) {
        require(submissionId < submissions.length, "Submission does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setUsername(string memory username) external {
        bytes memory usernameBytes = bytes(username);
        require(usernameBytes.length > 0 && usernameBytes.length <= 20, "Username must be 1-20 characters");
        require(!hasSetUsername[msg.sender], "Username already set");

        usernames[msg.sender] = username;
        hasSetUsername[msg.sender] = true;

        emit UsernameSet(msg.sender, username);
    }

    function createExhibition(
        string memory title,
        string memory contentHash,
        string memory coverHash,
        string[] memory tags
    ) external payable {
        require(bytes(title).length > 0 && bytes(title).length <= 50, "Invalid title length");
        require(bytes(contentHash).length > 0, "Content hash required");
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(tags.length <= 3, "Too many tags");

        uint256 exhibitionId = exhibitions.length;
        exhibitions.push();

        Exhibition storage exhibition = exhibitions[exhibitionId];
        exhibition.id = exhibitionId;
        exhibition.curator = msg.sender;
        exhibition.title = title;
        exhibition.contentHash = contentHash;
        exhibition.coverHash = coverHash;
        exhibition.createdAt = block.timestamp;

        for (uint256 i = 0; i < tags.length; i++) {
            exhibition.tags.push(tags[i]);
        }

        emit ExhibitionCreated(exhibitionId, title, msg.sender);
    }

    function getExhibition(uint256 exhibitionId) external view exhibitionExists(exhibitionId) returns (Exhibition memory) {
        return exhibitions[exhibitionId];
    }

    function getAllExhibitions() external view returns (Exhibition[] memory) {
        return exhibitions;
    }

    function submitToExhibition(
        uint256 exhibitionId,
        string memory contentType,
        string memory contentHash,
        string memory title,
        string memory description
    ) external exhibitionExists(exhibitionId) {
        Exhibition storage exhibition = exhibitions[exhibitionId];
        require(!exhibition.flagged, "Exhibition flagged");
        require(_isValidContentType(contentType), "Invalid content type");
        require(bytes(contentHash).length > 0, "Content hash required");
        require(bytes(title).length > 0 && bytes(title).length <= 50, "Invalid title length");

        uint256 submissionId = submissions.length;
        submissions.push(
            Submission({
                id: submissionId,
                exhibitionId: exhibitionId,
                creator: msg.sender,
                contentType: contentType,
                status: SubmissionStatus.PENDING,
                contentHash: contentHash,
                title: title,
                description: description,
                createdAt: block.timestamp,
                recommendCount: 0,
                witnessCount: 0,
                flagged: false
            })
        );

        exhibitionSubmissionIds[exhibitionId].push(submissionId);
        exhibition.submissionCount += 1;

        emit SubmissionCreated(submissionId, exhibitionId, msg.sender);

        if (!hasSubmitted[msg.sender]) {
            hasSubmitted[msg.sender] = true;
            emit FirstSubmission(msg.sender, submissionId);
        }
    }

    function approveSubmission(uint256 submissionId) external submissionExists(submissionId) {
        Submission storage submission = submissions[submissionId];
        Exhibition storage exhibition = exhibitions[submission.exhibitionId];

        require(msg.sender == exhibition.curator, "Only curator");
        require(!submission.flagged, "Submission flagged");
        require(submission.status == SubmissionStatus.PENDING, "Submission not pending");

        submission.status = SubmissionStatus.APPROVED;
        emit SubmissionApproved(submissionId, submission.exhibitionId);
    }

    function rejectSubmission(uint256 submissionId) external submissionExists(submissionId) {
        Submission storage submission = submissions[submissionId];
        Exhibition storage exhibition = exhibitions[submission.exhibitionId];

        require(msg.sender == exhibition.curator, "Only curator");
        require(submission.status == SubmissionStatus.PENDING, "Submission not pending");

        submission.status = SubmissionStatus.REJECTED;
        emit SubmissionRejected(submissionId, submission.exhibitionId);
    }

    function recommend(uint256 exhibitionId, uint256 submissionId)
        external
        exhibitionExists(exhibitionId)
        submissionExists(submissionId)
    {
        Submission storage submission = submissions[submissionId];
        require(submission.exhibitionId == exhibitionId, "Submission mismatch");
        require(!_isSubmissionHidden(submissionId), "Submission unavailable");
        require(!hasRecommended[submissionId][msg.sender], "Already recommended");

        hasRecommended[submissionId][msg.sender] = true;
        submission.recommendCount += 1;

        emit Recommended(submissionId, msg.sender, submission.recommendCount);

        if (submission.recommendCount % 10 == 0) {
            emit RecommendMilestone(submission.creator, submissionId, submission.recommendCount);
        }
    }

    function witness(uint256 submissionId) external submissionExists(submissionId) {
        Submission storage submission = submissions[submissionId];
        require(!_isSubmissionHidden(submissionId), "Submission unavailable");
        require(!hasWitnessed[submissionId][msg.sender], "Already witnessed");

        hasWitnessed[submissionId][msg.sender] = true;
        submission.witnessCount += 1;

        emit Witnessed(submissionId, msg.sender, submission.witnessCount);
    }

    function tipPlatform() external payable {
        require(msg.value > 0, "Tip amount required");
        platformTipPool += msg.value;

        emit TipReceived(msg.sender, type(uint256).max, msg.value, true);
    }

    function tipExhibition(uint256 exhibitionId) external payable exhibitionExists(exhibitionId) {
        require(msg.value > 0, "Tip amount required");

        Exhibition storage exhibition = exhibitions[exhibitionId];
        require(!exhibition.flagged, "Exhibition flagged");

        exhibition.tipPool += msg.value;
        emit TipReceived(msg.sender, exhibitionId, msg.value, false);
    }

    function withdrawTips(uint256 exhibitionId) external exhibitionExists(exhibitionId) {
        Exhibition storage exhibition = exhibitions[exhibitionId];
        require(msg.sender == exhibition.curator, "Only curator");

        uint256 amount = exhibition.tipPool;
        require(amount > 0, "No tips available");

        exhibition.tipPool = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Tip withdrawal failed");

        emit TipsWithdrawn(exhibitionId, msg.sender, amount);
    }

    function withdrawStake(uint256 exhibitionId) external exhibitionExists(exhibitionId) {
        Exhibition storage exhibition = exhibitions[exhibitionId];
        require(msg.sender == exhibition.curator, "Only curator");
        require(!exhibition.flagged, "Exhibition flagged");
        require(!exhibition.stakeWithdrawn, "Stake already withdrawn");
        require(
            exhibition.submissionCount >= MIN_SUBMISSIONS_FOR_STAKE_WITHDRAWAL,
            "Not enough submissions"
        );

        exhibition.stakeWithdrawn = true;
        (bool success, ) = payable(msg.sender).call{value: CREATION_FEE}("");
        require(success, "Stake withdrawal failed");

        emit StakeWithdrawn(exhibitionId, msg.sender, CREATION_FEE);
    }

    function flagSubmission(uint256 submissionId) external submissionExists(submissionId) {
        Submission storage submission = submissions[submissionId];
        Exhibition storage exhibition = exhibitions[submission.exhibitionId];

        require(msg.sender == exhibition.curator, "Only curator");
        require(!submission.flagged, "Submission already flagged");

        submission.flagged = true;
        emit SubmissionFlagged(submissionId, submission.exhibitionId);
    }

    function flagExhibition(uint256 exhibitionId) external onlyOwner exhibitionExists(exhibitionId) {
        Exhibition storage exhibition = exhibitions[exhibitionId];
        require(!exhibition.flagged, "Exhibition already flagged");

        exhibition.flagged = true;
        emit ExhibitionFlagged(exhibitionId);
    }

    function getSubmission(uint256 submissionId) external view submissionExists(submissionId) returns (Submission memory) {
        return submissions[submissionId];
    }

    function getSubmissions(uint256 exhibitionId)
        external
        view
        exhibitionExists(exhibitionId)
        returns (Submission[] memory)
    {
        uint256[] storage submissionIds = exhibitionSubmissionIds[exhibitionId];
        Submission[] memory result = new Submission[](submissionIds.length);

        for (uint256 i = 0; i < submissionIds.length; i++) {
            result[i] = submissions[submissionIds[i]];
        }

        return result;
    }

    function getPendingSubmissions(uint256 exhibitionId)
        external
        view
        exhibitionExists(exhibitionId)
        returns (Submission[] memory)
    {
        uint256[] storage submissionIds = exhibitionSubmissionIds[exhibitionId];
        uint256 pendingCount = 0;

        for (uint256 i = 0; i < submissionIds.length; i++) {
            if (submissions[submissionIds[i]].status == SubmissionStatus.PENDING) {
                pendingCount += 1;
            }
        }

        Submission[] memory pending = new Submission[](pendingCount);
        uint256 cursor = 0;
        for (uint256 i = 0; i < submissionIds.length; i++) {
            Submission storage submission = submissions[submissionIds[i]];
            if (submission.status == SubmissionStatus.PENDING) {
                pending[cursor] = submission;
                cursor += 1;
            }
        }

        return pending;
    }

    function getSubmissionCount(uint256 exhibitionId) external view exhibitionExists(exhibitionId) returns (uint256) {
        return exhibitionSubmissionIds[exhibitionId].length;
    }

    function getExhibitionCount() external view returns (uint256) {
        return exhibitions.length;
    }

    function getTotalSubmissionCount() external view returns (uint256) {
        return submissions.length;
    }

    function getRecommendedStatus(uint256 exhibitionId, address user)
        external
        view
        exhibitionExists(exhibitionId)
        returns (bool[] memory)
    {
        uint256[] storage submissionIds = exhibitionSubmissionIds[exhibitionId];
        bool[] memory statuses = new bool[](submissionIds.length);

        for (uint256 i = 0; i < submissionIds.length; i++) {
            statuses[i] = hasRecommended[submissionIds[i]][user];
        }

        return statuses;
    }

    function _isValidContentType(string memory contentType) private pure returns (bool) {
        bytes32 contentTypeHash = keccak256(bytes(contentType));
        return
            contentTypeHash == keccak256(bytes("evidence")) ||
            contentTypeHash == keccak256(bytes("creation"));
    }

    function _isSubmissionHidden(uint256 submissionId) private view returns (bool) {
        Submission storage submission = submissions[submissionId];
        Exhibition storage exhibition = exhibitions[submission.exhibitionId];

        return
            exhibition.flagged ||
            submission.flagged ||
            submission.status != SubmissionStatus.APPROVED;
    }
}
