const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerGallery", function () {
  async function deployFixture() {
    const [owner, curator, creatorA, creatorB, supporter] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("HerGallery");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    return { contract, owner, curator, creatorA, creatorB, supporter };
  }

  async function createExhibition(contract, curator, tags = ["历史档案"]) {
    await contract.connect(curator).createExhibition(
      "Her Story",
      "QmExhibition",
      "QmCover",
      tags,
      { value: ethers.parseEther("0.001") }
    );
  }

  describe("exhibitions", function () {
    it("creates an exhibition with tags and stake", async function () {
      const { contract, curator } = await deployFixture();

      await createExhibition(contract, curator, ["证言记录", "历史档案"]);

      const exhibition = await contract.getExhibition(0);
      expect(exhibition.curator).to.equal(curator.address);
      expect(exhibition.title).to.equal("Her Story");
      expect(exhibition.tags).to.deep.equal(["证言记录", "历史档案"]);
      expect(exhibition.tipPool).to.equal(0n);
      expect(exhibition.stakeWithdrawn).to.equal(false);
    });

    it("requires valid content types for submissions", async function () {
      const { contract, curator, creatorA } = await deployFixture();
      await createExhibition(contract, curator);

      await expect(
        contract.connect(creatorA).submitToExhibition(0, "testimony", "QmPayload", "Title", "Desc")
      ).to.be.revertedWith("Invalid content type");
    });
  });

  describe("submission moderation", function () {
    it("stores new submissions as pending and lets curator approve or reject them", async function () {
      const { contract, curator, creatorA, creatorB } = await deployFixture();
      await createExhibition(contract, curator);

      await contract.connect(creatorA).submitToExhibition(0, "evidence", "QmEvidence", "Evidence", "Pending");
      await contract.connect(creatorB).submitToExhibition(0, "creation", "QmCreation", "Creation", "Pending");

      const pendingBefore = await contract.getPendingSubmissions(0);
      expect(pendingBefore).to.have.length(2);
      expect(pendingBefore[0].status).to.equal(0n);

      await contract.connect(curator).approveSubmission(0);
      await contract.connect(curator).rejectSubmission(1);

      const approved = await contract.getSubmission(0);
      const rejected = await contract.getSubmission(1);

      expect(approved.status).to.equal(1n);
      expect(rejected.status).to.equal(2n);
      expect((await contract.getPendingSubmissions(0))).to.have.length(0);
    });

    it("blocks non-curators from moderating", async function () {
      const { contract, curator, creatorA, supporter } = await deployFixture();
      await createExhibition(contract, curator);
      await contract.connect(creatorA).submitToExhibition(0, "evidence", "QmEvidence", "Evidence", "Pending");

      await expect(contract.connect(supporter).approveSubmission(0)).to.be.revertedWith("Only curator");
      await expect(contract.connect(supporter).rejectSubmission(0)).to.be.revertedWith("Only curator");
    });
  });

  describe("engagement", function () {
    it("allows recommending and witnessing approved submissions once per address", async function () {
      const { contract, curator, creatorA, supporter } = await deployFixture();
      await createExhibition(contract, curator);
      await contract.connect(creatorA).submitToExhibition(0, "evidence", "QmEvidence", "Evidence", "Approved");
      await contract.connect(curator).approveSubmission(0);

      await contract.connect(supporter).recommend(0, 0);
      await contract.connect(supporter).witness(0);

      const submission = await contract.getSubmission(0);
      expect(submission.recommendCount).to.equal(1n);
      expect(submission.witnessCount).to.equal(1n);
      expect(await contract.hasRecommended(0, supporter.address)).to.equal(true);
      expect(await contract.hasWitnessed(0, supporter.address)).to.equal(true);

      await expect(contract.connect(supporter).recommend(0, 0)).to.be.revertedWith("Already recommended");
      await expect(contract.connect(supporter).witness(0)).to.be.revertedWith("Already witnessed");
    });

    it("prevents engaging with unapproved submissions", async function () {
      const { contract, curator, creatorA, supporter } = await deployFixture();
      await createExhibition(contract, curator);
      await contract.connect(creatorA).submitToExhibition(0, "creation", "QmCreation", "Creation", "Pending");

      await expect(contract.connect(supporter).recommend(0, 0)).to.be.revertedWith("Submission unavailable");
      await expect(contract.connect(supporter).witness(0)).to.be.revertedWith("Submission unavailable");
    });
  });

  describe("tips and stake withdrawal", function () {
    it("tracks exhibition tips and lets curator withdraw them", async function () {
      const { contract, curator, supporter } = await deployFixture();
      await createExhibition(contract, curator);

      await contract.connect(supporter).tipExhibition(0, { value: ethers.parseEther("0.25") });
      expect((await contract.getExhibition(0)).tipPool).to.equal(ethers.parseEther("0.25"));

      await expect(() => contract.connect(curator).withdrawTips(0)).to.changeEtherBalances(
        [contract, curator],
        [ethers.parseEther("-0.25"), ethers.parseEther("0.25")]
      );
      expect((await contract.getExhibition(0)).tipPool).to.equal(0n);
    });

    it("allows stake withdrawal after enough submissions", async function () {
      const { contract, curator, creatorA } = await deployFixture();
      await createExhibition(contract, curator);

      for (let i = 0; i < 10; i++) {
        await contract.connect(creatorA).submitToExhibition(
          0,
          i % 2 === 0 ? "evidence" : "creation",
          `QmPayload-${i}`,
          `Title-${i}`,
          "Desc"
        );
      }

      await expect(() => contract.connect(curator).withdrawStake(0)).to.changeEtherBalances(
        [contract, curator],
        [ethers.parseEther("-0.001"), ethers.parseEther("0.001")]
      );

      expect((await contract.getExhibition(0)).stakeWithdrawn).to.equal(true);
    });
  });
});
