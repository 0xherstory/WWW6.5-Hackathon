const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerTimeToken", function () {
  let token, service, owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("HerTimeToken");
    token = await Token.deploy();

    // 模拟 service 合约用 owner 地址（授予角色）
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
    await token.grantRole(MINTER_ROLE, owner.address);
    await token.grantRole(BURNER_ROLE, owner.address);
  });

  it("welcomeMint: 新成员获得 2 HRT", async function () {
    await token.welcomeMint(alice.address);
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("2"));
  });

  it("welcomeMint: 不能重复注册", async function () {
    await token.welcomeMint(alice.address);
    await expect(token.welcomeMint(alice.address)).to.be.revertedWith("Already registered");
  });

  it("mintForService: mint 正确数量", async function () {
    const serviceId = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await token.mintForService(alice.address, 2, serviceId);
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("2"));
  });

  it("burnForService: burn 正确数量", async function () {
    await token.welcomeMint(alice.address);
    const serviceId = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await token.burnForService(alice.address, 1, serviceId);
    expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("1"));
  });

  it("burnForService: 余额不足 revert", async function () {
    const serviceId = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await expect(token.burnForService(alice.address, 1, serviceId))
      .to.be.revertedWith("Insufficient HRT balance");
  });

  it("无权限调用 mintForService revert", async function () {
    const serviceId = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await expect(token.connect(alice).mintForService(alice.address, 1, serviceId))
      .to.be.reverted;
  });
});
