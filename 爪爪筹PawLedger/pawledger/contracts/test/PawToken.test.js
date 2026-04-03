const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PawToken", function () {
  let pawToken;
  let owner, minter, other;

  beforeEach(async function () {
    [owner, minter, other] = await ethers.getSigners();
    const PawToken = await ethers.getContractFactory("PawToken");
    pawToken = await PawToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("has correct name, symbol, and decimals", async function () {
      expect(await pawToken.name()).to.equal("PawToken");
      expect(await pawToken.symbol()).to.equal("$PAW");
      expect(await pawToken.decimals()).to.equal(18);
    });

    it("has zero initial supply", async function () {
      expect(await pawToken.totalSupply()).to.equal(0n);
    });

    it("sets owner correctly", async function () {
      expect(await pawToken.owner()).to.equal(owner.address);
    });

    it("minter starts as zero address", async function () {
      expect(await pawToken.minter()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("setMinter", function () {
    it("owner can set minter", async function () {
      await expect(pawToken.connect(owner).setMinter(minter.address))
        .to.emit(pawToken, "MinterSet")
        .withArgs(minter.address);
      expect(await pawToken.minter()).to.equal(minter.address);
    });

    it("non-owner cannot set minter", async function () {
      await expect(
        pawToken.connect(other).setMinter(minter.address)
      ).to.be.revertedWithCustomError(pawToken, "OwnableUnauthorizedAccount");
    });

    it("cannot set minter twice", async function () {
      await pawToken.connect(owner).setMinter(minter.address);
      await expect(
        pawToken.connect(owner).setMinter(other.address)
      ).to.be.revertedWith("Minter already set");
    });

    it("reverts on zero address", async function () {
      await expect(
        pawToken.connect(owner).setMinter(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  describe("mint", function () {
    beforeEach(async function () {
      await pawToken.connect(owner).setMinter(minter.address);
    });

    it("minter can mint tokens", async function () {
      const amount = ethers.parseEther("10");
      await pawToken.connect(minter).mint(other.address, amount);
      expect(await pawToken.balanceOf(other.address)).to.equal(amount);
      expect(await pawToken.totalSupply()).to.equal(amount);
    });

    it("non-minter cannot mint", async function () {
      await expect(
        pawToken.connect(other).mint(other.address, ethers.parseEther("10"))
      ).to.be.revertedWith("Not minter");
    });

    it("owner cannot mint (only minter can)", async function () {
      await expect(
        pawToken.connect(owner).mint(other.address, ethers.parseEther("10"))
      ).to.be.revertedWith("Not minter");
    });
  });
});
