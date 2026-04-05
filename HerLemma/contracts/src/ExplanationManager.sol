// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Owned.sol";
import "./ProveToken.sol";
import "./HerLemmaCredential.sol";
import "./STEMIndex.sol";

error InvalidFee();
error InvalidDuration();
error ExplanationNotFound();
error BountyNotFound();
error AlreadyVoted();
error CannotSelfVote();
error EmptyValue();
error BountyClosed();
error BountyStillActive();
error BountyAlreadyFinalized();
error InvalidBountyResponse();
error NothingToWithdraw();
error Reentrancy();

contract ExplanationManager is Owned {
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint64 public constant MIN_BOUNTY_DURATION = 1 hours;
    uint64 public constant MAX_BOUNTY_DURATION = 30 days;

    uint256 public constant AUTHOR_PROVE_PER_UNDERSTOOD = 10 ether;
    uint256 public constant REVIEWER_PROVE_PER_UNDERSTOOD = 2 ether;
    uint256 public constant AUTHOR_PROVE_PER_TIP = 5 ether;
    uint256 public constant BOUNTY_WINNER_PROVE = 100 ether;

    uint256 public constant BADGE_FIRST_VOICE = 1;
    uint256 public constant BADGE_FIRST_EARNING = 2;
    uint256 public constant BADGE_MATH_TRANSLATOR = 3;
    uint256 public constant BADGE_TRUSTED_REVIEWER = 4;
    uint256 public constant BADGE_VIRAL_EXPLAINER = 5;

    struct Explanation {
        uint256 id;
        bytes32 conceptKey;
        address author;
        uint256 bountyId;
        string style;
        string excerpt;
        string contentURI;
        uint64 createdAt;
        uint32 understoodCount;
        uint128 totalTipsWei;
        bool hasFirstValidation;
    }

    struct Bounty {
        uint256 id;
        bytes32 conceptKey;
        address creator;
        string promptExcerpt;
        string promptURI;
        uint96 rewardWei;
        uint64 createdAt;
        uint64 deadline;
        bool settled;
        bool refunded;
        uint256 winningExplanationId;
    }

    ProveToken public proveToken;
    HerLemmaCredential public credential;
    STEMIndex public stemIndex;
    address public platformTreasury;

    uint96 public tipPlatformFeeBps = 500;
    uint96 public bountyPlatformFeeBps = 1000;

    uint256 public nextExplanationId = 1;
    uint256 public nextBountyId = 1;

    bool private _entered;

    mapping(uint256 => Explanation) private _explanations;
    mapping(uint256 => Bounty) private _bounties;

    mapping(bytes32 => uint256[]) private _conceptExplanationIds;
    mapping(address => uint256[]) private _authorExplanationIds;
    mapping(uint256 => uint256[]) private _bountyResponseIds;

    mapping(uint256 => mapping(address => bool)) public hasVotedExplanation;
    mapping(uint256 => mapping(address => bool)) public hasVotedBounty;
    mapping(uint256 => mapping(uint256 => uint256)) public bountyResponseVotes;

    mapping(address => uint256) public totalEarningsWei;
    mapping(address => uint256) public validatedExplanationCount;
    mapping(address => uint256) public reviewerValidationCount;
    mapping(address => uint256) public pendingWithdrawals;

    event ExplanationCreated(
        uint256 indexed explanationId,
        bytes32 indexed conceptKey,
        address indexed author,
        uint256 bountyId,
        string style,
        string contentURI
    );
    event ExplanationVoted(uint256 indexed explanationId, address indexed voter, uint256 newCount);
    event ExplanationTipped(uint256 indexed explanationId, address indexed tipper, uint256 amount, uint256 authorAmount);
    event BountyCreated(uint256 indexed bountyId, bytes32 indexed conceptKey, address indexed creator, uint256 rewardWei, uint64 deadline);
    event BountyResponseSubmitted(uint256 indexed bountyId, uint256 indexed explanationId, address indexed author);
    event BountyResponseVoted(uint256 indexed bountyId, uint256 indexed explanationId, address indexed voter, uint256 newCount);
    event BountySettled(uint256 indexed bountyId, uint256 indexed winningExplanationId, address indexed winner, uint256 payoutWei);
    event BountyRefunded(uint256 indexed bountyId, address indexed creator, uint256 amount);
    event Withdrawal(address indexed account, uint256 amount);
    event TreasuryUpdated(address indexed treasury);
    event FeeUpdated(uint96 tipFeeBps, uint96 bountyFeeBps);

    constructor(
        address initialOwner,
        address treasury_,
        ProveToken proveToken_,
        HerLemmaCredential credential_,
        STEMIndex stemIndex_
    ) Owned(initialOwner) {
        if (
            treasury_ == address(0) ||
            address(proveToken_) == address(0) ||
            address(credential_) == address(0) ||
            address(stemIndex_) == address(0)
        ) revert ZeroAddress();

        platformTreasury = treasury_;
        proveToken = proveToken_;
        credential = credential_;
        stemIndex = stemIndex_;
    }

    modifier nonReentrant() {
        if (_entered) revert Reentrancy();
        _entered = true;
        _;
        _entered = false;
    }

    function setPlatformTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        platformTreasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setFeeBps(uint96 tipFeeBps_, uint96 bountyFeeBps_) external onlyOwner {
        if (tipFeeBps_ > 1_500 || bountyFeeBps_ > 2_000) revert InvalidFee();
        tipPlatformFeeBps = tipFeeBps_;
        bountyPlatformFeeBps = bountyFeeBps_;
        emit FeeUpdated(tipFeeBps_, bountyFeeBps_);
    }

    function createExplanation(
        bytes32 conceptKey,
        string calldata style,
        string calldata excerpt,
        string calldata contentURI
    ) external returns (uint256 explanationId) {
        explanationId = _createExplanation(conceptKey, 0, style, excerpt, contentURI, msg.sender);
    }

    function createBounty(
        bytes32 conceptKey,
        string calldata promptExcerpt,
        string calldata promptURI,
        uint64 duration
    ) external payable returns (uint256 bountyId) {
        if (msg.value == 0) revert EmptyValue();
        if (duration < MIN_BOUNTY_DURATION || duration > MAX_BOUNTY_DURATION) revert InvalidDuration();

        bountyId = nextBountyId++;
        Bounty storage bounty = _bounties[bountyId];
        bounty.id = bountyId;
        bounty.conceptKey = conceptKey;
        bounty.creator = msg.sender;
        bounty.promptExcerpt = promptExcerpt;
        bounty.promptURI = promptURI;
        bounty.rewardWei = uint96(msg.value);
        bounty.createdAt = uint64(block.timestamp);
        bounty.deadline = uint64(block.timestamp + duration);

        stemIndex.recordBountyCreated(conceptKey, msg.sender);

        emit BountyCreated(bountyId, conceptKey, msg.sender, msg.value, bounty.deadline);
    }

    function submitBountyResponse(
        uint256 bountyId,
        string calldata style,
        string calldata excerpt,
        string calldata contentURI
    ) external returns (uint256 explanationId) {
        Bounty storage bounty = _requireBounty(bountyId);
        if (block.timestamp >= bounty.deadline || bounty.settled || bounty.refunded) revert BountyClosed();
        if (bounty.creator == msg.sender) revert CannotSelfVote();

        explanationId = _createExplanation(bounty.conceptKey, bountyId, style, excerpt, contentURI, msg.sender);
        _bountyResponseIds[bountyId].push(explanationId);

        emit BountyResponseSubmitted(bountyId, explanationId, msg.sender);
    }

    function voteUnderstood(uint256 explanationId) external {
        Explanation storage explanation = _requireExplanation(explanationId);
        if (explanation.author == msg.sender) revert CannotSelfVote();
        if (hasVotedExplanation[explanationId][msg.sender]) revert AlreadyVoted();

        hasVotedExplanation[explanationId][msg.sender] = true;
        explanation.understoodCount += 1;

        reviewerValidationCount[msg.sender] += 1;

        proveToken.mint(explanation.author, AUTHOR_PROVE_PER_UNDERSTOOD);
        proveToken.mint(msg.sender, REVIEWER_PROVE_PER_UNDERSTOOD);

        bool firstValidation = false;
        if (!explanation.hasFirstValidation) {
            explanation.hasFirstValidation = true;
            validatedExplanationCount[explanation.author] += 1;
            firstValidation = true;

            if (validatedExplanationCount[explanation.author] >= 10) {
                _awardBadgeIfMissing(explanation.author, BADGE_MATH_TRANSLATOR);
            }
        }

        if (explanation.understoodCount >= 100) {
            _awardBadgeIfMissing(explanation.author, BADGE_VIRAL_EXPLAINER);
        }

        if (reviewerValidationCount[msg.sender] >= 50) {
            _awardBadgeIfMissing(msg.sender, BADGE_TRUSTED_REVIEWER);
        }

        stemIndex.recordUnderstoodVote(
            explanation.conceptKey,
            explanation.author,
            msg.sender,
            AUTHOR_PROVE_PER_UNDERSTOOD,
            REVIEWER_PROVE_PER_UNDERSTOOD,
            firstValidation
        );

        emit ExplanationVoted(explanationId, msg.sender, explanation.understoodCount);
    }

    function tipExplanation(uint256 explanationId) external payable {
        if (msg.value == 0) revert EmptyValue();
        Explanation storage explanation = _requireExplanation(explanationId);

        uint256 platformFee = (msg.value * tipPlatformFeeBps) / BPS_DENOMINATOR;
        uint256 authorAmount = msg.value - platformFee;

        explanation.totalTipsWei += uint128(msg.value);
        pendingWithdrawals[explanation.author] += authorAmount;
        pendingWithdrawals[platformTreasury] += platformFee;

        totalEarningsWei[explanation.author] += authorAmount;
        proveToken.mint(explanation.author, AUTHOR_PROVE_PER_TIP);

        if (totalEarningsWei[explanation.author] == authorAmount) {
            _awardBadgeIfMissing(explanation.author, BADGE_FIRST_EARNING);
        }

        stemIndex.recordTip(
            explanation.conceptKey,
            explanation.author,
            msg.sender,
            authorAmount,
            platformFee,
            AUTHOR_PROVE_PER_TIP
        );

        emit ExplanationTipped(explanationId, msg.sender, msg.value, authorAmount);
    }

    function voteBountyResponse(uint256 bountyId, uint256 explanationId) external {
        Bounty storage bounty = _requireBounty(bountyId);
        if (block.timestamp >= bounty.deadline || bounty.settled || bounty.refunded) revert BountyClosed();
        if (hasVotedBounty[bountyId][msg.sender]) revert AlreadyVoted();

        Explanation storage explanation = _requireExplanation(explanationId);
        if (explanation.bountyId != bountyId) revert InvalidBountyResponse();
        if (explanation.author == msg.sender) revert CannotSelfVote();

        hasVotedBounty[bountyId][msg.sender] = true;
        bountyResponseVotes[bountyId][explanationId] += 1;
        reviewerValidationCount[msg.sender] += 1;

        if (reviewerValidationCount[msg.sender] >= 50) {
            _awardBadgeIfMissing(msg.sender, BADGE_TRUSTED_REVIEWER);
        }

        emit BountyResponseVoted(bountyId, explanationId, msg.sender, bountyResponseVotes[bountyId][explanationId]);
    }

    function settleBounty(uint256 bountyId) external {
        Bounty storage bounty = _requireBounty(bountyId);
        if (bounty.settled || bounty.refunded) revert BountyAlreadyFinalized();
        if (block.timestamp < bounty.deadline) revert BountyStillActive();

        uint256[] storage responses = _bountyResponseIds[bountyId];
        if (responses.length == 0) {
            bounty.refunded = true;
            pendingWithdrawals[bounty.creator] += bounty.rewardWei;
            emit BountyRefunded(bountyId, bounty.creator, bounty.rewardWei);
            return;
        }

        uint256 winningExplanationId = responses[0];
        uint256 winningVotes = bountyResponseVotes[bountyId][winningExplanationId];

        for (uint256 i = 1; i < responses.length; i++) {
            uint256 candidateId = responses[i];
            uint256 candidateVotes = bountyResponseVotes[bountyId][candidateId];
            if (candidateVotes > winningVotes) {
                winningVotes = candidateVotes;
                winningExplanationId = candidateId;
            }
        }

        Explanation storage winnerExplanation = _requireExplanation(winningExplanationId);

        uint256 platformFee = (bounty.rewardWei * bountyPlatformFeeBps) / BPS_DENOMINATOR;
        uint256 winnerAmount = bounty.rewardWei - platformFee;

        bounty.settled = true;
        bounty.winningExplanationId = winningExplanationId;

        pendingWithdrawals[winnerExplanation.author] += winnerAmount;
        pendingWithdrawals[platformTreasury] += platformFee;
        totalEarningsWei[winnerExplanation.author] += winnerAmount;

        proveToken.mint(winnerExplanation.author, BOUNTY_WINNER_PROVE);

        if (totalEarningsWei[winnerExplanation.author] == winnerAmount) {
            _awardBadgeIfMissing(winnerExplanation.author, BADGE_FIRST_EARNING);
        }

        stemIndex.recordBountySettled(
            bounty.conceptKey,
            winnerExplanation.author,
            winnerAmount,
            platformFee,
            BOUNTY_WINNER_PROVE
        );

        emit BountySettled(bountyId, winningExplanationId, winnerExplanation.author, winnerAmount);
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdrawals[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "withdraw failed");

        emit Withdrawal(msg.sender, amount);
    }

    function mintManualBadge(address account, uint256 badgeId) external onlyOwner {
        _awardBadgeIfMissing(account, badgeId);
    }

    function getExplanation(uint256 explanationId) external view returns (Explanation memory) {
        Explanation storage explanation = _requireExplanation(explanationId);
        return explanation;
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        Bounty storage bounty = _requireBounty(bountyId);
        return bounty;
    }

    function getConceptExplanationIds(bytes32 conceptKey) external view returns (uint256[] memory) {
        return _conceptExplanationIds[conceptKey];
    }

    function getAuthorExplanationIds(address author) external view returns (uint256[] memory) {
        return _authorExplanationIds[author];
    }

    function getBountyResponseIds(uint256 bountyId) external view returns (uint256[] memory) {
        return _bountyResponseIds[bountyId];
    }

    function _createExplanation(
        bytes32 conceptKey,
        uint256 bountyId,
        string calldata style,
        string calldata excerpt,
        string calldata contentURI,
        address author
    ) internal returns (uint256 explanationId) {
        explanationId = nextExplanationId++;

        Explanation storage explanation = _explanations[explanationId];
        explanation.id = explanationId;
        explanation.conceptKey = conceptKey;
        explanation.author = author;
        explanation.bountyId = bountyId;
        explanation.style = style;
        explanation.excerpt = excerpt;
        explanation.contentURI = contentURI;
        explanation.createdAt = uint64(block.timestamp);

        _conceptExplanationIds[conceptKey].push(explanationId);
        _authorExplanationIds[author].push(explanationId);
        stemIndex.recordExplanation(conceptKey, author);

        if (_authorExplanationIds[author].length == 1) {
            _awardBadgeIfMissing(author, BADGE_FIRST_VOICE);
        }

        emit ExplanationCreated(explanationId, conceptKey, author, bountyId, style, contentURI);
    }

    function _awardBadgeIfMissing(address account, uint256 badgeId) internal {
        if (!credential.hasBadge(account, badgeId)) {
            credential.mintBadge(account, badgeId);
        }
    }

    function _requireExplanation(uint256 explanationId) internal view returns (Explanation storage explanation) {
        explanation = _explanations[explanationId];
        if (explanation.author == address(0)) revert ExplanationNotFound();
    }

    function _requireBounty(uint256 bountyId) internal view returns (Bounty storage bounty) {
        bounty = _bounties[bountyId];
        if (bounty.creator == address(0)) revert BountyNotFound();
    }
}
