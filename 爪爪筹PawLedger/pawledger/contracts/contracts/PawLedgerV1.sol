// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// Changed: import from contracts-upgradeable instead of contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// PawToken stays non-upgradeable — its minter is the proxy address, which never changes.
import "./PawToken.sol";

/**
 * @title PawLedgerV1
 * @notice Core escrow for PawLedger: cases, donations, milestones, reviewer logic.
 *         UUPS upgradeable (ERC-1967). Users interact with the ERC1967Proxy, not
 *         this implementation directly.
 *
 * ─── UPGRADE SAFETY — READ BEFORE EVERY UPGRADE ─────────────────────────────
 *
 *  1. NEVER remove, rename, or reorder state variables (slots 0–11).
 *     The proxy storage is fixed; changing layout corrupts all existing data.
 *
 *  2. ONLY append new state variables after slot 11, before __gap.
 *     Each new uint256-equivalent variable consumed reduces __gap by 1.
 *     Example: adding `uint256 public newVar;` → change `uint256[50]` to `uint256[49]`.
 *
 *  3. NEVER change a variable's type (e.g. uint128 → uint256 changes slot packing).
 *
 *  4. NEVER reorder enum members. Adding a new CaseStatus between PENDING and ACTIVE
 *     would corrupt every stored status value.
 *
 *  5. Call `_disableInitializers()` in every new implementation's constructor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
contract PawLedgerV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    // ─── Enums ───────────────────────────────────────────────────────────────
    // WARNING: never reorder or remove members — stored as uint8 on-chain.

    enum CaseStatus     { PENDING, ACTIVE, CLOSED, REFUNDED }
    enum MilestoneStatus { PENDING, APPROVED, REJECTED }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Case {
        address rescuer;
        string  ipfsMetadata;
        uint256 goalAmount;
        uint256 raisedAmount;   // cumulative donations (never decremented)
        uint256 deadline;
        CaseStatus status;
        uint256 milestoneCount;
        uint256 approvalCount;
    }

    struct Milestone {
        string  evidenceIPFS;
        string  description;
        uint256 requestAmount;
        uint256 approveWeight;  // sum of approving donors' donation amounts
        uint256 rejectWeight;   // sum of rejecting donors' donation amounts
        uint256 submittedAt;
        MilestoneStatus status;
        bool    fundsReleased;
    }

    // ─── State Variables ──────────────────────────────────────────────────────
    //
    // Changed: OwnableUpgradeable stores _owner via ERC-7201 namespaced storage,
    // so it does NOT consume slot 0. Custom state begins at slot 0.
    //
    // Slot  0: pawToken
    // Slot  1: reviewerThreshold
    // Slot  2: requiredApprovals
    // Slot  3: cases (array root)
    // Slot  4: milestones (mapping root)
    // Slot  5: caseBalance (mapping root)
    // Slot  6: refundSnapshot (mapping root)
    // Slot  7: isReviewer (mapping root)
    // Slot  8: totalDonated (mapping root)
    // Slot  9: donations (mapping root)
    // Slot 10: hasVoted (mapping root)
    // Slot 11: hasReviewed (mapping root)
    // Slots 12–61: __gap (50 reserved upgrade slots)

    PawToken public pawToken;           // slot 0
    uint256  public reviewerThreshold;  // slot 1
    uint256  public requiredApprovals;  // slot 2

    Case[]   public cases;              // slot 3
    mapping(uint256 => Milestone[]) public milestones;                                          // slot 4

    /// @dev Tracks AVAX currently held per case (decremented on withdraw/refund).
    mapping(uint256 => uint256) public caseBalance;                                             // slot 5

    /// @dev Snapshot of caseBalance at the moment the first refund is claimed.
    ///      Fixed denominator so refund order never matters.
    mapping(uint256 => uint256) public refundSnapshot;                                          // slot 6

    mapping(address => bool)    public isReviewer;                                              // slot 7
    mapping(address => uint256) public totalDonated;                                            // slot 8
    mapping(uint256 => mapping(address => uint256)) public donations;                           // slot 9
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;           // slot 10
    mapping(uint256 => mapping(address => bool)) public hasReviewed;                            // slot 11

    // ─── Events ───────────────────────────────────────────────────────────────

    event ReviewerAdded(address indexed reviewer);
    event CaseSubmitted(uint256 indexed caseId, address indexed rescuer);
    event CaseReviewed(uint256 indexed caseId, address indexed reviewer, bool approved);
    event CaseActivated(uint256 indexed caseId);
    event Donated(uint256 indexed caseId, address indexed donor, uint256 amount);
    event MilestoneSubmitted(uint256 indexed caseId, uint256 indexed idx);
    event MilestoneVoted(uint256 indexed caseId, uint256 indexed idx, address indexed voter, bool approved);
    event MilestoneApproved(uint256 indexed caseId, uint256 indexed idx);
    event MilestoneRejected(uint256 indexed caseId, uint256 indexed idx);
    event MilestoneWithdrawn(uint256 indexed caseId, uint256 indexed idx, uint256 amount);
    event RefundClaimed(uint256 indexed caseId, address indexed donor, uint256 amount);

    // ─── Constructor ──────────────────────────────────────────────────────────
    //
    // Changed: the constructor no longer initializes state. Its only job is to
    // lock the bare implementation so no one can call initialize() on it directly.
    // All real initialization happens through the proxy via initialize().

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ─── Initializer ─────────────────────────────────────────────────────────
    //
    // Changed: replaces the old constructor. Called exactly once by the proxy
    // at deployment time via ERC1967Proxy(implAddr, initCalldata).
    //
    // The `initializer` modifier (from Initializable) enforces single execution.

    /// @notice Initialize the contract through the proxy. Called once at deploy.
    /// @param pawTokenAddr  Deployed PawToken contract address
    /// @param threshold     Min cumulative AVAX (wei) to become a reviewer
    /// @param approvals     Number of reviewer approvals needed to activate a case
    function initialize(
        address pawTokenAddr,
        uint256 threshold,
        uint256 approvals
    ) external initializer {
        // Initialize OZ upgradeable parent contracts.
        // OwnableUpgradeable stores _owner via ERC-7201 namespaced storage.
        // UUPSUpgradeable is @custom:stateless in OZ v5 — no init call needed.
        __Ownable_init(msg.sender);

        require(pawTokenAddr != address(0), "Zero token address");
        pawToken          = PawToken(pawTokenAddr);
        reviewerThreshold = threshold;
        requiredApprovals = approvals;

        // Deployer auto-registered as first reviewer (same as original constructor)
        isReviewer[msg.sender] = true;
        emit ReviewerAdded(msg.sender);
    }

    // ─── UUPS Upgrade Authorization ───────────────────────────────────────────
    //
    // Changed (new): required by UUPSUpgradeable. Restricts who can upgrade.
    // Without this override the contract won't compile.
    //
    // Only the owner can call upgradeTo() / upgradeToAndCall().
    // To upgrade: deploy a new V2 implementation, then call
    //   proxy.upgradeToAndCall(newImplAddr, "") from the owner wallet.

    function _authorizeUpgrade(address /*newImplementation*/) internal override onlyOwner {}

    // ─── Owner Functions ──────────────────────────────────────────────────────
    // Unchanged from original.

    function updateRequiredApprovals(uint256 n) external onlyOwner {
        require(n > 0, "Must be > 0");
        requiredApprovals = n;
    }

    function updateReviewerThreshold(uint256 n) external onlyOwner {
        reviewerThreshold = n;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────
    // All logic identical to original PawLedger.sol. No changes needed here.

    /// @notice Rescuer submits a new rescue case. Starts in PENDING status.
    function submitCase(
        string calldata ipfs,
        uint256 goal,
        uint256 durationDays,
        uint256 milestoneCount
    ) external {
        require(goal > 0, "Goal must be > 0");
        require(durationDays > 0, "Duration must be > 0");
        require(milestoneCount > 0, "Must have milestones");

        uint256 caseId = cases.length;
        cases.push(Case({
            rescuer:        msg.sender,
            ipfsMetadata:   ipfs,
            goalAmount:     goal,
            raisedAmount:   0,
            deadline:       block.timestamp + durationDays * 1 days,
            status:         CaseStatus.PENDING,
            milestoneCount: milestoneCount,
            approvalCount:  0
        }));

        emit CaseSubmitted(caseId, msg.sender);
    }

    /// @notice Reviewer approves or rejects a case. Each reviewer may vote once.
    ///         Mints 10 $PAW as incentive. Activates case when approval threshold met.
    function reviewCase(uint256 caseId, bool approve) external {
        require(isReviewer[msg.sender], "Not a reviewer");
        require(caseId < cases.length, "Invalid caseId");
        require(cases[caseId].status == CaseStatus.PENDING, "Not pending");
        require(!hasReviewed[caseId][msg.sender], "Already reviewed");

        hasReviewed[caseId][msg.sender] = true;
        pawToken.mint(msg.sender, 10 ether); // 10 $PAW (18 decimals)

        emit CaseReviewed(caseId, msg.sender, approve);

        if (approve) {
            cases[caseId].approvalCount += 1;
            if (cases[caseId].approvalCount >= requiredApprovals) {
                cases[caseId].status = CaseStatus.ACTIVE;
                emit CaseActivated(caseId);
            }
        }
    }

    /// @notice Donate AVAX to an ACTIVE case.
    function donate(uint256 caseId) external payable {
        require(caseId < cases.length, "Invalid caseId");
        require(cases[caseId].status == CaseStatus.ACTIVE, "Case not active");
        require(msg.value > 0, "Send AVAX");

        donations[caseId][msg.sender]    += msg.value;
        totalDonated[msg.sender]         += msg.value;
        cases[caseId].raisedAmount       += msg.value;
        caseBalance[caseId]              += msg.value;

        emit Donated(caseId, msg.sender, msg.value);
    }

    /// @notice Donor with cumulative donations >= threshold self-promotes to reviewer.
    function becomeReviewer() external {
        require(!isReviewer[msg.sender], "Already a reviewer");
        require(totalDonated[msg.sender] >= reviewerThreshold, "Below threshold");

        isReviewer[msg.sender] = true;
        emit ReviewerAdded(msg.sender);
    }

    /// @notice Rescuer submits evidence for the next milestone in sequence.
    /// @param idx  Must equal the current number of submitted milestones (sequential).
    function submitMilestone(
        uint256 caseId,
        uint256 idx,
        string calldata ipfs,
        string calldata desc,
        uint256 amount
    ) external {
        require(caseId < cases.length, "Invalid caseId");
        Case storage c = cases[caseId];
        require(c.status == CaseStatus.ACTIVE, "Case not active");
        require(msg.sender == c.rescuer, "Not rescuer");
        require(idx == milestones[caseId].length, "Wrong milestone index");
        require(idx < c.milestoneCount, "Exceeds milestone count");
        require(amount > 0 && amount <= caseBalance[caseId], "Invalid amount");

        milestones[caseId].push(Milestone({
            evidenceIPFS:  ipfs,
            description:   desc,
            requestAmount: amount,
            approveWeight: 0,
            rejectWeight:  0,
            submittedAt:   block.timestamp,
            status:        MilestoneStatus.PENDING,
            fundsReleased: false
        }));

        emit MilestoneSubmitted(caseId, idx);
    }

    /// @notice Donor votes on a milestone. Weight = donor's case donation amount.
    ///         Auto-approves at >50% approve weight; auto-rejects at >30% reject within 48h.
    function voteMilestone(uint256 caseId, uint256 idx, bool approve) external {
        require(caseId < cases.length, "Invalid caseId");
        require(idx < milestones[caseId].length, "Invalid milestone");
        require(donations[caseId][msg.sender] > 0, "Not a donor for this case");
        require(!hasVoted[caseId][idx][msg.sender], "Already voted");

        Milestone storage m = milestones[caseId][idx];
        require(m.status == MilestoneStatus.PENDING, "Milestone not pending");

        hasVoted[caseId][idx][msg.sender] = true;
        uint256 weight = donations[caseId][msg.sender];

        if (approve) {
            m.approveWeight += weight;
        } else {
            m.rejectWeight += weight;
        }

        emit MilestoneVoted(caseId, idx, msg.sender, approve);

        uint256 raised = cases[caseId].raisedAmount;

        // Auto-approve: approve weight > 50% of total raised
        if (m.approveWeight * 2 > raised) {
            m.status = MilestoneStatus.APPROVED;
            emit MilestoneApproved(caseId, idx);
            return;
        }

        // Auto-reject: reject weight > 30% of total raised AND within 48h of submission
        if (
            m.rejectWeight * 100 > raised * 30 &&
            block.timestamp <= m.submittedAt + 48 hours
        ) {
            m.status = MilestoneStatus.REJECTED;
            emit MilestoneRejected(caseId, idx);
        }
    }

    /// @notice Rescuer withdraws funds for an APPROVED milestone.
    function withdrawMilestone(uint256 caseId, uint256 idx) external {
        require(caseId < cases.length, "Invalid caseId");
        require(idx < milestones[caseId].length, "Invalid milestone");

        Case storage c = cases[caseId];
        require(msg.sender == c.rescuer, "Not rescuer");

        Milestone storage m = milestones[caseId][idx];
        require(m.status == MilestoneStatus.APPROVED, "Not approved");
        require(!m.fundsReleased, "Already withdrawn");

        m.fundsReleased = true;
        caseBalance[caseId] -= m.requestAmount;

        // Close case when all milestones are approved and withdrawn
        bool allDone = true;
        Milestone[] storage ms = milestones[caseId];
        if (ms.length == c.milestoneCount) {
            for (uint256 i = 0; i < ms.length; i++) {
                if (!ms[i].fundsReleased) { allDone = false; break; }
            }
        } else {
            allDone = false;
        }
        if (allDone) c.status = CaseStatus.CLOSED;

        emit MilestoneWithdrawn(caseId, idx, m.requestAmount);
        (bool ok, ) = c.rescuer.call{value: m.requestAmount}("");
        require(ok, "Transfer failed");
    }

    /// @notice Donor claims proportional refund after deadline if case is not CLOSED.
    function claimRefund(uint256 caseId) external {
        require(caseId < cases.length, "Invalid caseId");
        Case storage c = cases[caseId];
        require(c.status != CaseStatus.CLOSED, "Case closed");
        require(block.timestamp > c.deadline, "Deadline not passed");

        uint256 donated = donations[caseId][msg.sender];
        require(donated > 0, "Nothing to refund");

        // Snapshot balance on first refund so order of claims doesn't matter
        if (c.status != CaseStatus.REFUNDED) {
            c.status = CaseStatus.REFUNDED;
            refundSnapshot[caseId] = caseBalance[caseId];
        }

        // Each donor's share = their donation / total raised * snapshot balance
        uint256 refund = donated * refundSnapshot[caseId] / c.raisedAmount;
        require(refund > 0, "Zero refund");

        // Zero out to prevent re-entry / double refund
        donations[caseId][msg.sender] = 0;
        caseBalance[caseId] -= refund;

        emit RefundClaimed(caseId, msg.sender, refund);
        (bool ok, ) = msg.sender.call{value: refund}("");
        require(ok, "Transfer failed");
    }

    // ─── View Helpers ─────────────────────────────────────────────────────────

    function getCasesCount() external view returns (uint256) {
        return cases.length;
    }

    function getMilestonesCount(uint256 caseId) external view returns (uint256) {
        return milestones[caseId].length;
    }

    function getMilestone(uint256 caseId, uint256 idx)
        external view
        returns (Milestone memory)
    {
        return milestones[caseId][idx];
    }

    // ─── Storage Gap ─────────────────────────────────────────────────────────
    //
    // Changed (new): reserves 50 slots for future state variables in V2, V3, etc.
    // When adding a new variable in V2, place it before __gap and reduce the
    // array size by the number of slots consumed.
    //
    // Example (V2 adds a fee variable):
    //   uint256 public platformFeeBps;   // slot 12
    //   uint256[49] private __gap;       // was 50, now 49

    uint256[50] private __gap;
}
