/**
 * PawLedger Integration Tests
 *
 * End-to-end flows covering the critical paths:
 *   A. Full rescue lifecycle: submit → review → donate → milestone → vote → withdraw → close
 *   B. Refund flow: deadline expires before case completes, donors get proportional refunds
 *   C. Reviewer promotion: donor reaches threshold, becomes reviewer, reviews a case
 *   D. Multi-milestone flow: 3 milestones submitted and withdrawn sequentially
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PawLedger — Integration", function () {
  let pawToken, pawLedger;
  let owner, rescuer, donor1, donor2, reviewer2;

  const THRESHOLD = ethers.parseEther("0.1");
  const GOAL = ethers.parseEther("1.0");
  const DURATION_DAYS = 30;

  beforeEach(async function () {
    [owner, rescuer, donor1, donor2, reviewer2] = await ethers.getSigners();

    const PawToken = await ethers.getContractFactory("PawToken");
    pawToken = await PawToken.deploy(owner.address);

    const PawLedger = await ethers.getContractFactory("PawLedger");
    pawLedger = await PawLedger.deploy(await pawToken.getAddress(), THRESHOLD, 1);

    await pawToken.setMinter(await pawLedger.getAddress());
  });

  // ── A. Full Rescue Lifecycle ─────────────────────────────────────────────────

  describe("A. Full rescue lifecycle (1 milestone)", function () {
    let caseId;

    it("rescuer submits case", async function () {
      await expect(
        pawLedger.connect(rescuer).submitCase(
          JSON.stringify({ title: "Save stray cat", description: "urgent" }),
          GOAL,
          DURATION_DAYS,
          1
        )
      )
        .to.emit(pawLedger, "CaseSubmitted")
        .withArgs(0, rescuer.address);

      caseId = 0;
      const c = await pawLedger.cases(caseId);
      expect(c.status).to.equal(0); // PENDING
      expect(c.milestoneCount).to.equal(1);
    });

    it("owner (reviewer) approves case → activates", async function () {
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Test", description: "" }),
        GOAL, DURATION_DAYS, 1
      );
      caseId = 0;

      await expect(pawLedger.connect(owner).reviewCase(caseId, true))
        .to.emit(pawLedger, "CaseActivated")
        .withArgs(caseId);

      const c = await pawLedger.cases(caseId);
      expect(c.status).to.equal(1); // ACTIVE
      expect(await pawToken.balanceOf(owner.address)).to.equal(ethers.parseEther("10"));
    });

    it("donors donate and milestone is voted + withdrawn", async function () {
      // Setup: submit + activate
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Cat", description: "" }),
        GOAL, DURATION_DAYS, 1
      );
      caseId = 0;
      await pawLedger.connect(owner).reviewCase(caseId, true);

      // donor1 donates 0.6 AVAX (60%)
      await pawLedger.connect(donor1).donate(caseId, { value: ethers.parseEther("0.6") });
      // donor2 donates 0.4 AVAX (40%)
      await pawLedger.connect(donor2).donate(caseId, { value: ethers.parseEther("0.4") });

      const c = await pawLedger.cases(caseId);
      expect(c.raisedAmount).to.equal(ethers.parseEther("1.0"));

      // Rescuer submits milestone 0 requesting 0.8 AVAX
      const requestAmount = ethers.parseEther("0.8");
      await expect(
        pawLedger.connect(rescuer).submitMilestone(
          caseId, 0, "QmEvidence", "Medical treatment done", requestAmount
        )
      ).to.emit(pawLedger, "MilestoneSubmitted");

      // donor1 votes approve (60% weight > 50% threshold) → auto-approved
      await expect(
        pawLedger.connect(donor1).voteMilestone(caseId, 0, true)
      ).to.emit(pawLedger, "MilestoneApproved");

      const m = await pawLedger.getMilestone(caseId, 0);
      expect(m.status).to.equal(1); // APPROVED

      // Rescuer withdraws
      const rescuerBefore = await ethers.provider.getBalance(rescuer.address);
      const tx = await pawLedger.connect(rescuer).withdrawMilestone(caseId, 0);
      const receipt = await tx.wait();
      const gas = receipt.gasUsed * tx.gasPrice;
      const rescuerAfter = await ethers.provider.getBalance(rescuer.address);

      expect(rescuerAfter - rescuerBefore + gas).to.equal(requestAmount);

      // All milestones done → case CLOSED
      const cFinal = await pawLedger.cases(caseId);
      expect(cFinal.status).to.equal(2); // CLOSED
    });
  });

  // ── B. Refund Flow ────────────────────────────────────────────────────────────

  describe("B. Refund flow", function () {
    it("donors get proportional refunds after deadline with partial withdrawals", async function () {
      // Submit + activate with 1-day duration
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Refund test", description: "" }),
        GOAL, 1, 2
      );
      await pawLedger.connect(owner).reviewCase(0, true);

      // donor1 = 0.7 AVAX, donor2 = 0.3 AVAX
      await pawLedger.connect(donor1).donate(0, { value: ethers.parseEther("0.7") });
      await pawLedger.connect(donor2).donate(0, { value: ethers.parseEther("0.3") });

      // Rescuer submits + withdraws milestone 0 (0.4 AVAX), leaving 0.6 in escrow
      await pawLedger.connect(rescuer).submitMilestone(0, 0, "Qm1", "step 1", ethers.parseEther("0.4"));
      await pawLedger.connect(donor1).voteMilestone(0, 0, true); // auto-approved (70% > 50%)
      await pawLedger.connect(rescuer).withdrawMilestone(0, 0);

      // Fast-forward past deadline
      await time.increase(2 * 24 * 60 * 60);

      // Remaining balance = 0.6 AVAX
      // donor1 share: 70% of 0.6 = 0.42
      // donor2 share: 30% of 0.6 = 0.18

      const d1Before = await ethers.provider.getBalance(donor1.address);
      const tx1 = await pawLedger.connect(donor1).claimRefund(0);
      const r1 = await tx1.wait();
      const d1After = await ethers.provider.getBalance(donor1.address);
      const net1 = d1After - d1Before + r1.gasUsed * tx1.gasPrice;
      expect(net1).to.be.closeTo(ethers.parseEther("0.42"), ethers.parseEther("0.001"));

      const d2Before = await ethers.provider.getBalance(donor2.address);
      const tx2 = await pawLedger.connect(donor2).claimRefund(0);
      const r2 = await tx2.wait();
      const d2After = await ethers.provider.getBalance(donor2.address);
      const net2 = d2After - d2Before + r2.gasUsed * tx2.gasPrice;
      expect(net2).to.be.closeTo(ethers.parseEther("0.18"), ethers.parseEther("0.001"));

      // Double-refund blocked (donations[0][donor1] zeroed out after first claim)
      await expect(pawLedger.connect(donor1).claimRefund(0)).to.be.revertedWith(
        "Nothing to refund"
      );
    });
  });

  // ── C. Reviewer Promotion ─────────────────────────────────────────────────────

  describe("C. Reviewer promotion flow", function () {
    it("donor reaches threshold, becomes reviewer, reviews case and earns $PAW", async function () {
      // Submit a case to review
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Case to review", description: "" }),
        GOAL, DURATION_DAYS, 1
      );
      // Activate with owner (requiredApprovals = 1)
      await pawLedger.connect(owner).reviewCase(0, true);

      // donor2 donates >= threshold to become reviewer
      await pawLedger.connect(donor2).donate(0, { value: THRESHOLD });
      expect(await pawLedger.isReviewer(donor2.address)).to.be.false;
      await pawLedger.connect(donor2).becomeReviewer();
      expect(await pawLedger.isReviewer(donor2.address)).to.be.true;

      // Increase requiredApprovals to 2 so a second case needs both reviewers
      await pawLedger.connect(owner).updateRequiredApprovals(2);
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Case needing 2 approvals", description: "" }),
        GOAL, DURATION_DAYS, 1
      );
      const caseId = 1;

      // owner approves (1 of 2) — not activated yet
      await pawLedger.connect(owner).reviewCase(caseId, true);
      expect((await pawLedger.cases(caseId)).status).to.equal(0); // still PENDING

      // new reviewer approves (2 of 2) → activated
      await expect(pawLedger.connect(donor2).reviewCase(caseId, true))
        .to.emit(pawLedger, "CaseActivated");

      expect((await pawLedger.cases(caseId)).status).to.equal(1); // ACTIVE
      expect(await pawToken.balanceOf(donor2.address)).to.equal(ethers.parseEther("10"));
    });
  });

  // ── D. Multi-Milestone Flow ───────────────────────────────────────────────────

  describe("D. Multi-milestone sequential flow (3 milestones)", function () {
    it("all 3 milestones submitted, voted, and withdrawn — case closes", async function () {
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "3-step rescue", description: "" }),
        GOAL, DURATION_DAYS, 3
      );
      await pawLedger.connect(owner).reviewCase(0, true);

      // Single donor covers 100% weight
      await pawLedger.connect(donor1).donate(0, { value: GOAL });

      const amounts = [
        ethers.parseEther("0.3"),
        ethers.parseEther("0.3"),
        ethers.parseEther("0.4"),
      ];

      for (let i = 0; i < 3; i++) {
        await pawLedger.connect(rescuer).submitMilestone(0, i, `QmEv${i}`, `Step ${i + 1}`, amounts[i]);
        await pawLedger.connect(donor1).voteMilestone(0, i, true);
        const m = await pawLedger.getMilestone(0, i);
        expect(m.status).to.equal(1); // APPROVED
        await pawLedger.connect(rescuer).withdrawMilestone(0, i);
      }

      const c = await pawLedger.cases(0);
      expect(c.status).to.equal(2); // CLOSED
    });
  });

  // ── E. Milestone Rejection Flow ───────────────────────────────────────────────
  // Note: the contract does not support in-place re-submission (idx must always equal
  // milestones.length). After rejection, rescuer may continue to submit subsequent
  // milestones; the rejected milestone's funds remain locked in escrow.

  describe("E. Milestone rejection — next milestone still submittable", function () {
    it("rejected milestone is recorded; rescuer can submit and close subsequent milestones", async function () {
      await pawLedger.connect(rescuer).submitCase(
        JSON.stringify({ title: "Rejection test", description: "" }),
        GOAL, DURATION_DAYS, 2
      );
      await pawLedger.connect(owner).reviewCase(0, true);

      // donor1 = 60%, donor2 = 40%
      await pawLedger.connect(donor1).donate(0, { value: ethers.parseEther("0.6") });
      await pawLedger.connect(donor2).donate(0, { value: ethers.parseEther("0.4") });

      // Submit milestone 0
      await pawLedger.connect(rescuer).submitMilestone(
        0, 0, "QmBad", "insufficient evidence", ethers.parseEther("0.4")
      );

      // donor2 rejects (40% > 30% within 48h) → auto-rejected
      await expect(
        pawLedger.connect(donor2).voteMilestone(0, 0, false)
      ).to.emit(pawLedger, "MilestoneRejected");

      expect((await pawLedger.getMilestone(0, 0)).status).to.equal(2); // REJECTED

      // Re-submission of milestone 0 is blocked (must submit idx == milestones.length == 1)
      await expect(
        pawLedger.connect(rescuer).submitMilestone(0, 0, "QmGood", "re-try", ethers.parseEther("0.4"))
      ).to.be.revertedWith("Wrong milestone index");

      // Rescuer submits milestone 1 (next in sequence)
      await pawLedger.connect(rescuer).submitMilestone(
        0, 1, "QmMile1", "second step complete", ethers.parseEther("0.4")
      );

      // donor1 approves milestone 1 (60% > 50%) → auto-approved
      await expect(
        pawLedger.connect(donor1).voteMilestone(0, 1, true)
      ).to.emit(pawLedger, "MilestoneApproved");

      // Rescuer withdraws milestone 1
      await pawLedger.connect(rescuer).withdrawMilestone(0, 1);

      // Case remains ACTIVE (milestone 0 never released)
      expect((await pawLedger.cases(0)).status).to.equal(1); // ACTIVE
    });
  });
});
