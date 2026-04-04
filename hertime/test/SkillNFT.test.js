const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerTimeSkillNFT", function () {
  let skillNFT, reputation, owner, alice, bob;

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
  });

  it("Soulbound: 转让 NFT revert", async function () {
    // Admin 手动授予危机支持者 NFT
    await skillNFT.grantCrisisSupporter(alice.address);
    const tokenId = await skillNFT.tokenIdOf(alice.address, 5); // CRISIS_SUPPORTER = 5

    await expect(
      skillNFT.connect(alice).transferFrom(alice.address, bob.address, tokenId)
    ).to.be.revertedWith("Soulbound: non-transferable");
  });

  it("grantCrisisSupporter: admin 手动授予", async function () {
    await skillNFT.grantCrisisSupporter(alice.address);
    expect(await skillNFT.hasSkill(alice.address, 5)).to.be.true; // CRISIS_SUPPORTER = 5
  });

  it("达到条件自动 mint 倾听者 NFT", async function () {
    // 需要情感支持 5 次（tag=1），均分 >= 4.5
    // 模拟 5 次服务 + 高评分
    for (let i = 0; i < 5; i++) {
      const sid = ethers.keccak256(ethers.toUtf8Bytes(`service-${i}`));
      await reputation.unlockRating(sid, bob.address, alice.address, 1);
      await reputation.connect(bob).submitRating(sid, 5, ethers.ZeroHash);
      await reputation.connect(alice).submitRating(sid, 5, ethers.ZeroHash);
    }

    expect(await skillNFT.hasSkill(alice.address, 0)).to.be.true; // LISTENER = 0
    expect(await skillNFT.balanceOf(alice.address)).to.be.gte(1);
  });

  it("getSkills: 返回 bool[6] 技能数组", async function () {
    const skills = await skillNFT.getSkills(alice.address);
    expect(skills.length).to.equal(6);
    skills.forEach(s => expect(s).to.be.false);
  });
});
