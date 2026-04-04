import { expect } from "chai";
import { ethers } from "hardhat";

describe("SoundRegistry", function () {
  it("saves sound data and emits SoundCreated", async function () {
    const [owner] = await ethers.getSigners();
    const registry = await ethers.deployContract("SoundRegistry");
    await registry.waitForDeployment();

    const contentUri = "ipfs://bafybeigdyrzt3example";
    const tx = await registry.createSound(contentUri);

    await expect(tx)
      .to.emit(registry, "SoundCreated")
      .withArgs(0n, owner.address, contentUri);

    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt!.blockNumber);

    const sound = await registry.getSound(0n);
    expect(sound.owner).to.equal(owner.address);
    expect(sound.contentUri).to.equal(contentUri);
    expect(sound.createdAt).to.equal(block!.timestamp);

    expect(await registry.nextId()).to.equal(1n);
  });

  it("rejects empty content uri", async function () {
    const registry = await ethers.deployContract("SoundRegistry");
    await registry.waitForDeployment();

    await expect(registry.createSound("")).to.be.revertedWith("EMPTY_CONTENT_URI");
  });

  it("reverts when sound does not exist", async function () {
    const registry = await ethers.deployContract("SoundRegistry");
    await registry.waitForDeployment();

    await expect(registry.getSound(0n)).to.be.revertedWith("SOUND_NOT_FOUND");
  });
});
