// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PawToken.sol";

contract PawLedger is Ownable {
    // ─── Enums ───────────────────────────────────────────────────────────────

    enum CaseStatus { PENDING, ACTIVE, CLOSED, REFUNDED }
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

    // ─── State Variables ─────────────────────────────────────────────────────

    PawToken public pawToken;
    uint256  public reviewerThreshold;
    uint256  public requiredApprovals;

    Case[]   public cases;
    mapping(uint256 => Milestone[]) public milestones;

    /// @dev Tracks ETH currently held per case (decremented on withdraw/refund)
    mapping(uint256 => uint256) public caseBalance;

    /// @dev Snapshot of caseBalance at the moment the first refund is claimed.
    ///      All donors use this fixed denominator so refund order doesn't matter.
    mapping(uint256 => uint256) public refundSnapshot;

    // ─── Mappings ────────────────────────────────────────────────────────────

    mapping(address => bool)    public isReviewer;
    mapping(address => uint256) public totalDonated;
    mapping(uint256 => mapping(address => uint256)) public donations;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

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

    /// @param pawTokenAddr  Deployed PawToken contract address
    /// @param threshold     Min cumulative AVAX (wei) to become a reviewer
    /// @param approvals     Number of reviewer approvals needed to activate a case
    constructor(address pawTokenAddr, uint256 threshold, uint256 approvals)
        Ownable(msg.sender)
    {
        require(pawTokenAddr != address(0), "Zero token address");
        pawToken          = PawToken(pawTokenAddr);
        reviewerThreshold = threshold;
        requiredApprovals = approvals;

        isReviewer[msg.sender] = true;
        emit ReviewerAdded(msg.sender);
    }

    // ─── Owner Functions ──────────────────────────────────────────────────────

    function updateRequiredApprovals(uint256 n) external onlyOwner {
        require(n > 0, "Must be > 0");
        requiredApprovals = n;
    }

    function updateReviewerThreshold(uint256 n) external onlyOwner {
        reviewerThreshold = n;
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

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

    /// @notice Donor votes on a milestone. Weight = donor's case donation / raisedAmount.
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
    ///         Refund = donor's share of remaining case balance.
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
}
