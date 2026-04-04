// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGirlsVaultSBT {
    function mint(address donor, address project, string calldata projectName, uint256 amount, uint8 tag) external returns (uint256);
}

contract GirlsVaultProject {

    // ── 自定义错误 ────────────────────────────────────────
    error AmountMustBePositive();
    error ExceedsTargetAmount();
    error EmergencyAlreadyApproved();
    error NotAValidator();
    error NotOwner();
    error InvalidMilestone();
    error MilestoneNotPending();
    error AlreadySubmittedProof();
    error FundingInsufficient();
    error NotVerified();
    error InsufficientBalance();
    error TransferFailed();
    error TooEarlyForEmergency();
    error NotADonor();
    error AlreadyVoted();
    error EmergencyNotApproved();
    error AlreadyClaimed();
    error NothingToClaim();
    error NoValidSignatures();
    error ReentrantCall();
    // 验证人质押相关
    error ValidatorNotStaked();
    error AlreadyStaked();
    error InsufficientStake();
    error ProjectStillActive();
    // 挑战相关
    error ChallengeWindowClosed();
    error AlreadyChallenged();
    error NoChallengeExists();
    error VoteWindowClosed();
    error VoteWindowNotOver();
    error AlreadyVotedOnChallenge();
    error ChallengeAlreadyResolved();
    error InsufficientChallengeBond();
    error ChallengeUpheld();
    error ReleaseTooEarly();
    error VoteWindowActive();
    error ChallengerCannotVote();

    // ── ReentrancyGuard ───────────────────────────────────
    uint256 private _locked;
    modifier nonReentrant() {
        if (_locked != 0) revert ReentrantCall();
        _locked = 1;
        _;
        _locked = 0;
    }

    // ── EIP-712 ───────────────────────────────────────────
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 private constant PROOF_TYPEHASH = keccak256(
        "ProofApproval(uint256 milestoneId,bytes32 proofHash,string proofUri)"
    );

    enum Tag { EDUCATION, FOOD, MEDICAL, SUPPLIES, TRANSPORT }
    enum MilestoneStatus { PENDING, VERIFIED, RELEASED }

    struct ProofDetail {
        address validator;
        string  metadataUri;
        uint256 submittedAt;
    }

    struct Milestone {
        string description;
        uint256 releasePercent;
        MilestoneStatus status;
        uint256 proofCount;
        mapping(address => bool)    hasProved;
        mapping(address => bytes32) proofs;
        ProofDetail[] proofDetails;
    }

    // ── 验证人质押 ────────────────────────────────────────
    // 创建项目时设定，每个验证人必须质押此金额才能提交证明
    uint256 public validatorStakeRequired;

    mapping(address => uint256) public validatorStake;
    mapping(address => bool)    public validatorStaked;

    // 质押保障池（汇集被没收的质押和失败的挑战押金）
    uint256 public stakePool;

    // ── 里程碑挑战 ────────────────────────────────────────
    uint256 public constant CHALLENGE_WINDOW = 3 days;
    uint256 public constant VOTE_WINDOW      = 7 days;
    uint256 public constant CHALLENGE_BOND   = 0.00001 ether;

    struct ChallengeInfo {
        address challenger;
        string  evidenceCID;    // IPFS 反证内容
        uint256 challengedAt;
        uint256 forVotes;       // 支持挑战（认为造假）
        uint256 againstVotes;   // 反对挑战（认为合法）
        bool    resolved;
        bool    upheld;         // 挑战是否成立
    }

    // milestoneId => 挑战信息（每个里程碑最多一次挑战）
    mapping(uint256 => ChallengeInfo) public challenges;
    mapping(uint256 => uint256)       public milestoneVerifiedAt; // 验证通过时间戳，用于计算争议窗口
    // 防止同一捐款人对同一里程碑重复投票
    mapping(uint256 => mapping(address => bool)) public hasVotedOnChallenge;

    // ── 项目基础状态 ──────────────────────────────────────
    string  public name;
    string  public description;
    address public beneficiary;
    address public projectOwner;
    uint256 public requiredSignatures;
    uint256 public targetAmount;
    uint256 public totalDonated;
    uint256 public totalReleased;

    uint256 public lastActivityAt;
    mapping(address => uint256) public donorBalance;
    address[] public donors;          // 捐款人列表，用于举报成立时自动退款
    mapping(address => bool) private _isDonor;
    mapping(address => bool)    public hasVotedEmergency;
    uint256 public emergencyVoteAmount;
    bool    public emergencyApproved;
    bool    public autoRefunded;      // 举报成立后已自动退款
    mapping(address => bool) public hasClaimedRefund;

    uint256 public constant EMERGENCY_THRESHOLD = 180 days;

    mapping(address => bool) public isValidator;
    mapping(Tag => uint256)  public tagBalances;
    Milestone[] public milestones;

    IGirlsVaultSBT public sbt;

    // ── 事件 ──────────────────────────────────────────────
    event Donated(address indexed donor, uint256 amount, Tag tag);
    event MilestoneAdded(uint256 indexed milestoneId, string description, uint256 releasePercent);
    event ProofSubmitted(uint256 indexed milestoneId, address indexed validator, bytes32 proofHash, string proofUri);
    event MilestoneVerified(uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed milestoneId, address beneficiary, uint256 amount);
    event EmergencyVoted(address indexed donor, uint256 amount, uint256 totalVotes);
    event EmergencyRefundApproved();
    // 质押相关事件
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorStakeWithdrawn(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 slashAmount);
    // 挑战相关事件
    event MilestoneChallenged(uint256 indexed milestoneId, address indexed challenger, string evidenceCID);
    event ChallengeVoted(uint256 indexed milestoneId, address indexed voter, bool support, uint256 weight);
    event ChallengeResolved(uint256 indexed milestoneId, bool upheld, uint256 totalSlashed);

    // ── Modifier ──────────────────────────────────────────
    modifier onlyValidator() {
        if (!isValidator[msg.sender]) revert NotAValidator();
        _;
    }

    modifier onlyStakedValidator() {
        if (!isValidator[msg.sender])    revert NotAValidator();
        if (!validatorStaked[msg.sender]) revert ValidatorNotStaked();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != projectOwner) revert NotOwner();
        _;
    }

    // ── 构造函数 ──────────────────────────────────────────
    constructor(
        string memory _name,
        string memory _description,
        address _beneficiary,
        address[] memory _validators,
        uint256 _requiredSignatures,
        uint256 _targetAmount,
        address _projectOwner,
        address _sbt,
        uint256 _validatorStakeRequired
    ) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_validators.length >= _requiredSignatures, "Not enough validators");
        require(_requiredSignatures > 0, "Required signatures must > 0");
        require(_targetAmount > 0, "Target amount must > 0");

        name = _name;
        description = _description;
        beneficiary = _beneficiary;
        requiredSignatures = _requiredSignatures;
        targetAmount = _targetAmount;
        projectOwner = _projectOwner;
        sbt = IGirlsVaultSBT(_sbt);
        lastActivityAt = block.timestamp;
        validatorStakeRequired = _validatorStakeRequired;

        for (uint256 i = 0; i < _validators.length; i++) {
            isValidator[_validators[i]] = true;
        }

        DOMAIN_SEPARATOR = keccak256(abi.encode(
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
            keccak256(bytes(_name)),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }

    // ── 验证人质押 ────────────────────────────────────────

    /// @notice 验证人调用此函数完成质押，质押后才能提交里程碑证明
    function stakeAsValidator() external payable onlyValidator nonReentrant {
        if (validatorStaked[msg.sender]) revert AlreadyStaked();
        if (msg.value < validatorStakeRequired) revert InsufficientStake();
        validatorStake[msg.sender] += msg.value;
        validatorStaked[msg.sender] = true;
        emit ValidatorStaked(msg.sender, msg.value);
    }

    /// @notice 项目结束后验证人取回剩余质押
    function withdrawStake() external nonReentrant {
        if (!_isProjectClosed()) revert ProjectStillActive();
        uint256 amount = validatorStake[msg.sender];
        if (amount == 0) revert NothingToClaim();
        validatorStake[msg.sender] = 0;
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit ValidatorStakeWithdrawn(msg.sender, amount);
    }

    // ── 里程碑挑战 ────────────────────────────────────────

    /// @notice 捐款人在挑战窗口内提交反证，挑战里程碑的真实性
    /// @param _milestoneId 要挑战的里程碑
    /// @param _evidenceCID IPFS 反证内容的 CID
    function challengeMilestone(uint256 _milestoneId, string calldata _evidenceCID) external payable nonReentrant {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        if (donorBalance[msg.sender] == 0) revert NotADonor();
        if (milestones[_milestoneId].status != MilestoneStatus.VERIFIED) revert NotVerified();
        if (block.timestamp > milestoneVerifiedAt[_milestoneId] + CHALLENGE_WINDOW) revert ChallengeWindowClosed();
        if (challenges[_milestoneId].challenger != address(0)) revert AlreadyChallenged();
        if (msg.value < CHALLENGE_BOND) revert InsufficientChallengeBond();

        ChallengeInfo storage c = challenges[_milestoneId];
        c.challenger    = msg.sender;
        c.evidenceCID   = _evidenceCID;
        c.challengedAt  = block.timestamp;

        emit MilestoneChallenged(_milestoneId, msg.sender, _evidenceCID);
    }

    /// @notice 捐款人对挑战投票（按捐款额加权）
    /// @param _milestoneId 被挑战的里程碑
    /// @param _supportChallenge true = 支持挑战（认为验证人造假），false = 反对
    function voteOnChallenge(uint256 _milestoneId, bool _supportChallenge) external {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        if (donorBalance[msg.sender] == 0) revert NotADonor();

        ChallengeInfo storage c = challenges[_milestoneId];
        if (c.challenger == address(0)) revert NoChallengeExists();
        if (c.resolved) revert ChallengeAlreadyResolved();
        if (block.timestamp > c.challengedAt + VOTE_WINDOW) revert VoteWindowClosed();
        if (msg.sender == c.challenger) revert ChallengerCannotVote();
        if (hasVotedOnChallenge[_milestoneId][msg.sender]) revert AlreadyVotedOnChallenge();

        hasVotedOnChallenge[_milestoneId][msg.sender] = true;
        uint256 weight = donorBalance[msg.sender];

        if (_supportChallenge) {
            c.forVotes += weight;
        } else {
            c.againstVotes += weight;
        }

        emit ChallengeVoted(_milestoneId, msg.sender, _supportChallenge, weight);
    }

    /// @notice 投票窗口结束后任何人可调用，结算挑战结果
    function resolveChallenge(uint256 _milestoneId) external nonReentrant {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();

        ChallengeInfo storage c = challenges[_milestoneId];
        if (c.challenger == address(0)) revert NoChallengeExists();
        if (c.resolved) revert ChallengeAlreadyResolved();
        if (block.timestamp <= c.challengedAt + VOTE_WINDOW) revert VoteWindowNotOver();

        c.resolved = true;

        if (c.forVotes > c.againstVotes) {
            // ── 挑战成立：关闭项目 + 砍验证人质押 + 允许捐款人退款 ──
            c.upheld = true;
            Milestone storage m = milestones[_milestoneId];

            uint256 totalSlash = 0;
            for (uint256 i = 0; i < m.proofDetails.length; i++) {
                address val = m.proofDetails[i].validator;
                uint256 slash = validatorStake[val]; // 没收 100%
                if (slash > 0) {
                    validatorStake[val]  = 0;
                    validatorStaked[val] = false;
                    totalSlash          += slash;
                    emit ValidatorSlashed(val, slash);
                }
            }

            // 举报人拿回押金 + 全部罚款
            (bool ok,) = c.challenger.call{value: CHALLENGE_BOND + totalSlash}("");
            if (!ok) revert TransferFailed();

            // 举报成立：自动退款给所有捐款人，项目关闭
            _autoRefundAll();
            emit EmergencyRefundApproved();
            emit ChallengeResolved(_milestoneId, true, totalSlash);
        } else {
            // ── 挑战不成立：举报人押金没收，正常进入可释放状态 ──
            c.upheld = false;
            stakePool += CHALLENGE_BOND;
            emit ChallengeResolved(_milestoneId, false, 0);
        }
    }

    // ── 项目核心功能 ──────────────────────────────────────

    function addMilestone(string memory _description, uint256 _releasePercent) external onlyOwner {
        uint256 id = milestones.length;
        milestones.push();
        Milestone storage m = milestones[id];
        m.description    = _description;
        m.releasePercent = _releasePercent;
        m.status         = MilestoneStatus.PENDING;
        emit MilestoneAdded(id, _description, _releasePercent);
    }

    function donate(Tag _tag) external payable nonReentrant {
        if (msg.value == 0) revert AmountMustBePositive();
        if (totalDonated + msg.value > targetAmount) revert ExceedsTargetAmount();
        if (emergencyApproved) revert EmergencyAlreadyApproved();

        tagBalances[_tag] += msg.value;
        totalDonated      += msg.value;
        donorBalance[msg.sender] += msg.value;
        if (!_isDonor[msg.sender]) {
            _isDonor[msg.sender] = true;
            donors.push(msg.sender);
        }

        if (address(sbt) != address(0)) {
            sbt.mint(msg.sender, address(this), name, msg.value, uint8(_tag));
        }

        emit Donated(msg.sender, msg.value, _tag);
    }

    /// @notice 验证人个人提交证明（需先完成质押）
    function submitProof(uint256 _milestoneId, bytes32 _proofHash, string calldata _proofUri)
        external onlyStakedValidator nonReentrant
    {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[_milestoneId];
        if (m.status != MilestoneStatus.PENDING) revert MilestoneNotPending();
        if (m.hasProved[msg.sender]) revert AlreadySubmittedProof();
        _checkFunding(_milestoneId);

        m.hasProved[msg.sender] = true;
        m.proofs[msg.sender]    = _proofHash;
        m.proofDetails.push(ProofDetail({ validator: msg.sender, metadataUri: _proofUri, submittedAt: block.timestamp }));
        m.proofCount++;
        lastActivityAt = block.timestamp;

        emit ProofSubmitted(_milestoneId, msg.sender, _proofHash, _proofUri);

        if (m.proofCount >= requiredSignatures) {
            m.status = MilestoneStatus.VERIFIED;
            milestoneVerifiedAt[_milestoneId] = block.timestamp;
            emit MilestoneVerified(_milestoneId);
        }
    }

    /// @notice EIP-712 聚合签名：一笔交易完成多签验证（需所有签名验证人均已质押）
    function submitAggregatedProof(
        uint256 _milestoneId,
        bytes32 _proofHash,
        string calldata _proofUri,
        bytes[] calldata _signatures
    ) external nonReentrant {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[_milestoneId];
        if (m.status != MilestoneStatus.PENDING) revert MilestoneNotPending();
        _checkFunding(_milestoneId);

        bytes32 digest = keccak256(abi.encodePacked(
            "\x19\x01",
            DOMAIN_SEPARATOR,
            keccak256(abi.encode(PROOF_TYPEHASH, _milestoneId, _proofHash, keccak256(bytes(_proofUri))))
        ));

        uint256 newCount = 0;
        for (uint256 i = 0; i < _signatures.length; i++) {
            address signer = _recoverSigner(digest, _signatures[i]);
            if (!isValidator[signer])       continue;
            if (!validatorStaked[signer])   continue; // 未质押的签名直接跳过
            if (m.hasProved[signer])        continue;

            m.hasProved[signer] = true;
            m.proofs[signer]    = _proofHash;
            m.proofDetails.push(ProofDetail({ validator: signer, metadataUri: _proofUri, submittedAt: block.timestamp }));
            m.proofCount++;
            newCount++;

            emit ProofSubmitted(_milestoneId, signer, _proofHash, _proofUri);
        }

        if (newCount == 0) revert NoValidSignatures();
        lastActivityAt = block.timestamp;

        if (m.proofCount >= requiredSignatures) {
            m.status = MilestoneStatus.VERIFIED;
            milestoneVerifiedAt[_milestoneId] = block.timestamp;
            emit MilestoneVerified(_milestoneId);
        }
    }

    // ── 内部函数 ──────────────────────────────────────────

    function _checkFunding(uint256 _milestoneId) internal view {
        uint256 cumulative = 0;
        for (uint256 i = 0; i <= _milestoneId; i++) {
            cumulative += milestones[i].releasePercent;
        }
        if (totalDonated < (targetAmount * cumulative) / 10000) revert FundingInsufficient();
    }

    /// @notice 演示用：跳过争议窗口，立即可释放（任何人可调用）
    function demoSkipChallengeWindow(uint256 _milestoneId) external {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        if (milestones[_milestoneId].status != MilestoneStatus.VERIFIED) revert NotVerified();
        // 把验证时间往前拨，使窗口显示为已结束
        milestoneVerifiedAt[_milestoneId] = block.timestamp - CHALLENGE_WINDOW - 1;
    }

    /// @notice 演示用：跳过投票窗口，立即可结算（任何人可调用）
    function demoSkipVoteWindow(uint256 _milestoneId) external {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        ChallengeInfo storage c = challenges[_milestoneId];
        if (c.challenger == address(0)) revert NoChallengeExists();
        if (c.resolved) revert ChallengeAlreadyResolved();
        c.challengedAt = block.timestamp - VOTE_WINDOW - 1;
    }

    /// @notice 演示用：跳过180天无活动限制，立即可发起紧急退款投票（任何人可调用）
    function demoSkipEmergencyWindow() external {
        lastActivityAt = block.timestamp - EMERGENCY_THRESHOLD - 1;
    }

    /// @notice 争议窗口结束后（或争议驳回后）任何人可调用，正式释放资金给受益方
    function releaseMilestone(uint256 _milestoneId) external nonReentrant {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[_milestoneId];
        if (m.status != MilestoneStatus.VERIFIED) revert NotVerified();

        ChallengeInfo storage c = challenges[_milestoneId];
        bool hasChallenge = c.challenger != address(0);

        if (hasChallenge) {
            if (!c.resolved) revert VoteWindowActive(); // 投票尚未结算
            if (c.upheld) revert ChallengeUpheld();    // 举报成立，里程碑已重置
        } else {
            // 无挑战：等待 3 天争议窗口自然结束
            if (block.timestamp <= milestoneVerifiedAt[_milestoneId] + CHALLENGE_WINDOW) revert ReleaseTooEarly();
        }

        _releaseFunds(_milestoneId);
    }

    /// @dev 举报成立时自动退款给所有捐款人，无需捐款人主动申请
    function _autoRefundAll() internal {
        emergencyApproved = true;
        autoRefunded      = true;
        uint256 total    = totalDonated;
        uint256 released = totalReleased;
        for (uint256 i = 0; i < donors.length; i++) {
            address donor = donors[i];
            uint256 amt = donorBalance[donor];
            if (amt == 0) continue;
            uint256 refund = total > 0 ? (amt * (total - released) / total) : 0;
            donorBalance[donor] = 0;
            hasClaimedRefund[donor] = true;
            if (refund > 0) {
                (bool ok,) = donor.call{value: refund}("");
                // 若转账失败（如合约地址拒收），资金留在合约内，不影响其他人
                if (!ok) {
                    donorBalance[donor] = amt; // 恢复，供手动领取
                    hasClaimedRefund[donor] = false;
                }
            }
        }
    }

    function _releaseFunds(uint256 _milestoneId) internal {
        Milestone storage m = milestones[_milestoneId];
        if (m.status != MilestoneStatus.VERIFIED) revert NotVerified();

        uint256 amount = (targetAmount * m.releasePercent) / 10000;
        if (address(this).balance < amount) revert InsufficientBalance();

        m.status = MilestoneStatus.RELEASED;
        totalReleased += amount;

        (bool ok,) = beneficiary.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit FundsReleased(_milestoneId, beneficiary, amount);

        // 最后一个里程碑释放时，保障池余额一并转给受益方
        bool allReleased = true;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.RELEASED) { allReleased = false; break; }
        }
        if (allReleased && stakePool > 0) {
            uint256 pool = stakePool;
            stakePool = 0;
            (bool ok2,) = beneficiary.call{value: pool}("");
            if (!ok2) revert TransferFailed();
        }
    }

    function _recoverSigner(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        if (sig.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);
        return ecrecover(digest, v, r, s);
    }

    function _isProjectClosed() internal view returns (bool) {
        if (emergencyApproved) return true;
        if (milestones.length == 0) return false;
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].status != MilestoneStatus.RELEASED) return false;
        }
        return true;
    }

    // ── 紧急退款 ─────────────────────────────────────────

    function voteEmergencyRefund() external {
        if (block.timestamp <= lastActivityAt + EMERGENCY_THRESHOLD) revert TooEarlyForEmergency();
        if (donorBalance[msg.sender] == 0) revert NotADonor();
        if (hasVotedEmergency[msg.sender]) revert AlreadyVoted();
        if (emergencyApproved) revert EmergencyAlreadyApproved();

        hasVotedEmergency[msg.sender] = true;
        emergencyVoteAmount += donorBalance[msg.sender];

        emit EmergencyVoted(msg.sender, donorBalance[msg.sender], emergencyVoteAmount);

        if (emergencyVoteAmount * 2 > totalDonated) {
            emergencyApproved = true;
            emit EmergencyRefundApproved();
        }
    }

    function claimEmergencyRefund() external nonReentrant {
        if (!emergencyApproved) revert EmergencyNotApproved();
        if (hasClaimedRefund[msg.sender]) revert AlreadyClaimed();
        uint256 userAmount = donorBalance[msg.sender];
        if (userAmount == 0) revert NothingToClaim();

        // 捐了多少退多少；若有里程碑已释放，按比例扣减已释放部分
        uint256 refundAmount = totalDonated > 0
            ? (userAmount * (totalDonated - totalReleased) / totalDonated)
            : 0;

        hasClaimedRefund[msg.sender] = true;
        donorBalance[msg.sender]     = 0;

        if (refundAmount > 0) {
            (bool ok,) = msg.sender.call{value: refundAmount}("");
            if (!ok) revert TransferFailed();
        }
    }

    // ── View 函数 ────────────────────────────────────────

    function getMilestoneCount() external view returns (uint256) { return milestones.length; }
    function getTagBalance(Tag _tag) external view returns (uint256) { return tagBalances[_tag]; }
    function getBalance() external view returns (uint256) { return address(this).balance; }
    function isFundingComplete() external view returns (bool) { return totalDonated >= targetAmount; }
    function isProjectClosed() external view returns (bool) { return _isProjectClosed(); }

    function hasSubmittedProof(uint256 _milestoneId, address _validator) external view returns (bool) {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        return milestones[_milestoneId].hasProved[_validator];
    }

    function getMilestoneInfo(uint256 _milestoneId) external view returns (
        string memory desc, uint256 releasePercent, MilestoneStatus status, uint256 proofCount
    ) {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        Milestone storage m = milestones[_milestoneId];
        return (m.description, m.releasePercent, m.status, m.proofCount);
    }

    function getMilestoneProofs(uint256 _milestoneId) external view returns (ProofDetail[] memory) {
        if (_milestoneId >= milestones.length) revert InvalidMilestone();
        return milestones[_milestoneId].proofDetails;
    }

    function getChallengeInfo(uint256 _milestoneId) external view returns (
        address challenger,
        string memory evidenceCID,
        uint256 challengedAt,
        uint256 forVotes,
        uint256 againstVotes,
        bool resolved,
        bool upheld,
        bool inWindow
    ) {
        ChallengeInfo storage c = challenges[_milestoneId];
        challenger   = c.challenger;
        evidenceCID  = c.evidenceCID;
        challengedAt = c.challengedAt;
        forVotes     = c.forVotes;
        againstVotes = c.againstVotes;
        resolved     = c.resolved;
        upheld       = c.upheld;
        inWindow     = c.challenger != address(0) && !c.resolved
                       && block.timestamp <= c.challengedAt + VOTE_WINDOW; // 投票窗口是否还开着
    }

    function getEmergencyStatus() external view returns (
        bool canVote, uint256 daysRemaining, uint256 votePercent, bool approved, uint256 myDonation
    ) {
        uint256 elapsed = block.timestamp - lastActivityAt;
        canVote        = elapsed >= EMERGENCY_THRESHOLD;
        daysRemaining  = canVote ? 0 : (EMERGENCY_THRESHOLD - elapsed) / 1 days;
        votePercent    = totalDonated > 0 ? (emergencyVoteAmount * 100 / totalDonated) : 0;
        approved       = emergencyApproved;
        myDonation     = donorBalance[msg.sender];
    }

    receive() external payable {}
}
