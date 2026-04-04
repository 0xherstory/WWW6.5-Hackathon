const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerTimeReputation", function () {
  let reputation, skillNFT, owner, alice, bob;
  const SERVICE_ID = ethers.keccak256(ethers.toUtf8Bytes("service-1"));

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const SkillNFT = await ethers.getContractFactory("HerTimeSkillNFT");
    skillNFT = await SkillNFT.deploy();

    const Reputation = await ethers.getContractFactory("HerTimeReputation");
    reputation = await Reputation.deploy();

    const reputationAddr = await reputation.getAddress();
    const skillNFTAddr = await skillNFT.getAddress();

    await reputation.setSkillNFT(skillNFTAddr);
    await skillNFT.setReputation(reputationAddr);

    const SERVICE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SERVICE_CONTRACT_ROLE"));
    const REPUTATION_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REPUTATION_ROLE"));
    await reputation.grantRole(SERVICE_ROLE, owner.address);
    await skillNFT.grantRole(REPUTATION_ROLE, reputationAddr);

    // 解锁评分
    await reputation.unlockRating(SERVICE_ID, alice.address, bob.address, 1);
  });

  it("非参与方提交评分 revert", async function () {
    const [,,, stranger] = await ethers.getSigners();
    await expect(
      reputation.connect(stranger).submitRating(SERVICE_ID, 5, ethers.ZeroHash)
    ).to.be.revertedWith("Not a party to this service");
  });

  it("单方提交后声誉不更新，双方提交后更新", async function () {
    await reputation.connect(alice).submitRating(SERVICE_ID, 5, ethers.ZeroHash);
    expect(await reputation.getAvgScore(alice.address)).to.equal(0); // 还未公开

    await reputation.connect(bob).submitRating(SERVICE_ID, 4, ethers.ZeroHash);
    // 双方都提交后公开：alice 收到 4 分，bob 收到 5 分
    expect(await reputation.getAvgScore(alice.address)).to.equal(400); // 4.00 * 100
    expect(await reputation.getAvgScore(bob.address)).to.equal(500);   // 5.00 * 100
  });

  it("重复提交评分 revert", async function () {
    await reputation.connect(alice).submitRating(SERVICE_ID, 5, ethers.ZeroHash);
    await expect(
      reputation.connect(alice).submitRating(SERVICE_ID, 4, ethers.ZeroHash)
    ).to.be.revertedWith("Already submitted");
  });

  it("分数超范围 revert", async function () {
    await expect(
      reputation.connect(alice).submitRating(SERVICE_ID, 6, ethers.ZeroHash)
    ).to.be.revertedWith("Score must be 1-5");
  });

  it("评分未公开时 getMyScore revert", async function () {
    await reputation.connect(alice).submitRating(SERVICE_ID, 5, ethers.ZeroHash);
    await expect(reputation.connect(alice).getMyScore(SERVICE_ID))
      .to.be.revertedWith("Ratings not revealed yet");
  });
});
