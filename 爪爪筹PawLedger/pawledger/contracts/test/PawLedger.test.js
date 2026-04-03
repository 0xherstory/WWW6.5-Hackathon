const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PawLedger", function () {
  let pawToken, pawLedger;
  let owner, rescuer, donor1, donor2, reviewer2, other;

  // Shared helpers
  const THRESHOLD = ethers.parseEther("0.1");
  const PAW_REWARD = ethers.parseEther("10");

  async function deploy() {
    [owner, rescuer, donor1, donor2, reviewer2, other] =
      await ethers.getSigners();

    const PawToken = await ethers.getContractFactory("PawToken");
    pawToken = await PawToken.deploy(owner.address);

    const PawLedger = await ethers.getContractFactory("PawLedger");
    pawLedger = await PawLedger.deploy(
      await pawToken.getAddress(),
      THRESHOLD,
      1 // requiredApprovals
    );

    await pawToken
      .connect(owner)
      .setMinter(await pawLedger.getAddress());
  }

  // Helper: submit + activate a case, returns caseId (0)
  async function activeCase() {
    await pawLedger
      .connect(rescuer)
      .submitCase("ipfs://case1", ethers.parseEther("2"), 30, 2);
    await pawLedger.connect(owner).reviewCase(0, true);
    return 0;
  }

  // Helper: donate and return caseId
  async function donateToCase(caseId, donor, amount) {
    await pawLedger.connect(donor).donate(caseId, { value: amount });
  }

  beforeEach(deploy);

  // ─── Deployment ───────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets pawToken, threshold, requiredApprovals", async function () {
      expect(await pawLedger.pawToken()).to.equal(
        await pawToken.getAddress()
      );
      expect(await pawLedger.reviewerThreshold()).to.equal(THRESHOLD);
      expect(await pawLedger.requiredApprovals()).to.equal(1n);
    });

    it("registers deployer as first reviewer", async function () {
      expect(await pawLedger.isReviewer(owner.address)).to.be.true;
    });

    it("PawToken minter is set to PawLedger", async function () {
      expect(await pawToken.minter()).to.equal(
        await pawLedger.getAddress()
      );
    });
  });

  // ─── submitCase ───────────────────────────────────────────────────────────

  describe("submitCase", function () {
    it("creates a PENDING case with correct fields", async function () {
      const tx = await pawLedger
        .connect(rescuer)
        .submitCase("ipfs://meta", ethers.parseEther("1"), 7, 3);

      await expect(tx)
        .to.emit(pawLedger, "CaseSubmitted")
        .withArgs(0n, rescuer.address);

      const c = await pawLedger.cases(0);
      expect(c.rescuer).to.equal(rescuer.address);
      expect(c.ipfsMetadata).to.equal("ipfs://meta");
      expect(c.goalAmount).to.equal(ethers.parseEther("1"));
      expect(c.raisedAmount).to.equal(0n);
      expect(c.status).to.equal(0); // PENDING
      expect(c.milestoneCount).to.equal(3n);
      expect(c.approvalCount).to.equal(0n);
    });

    it("increments case count", async function () {
      await pawLedger
        .connect(rescuer)
        .submitCase("ipfs://a", ethers.parseEther("1"), 7, 1);
      await pawLedger
        .connect(rescuer)
        .submitCase("ipfs://b", ethers.parseEther("1"), 7, 1);
      expect(await pawLedger.getCasesCount()).to.equal(2n);
    });

    it("reverts with zero goal", async function () {
      await expect(
        pawLedger.connect(rescuer).submitCase("ipfs://x", 0, 7, 1)
      ).to.be.revertedWith("Goal must be > 0");
    });
  });

  // ─── reviewCase ───────────────────────────────────────────────────────────

  describe("reviewCase", function () {
    beforeEach(async function () {
      await pawLedger
        .connect(rescuer)
        .submitCase("ipfs://case", ethers.parseEther("1"), 30, 1);
    });

    it("reviewer approves and mints 10 $PAW", async function () {
      await expect(pawLedger.connect(owner).reviewCase(0, true))
        .to.emit(pawLedger, "CaseReviewed")
        .withArgs(0n, owner.address, true)
        .and.to.emit(pawLedger, "CaseActivated")
        .withArgs(0n);

      expect(await pawToken.balanceOf(owner.address)).to.equal(PAW_REWARD);
      const c = await pawLedger.cases(0);
      expect(c.status).to.equal(1); // ACTIVE
    });

    it("reviewer rejects — no activation, still mints PAW", async function () {
      await pawLedger.connect(owner).reviewCase(0, false);
      expect(await pawToken.balanceOf(owner.address)).to.equal(PAW_REWARD);
      const c = await pawLedger.cases(0);
      expect(c.status).to.equal(0); // still PENDING
    });

    it("non-reviewer cannot reviewCase", async function () {
      await expect(
        pawLedger.connect(other).reviewCase(0, true)
      ).to.be.revertedWith("Not a reviewer");
    });

    it("double review reverts", async function () {
      // Use reject so case stays PENDING, then try reviewing again
      await pawLedger.connect(owner).reviewCase(0, false);
      await expect(
        pawLedger.connect(owner).reviewCase(0, false)
      ).to.be.revertedWith("Already reviewed");
    });

    it("activates only after requiredApprovals met (2-of-2 test)", async function () {
      // Lower threshold to 0 so reviewer2 can self-promote without donating
      await pawLedger.connect(owner).updateReviewerThreshold(0);
      await pawLedger.connect(reviewer2).becomeReviewer();

      // Raise requiredApprovals to 2 before any reviews
      await pawLedger.connect(owner).updateRequiredApprovals(2);

      // First approval — case stays PENDING (1 of 2)
      await pawLedger.connect(owner).reviewCase(0, true);
      expect((await pawLedger.cases(0)).status).to.equal(0); // PENDING

      // Second approval — case activates (2 of 2)
      await pawLedger.connect(reviewer2).reviewCase(0, true);
      expect((await pawLedger.cases(0)).status).to.equal(1); // ACTIVE
    });
  });

  // ─── donate ───────────────────────────────────────────────────────────────

  describe("donate", function () {
    beforeEach(activeCase);

    it("records donation and updates balances", async function () {
      const amount = ethers.parseEther("0.5");
      await expect(
        pawLedger.connect(donor1).donate(0, { value: amount })
      )
        .to.emit(pawLedger, "Donated")
        .withArgs(0n, donor1.address, amount);

      expect(await pawLedger.donations(0, donor1.address)).to.equal(amount);
      expect(await pawLedger.totalDonated(donor1.address)).to.equal(amount);
      expect((await pawLedger.cases(0)).raisedAmount).to.equal(amount);
      expect(await pawLedger.caseBalance(0)).to.equal(amount);
    });

    it("reverts on non-ACTIVE case", async function () {
      await pawLedger
        .connect(rescuer)
        .submitCase("ipfs://pending", ethers.parseEther("1"), 7, 1);
      await expect(
        pawLedger.connect(donor1).donate(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Case not active");
    });

    it("reverts with zero value", async function () {
      await expect(
        pawLedger.connect(donor1).donate(0, { value: 0n })
      ).to.be.revertedWith("Send AVAX");
    });
  });

  // ─── becomeReviewer ───────────────────────────────────────────────────────

  describe("becomeReviewer", function () {
    beforeEach(activeCase);

    it("donor at threshold can become reviewer", async function () {
      await donateToCase(0, donor1, THRESHOLD);
      await expect(pawLedger.connect(donor1).becomeReviewer())
        .to.emit(pawLedger, "ReviewerAdded")
        .withArgs(donor1.address);
      expect(await pawLedger.isReviewer(donor1.address)).to.be.true;
    });

    it("reverts below threshold", async function () {
      await donateToCase(0, donor1, THRESHOLD - 1n);
      await expect(
        pawLedger.connect(donor1).becomeReviewer()
      ).to.be.revertedWith("Below threshold");
    });

    it("reverts if already a reviewer", async function () {
      await expect(
        pawLedger.connect(owner).becomeReviewer()
      ).to.be.revertedWith("Already a reviewer");
    });
  });

  // ─── submitMilestone ──────────────────────────────────────────────────────

  describe("submitMilestone", function () {
    const donation = ethers.parseEther("1");

    beforeEach(async function () {
      await activeCase();
      await donateToCase(0, donor1, donation);
    });

    it("rescuer submits milestone 0 successfully", async function () {
      await expect(
        pawLedger
          .connect(rescuer)
          .submitMilestone(0, 0, "ipfs://ev1", "Treatment done", ethers.parseEther("0.4"))
      )
        .to.emit(pawLedger, "MilestoneSubmitted")
        .withArgs(0n, 0n);

      const m = await pawLedger.getMilestone(0, 0);
      expect(m.evidenceIPFS).to.equal("ipfs://ev1");
      expect(m.requestAmount).to.equal(ethers.parseEther("0.4"));
      expect(m.status).to.equal(0); // PENDING
      expect(m.fundsReleased).to.be.false;
    });

    it("non-rescuer cannot submit milestone", async function () {
      await expect(
        pawLedger
          .connect(other)
          .submitMilestone(0, 0, "ipfs://ev", "desc", ethers.parseEther("0.4"))
      ).to.be.revertedWith("Not rescuer");
    });

    it("wrong idx reverts", async function () {
      await expect(
        pawLedger
          .connect(rescuer)
          .submitMilestone(0, 1, "ipfs://ev", "desc", ethers.parseEther("0.4"))
      ).to.be.revertedWith("Wrong milestone index");
    });

    it("exceeding milestoneCount reverts", async function () {
      // milestoneCount = 2; submit 0, 1, then 2 should revert
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 0, "ipfs://e0", "d0", ethers.parseEther("0.3"));
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 1, "ipfs://e1", "d1", ethers.parseEther("0.3"));
      await expect(
        pawLedger
          .connect(rescuer)
          .submitMilestone(0, 2, "ipfs://e2", "d2", ethers.parseEther("0.1"))
      ).to.be.revertedWith("Exceeds milestone count");
    });
  });

  // ─── voteMilestone ────────────────────────────────────────────────────────

  describe("voteMilestone", function () {
    beforeEach(async function () {
      await activeCase();
      // donor1: 1 ETH, donor2: 0.5 ETH  →  total 1.5 ETH
      await donateToCase(0, donor1, ethers.parseEther("1"));
      await donateToCase(0, donor2, ethers.parseEther("0.5"));
      // Submit milestone requesting 0.5 ETH
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 0, "ipfs://ev", "desc", ethers.parseEther("0.5"));
    });

    it("non-donor cannot vote", async function () {
      await expect(
        pawLedger.connect(other).voteMilestone(0, 0, true)
      ).to.be.revertedWith("Not a donor for this case");
    });

    it("hasVoted guard prevents double vote", async function () {
      await pawLedger.connect(donor1).voteMilestone(0, 0, true);
      await expect(
        pawLedger.connect(donor1).voteMilestone(0, 0, true)
      ).to.be.revertedWith("Already voted");
    });

    it("auto-approves when approve weight > 50%", async function () {
      // donor1 has 1 ETH out of 1.5 ETH total (66.7%) → triggers auto-approve
      await expect(pawLedger.connect(donor1).voteMilestone(0, 0, true))
        .to.emit(pawLedger, "MilestoneApproved")
        .withArgs(0n, 0n);

      const m = await pawLedger.getMilestone(0, 0);
      expect(m.status).to.equal(1); // APPROVED
    });

    it("auto-rejects when reject weight > 30% within 48h", async function () {
      // donor1 rejects with 1 ETH out of 1.5 ETH (66.7% > 30%) within 48h
      await expect(pawLedger.connect(donor1).voteMilestone(0, 0, false))
        .to.emit(pawLedger, "MilestoneRejected")
        .withArgs(0n, 0n);

      const m = await pawLedger.getMilestone(0, 0);
      expect(m.status).to.equal(2); // REJECTED
    });

    it("no auto-reject after 48h even with >30% reject weight", async function () {
      // Advance time past 48 hours
      await time.increase(48 * 60 * 60 + 1);
      await pawLedger.connect(donor1).voteMilestone(0, 0, false);

      const m = await pawLedger.getMilestone(0, 0);
      expect(m.status).to.equal(0); // still PENDING (no auto-reject after 48h)
    });

    it("partial votes accumulate weights without triggering auto-resolution", async function () {
      // donor2 rejects: 0.5 ETH out of 1.5 ETH = 33.3% > 30%, but let's check
      // Actually 0.5 * 100 > 1.5 * 30 → 50 > 45 → true, so it WOULD auto-reject
      // Use a scenario where reject weight stays ≤ 30%
      // Redo: donor1=1 ETH, donor2=2 ETH → total 3 ETH; donor2 rejects = 2/3 = 66% → auto-reject
      // Instead test partial: donor2 votes approve (0.5 ETH = 33%), no auto-resolve
      await pawLedger.connect(donor2).voteMilestone(0, 0, true);
      const m = await pawLedger.getMilestone(0, 0);
      // 0.5 * 2 = 1.0, raisedAmount = 1.5 → 1.0 > 1.5? No → no auto-approve
      expect(m.status).to.equal(0); // still PENDING
      expect(m.approveWeight).to.equal(ethers.parseEther("0.5"));
    });
  });

  // ─── withdrawMilestone ────────────────────────────────────────────────────

  describe("withdrawMilestone", function () {
    const donation = ethers.parseEther("1");
    const requestAmt = ethers.parseEther("0.4");

    beforeEach(async function () {
      await activeCase();
      await donateToCase(0, donor1, donation);
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 0, "ipfs://ev", "desc", requestAmt);
      // donor1 has 1 ETH / 1 ETH total = 100% → auto-approves on vote
      await pawLedger.connect(donor1).voteMilestone(0, 0, true);
    });

    it("rescuer withdraws approved milestone funds", async function () {
      const before = await ethers.provider.getBalance(rescuer.address);
      const tx = await pawLedger.connect(rescuer).withdrawMilestone(0, 0);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(rescuer.address);

      expect(after - before + gasCost).to.equal(requestAmt);
      expect(await pawLedger.caseBalance(0)).to.equal(donation - requestAmt);

      const m = await pawLedger.getMilestone(0, 0);
      expect(m.fundsReleased).to.be.true;
    });

    it("emits MilestoneWithdrawn", async function () {
      await expect(pawLedger.connect(rescuer).withdrawMilestone(0, 0))
        .to.emit(pawLedger, "MilestoneWithdrawn")
        .withArgs(0n, 0n, requestAmt);
    });

    it("double withdraw reverts", async function () {
      await pawLedger.connect(rescuer).withdrawMilestone(0, 0);
      await expect(
        pawLedger.connect(rescuer).withdrawMilestone(0, 0)
      ).to.be.revertedWith("Already withdrawn");
    });

    it("non-rescuer cannot withdraw", async function () {
      await expect(
        pawLedger.connect(other).withdrawMilestone(0, 0)
      ).to.be.revertedWith("Not rescuer");
    });

    it("case closes when all milestones withdrawn", async function () {
      // milestoneCount=2; submit and approve both, then withdraw both
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 1, "ipfs://ev2", "desc2", ethers.parseEther("0.3"));
      await pawLedger.connect(donor1).voteMilestone(0, 1, true);

      await pawLedger.connect(rescuer).withdrawMilestone(0, 0);
      expect((await pawLedger.cases(0)).status).to.equal(1); // still ACTIVE

      await pawLedger.connect(rescuer).withdrawMilestone(0, 1);
      expect((await pawLedger.cases(0)).status).to.equal(2); // CLOSED
    });
  });

  // ─── claimRefund ──────────────────────────────────────────────────────────

  describe("claimRefund", function () {
    beforeEach(async function () {
      await activeCase();
      await donateToCase(0, donor1, ethers.parseEther("1"));
      await donateToCase(0, donor2, ethers.parseEther("1"));
    });

    it("reverts before deadline", async function () {
      await expect(
        pawLedger.connect(donor1).claimRefund(0)
      ).to.be.revertedWith("Deadline not passed");
    });

    it("refunds proportionally after deadline", async function () {
      await time.increase(31 * 24 * 60 * 60); // advance 31 days past the 30-day deadline

      const before = await ethers.provider.getBalance(donor1.address);
      const tx = await pawLedger.connect(donor1).claimRefund(0);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(donor1.address);

      // donor1 donated 1 ETH out of 2 ETH total → gets back 1 ETH
      expect(after - before + gasCost).to.equal(ethers.parseEther("1"));
    });

    it("marks case REFUNDED on first claim", async function () {
      await time.increase(31 * 24 * 60 * 60);
      await pawLedger.connect(donor1).claimRefund(0);
      expect((await pawLedger.cases(0)).status).to.equal(3); // REFUNDED
    });

    it("second donor can still claim after first", async function () {
      await time.increase(31 * 24 * 60 * 60);
      await pawLedger.connect(donor1).claimRefund(0);
      await pawLedger.connect(donor2).claimRefund(0);
      expect(await pawLedger.caseBalance(0)).to.equal(0n);
    });

    it("double refund reverts", async function () {
      await time.increase(31 * 24 * 60 * 60);
      await pawLedger.connect(donor1).claimRefund(0);
      await expect(
        pawLedger.connect(donor1).claimRefund(0)
      ).to.be.revertedWith("Nothing to refund");
    });

    it("reverts on CLOSED case", async function () {
      // Activate, donate, submit + approve + withdraw both milestones to close
      await donateToCase(0, donor1, ethers.parseEther("0.1")); // extra so amounts work out
      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 0, "ipfs://e0", "d0", ethers.parseEther("0.5"));
      await pawLedger.connect(donor1).voteMilestone(0, 0, true);
      await pawLedger.connect(rescuer).withdrawMilestone(0, 0);

      await pawLedger
        .connect(rescuer)
        .submitMilestone(0, 1, "ipfs://e1", "d1", ethers.parseEther("0.5"));
      await pawLedger.connect(donor1).voteMilestone(0, 1, true);
      await pawLedger.connect(rescuer).withdrawMilestone(0, 1);

      await time.increase(31 * 24 * 60 * 60);
      await expect(
        pawLedger.connect(donor1).claimRefund(0)
      ).to.be.revertedWith("Case closed");
    });
  });

  // ─── Owner admin functions ────────────────────────────────────────────────

  describe("updateRequiredApprovals / updateReviewerThreshold", function () {
    it("owner can update requiredApprovals", async function () {
      await pawLedger.connect(owner).updateRequiredApprovals(3);
      expect(await pawLedger.requiredApprovals()).to.equal(3n);
    });

    it("non-owner cannot update requiredApprovals", async function () {
      await expect(
        pawLedger.connect(other).updateRequiredApprovals(3)
      ).to.be.revertedWithCustomError(pawLedger, "OwnableUnauthorizedAccount");
    });

    it("reverts on zero requiredApprovals", async function () {
      await expect(
        pawLedger.connect(owner).updateRequiredApprovals(0)
      ).to.be.revertedWith("Must be > 0");
    });

    it("owner can update reviewerThreshold", async function () {
      await pawLedger
        .connect(owner)
        .updateReviewerThreshold(ethers.parseEther("0.5"));
      expect(await pawLedger.reviewerThreshold()).to.equal(
        ethers.parseEther("0.5")
      );
    });

    it("non-owner cannot update reviewerThreshold", async function () {
      await expect(
        pawLedger.connect(other).updateReviewerThreshold(1n)
      ).to.be.revertedWithCustomError(pawLedger, "OwnableUnauthorizedAccount");
    });
  });
});
