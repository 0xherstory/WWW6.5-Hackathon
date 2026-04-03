import { expect } from "chai";
import { network } from "hardhat";
import { encodeBytes32String, getBytes, solidityPackedKeccak256 } from "ethers";

describe("InternSBT", function () {

  // ── 工具函数：生成后端签名 ────────────────────────────
  async function signMint(
    backend: any,
    userAddress: string,
    companyDomain: string,
    internStart: number,
    chainId: bigint
  ) {
    const messageHash = solidityPackedKeccak256(
      ["address", "bytes32", "uint32", "uint256"],
      [userAddress, encodeBytes32String(companyDomain), internStart, chainId]
    );
    return backend.signMessage(getBytes(messageHash));
  }

  // ── 每次测试重新部署 ──────────────────────────────────
  async function setup() {
    const { ethers } = await network.connect();

    const signers = await ethers.getSigners();
    const backend = signers[1];
    const user1 = signers[2];
    const user2 = signers[3];

    const InternSBT = await ethers.getContractFactory("InternSBT");
    const sbt = await InternSBT.deploy(backend.address);

    const chainId = (await ethers.provider.getNetwork()).chainId;

    return { sbt, backend, user1, user2, chainId };
  }

  // ── 测试1：正常 mint ──────────────────────────────────
  it("应该能正常铸造 SBT", async function () {
    const { sbt, backend, user1, chainId } = await setup();

    const companyDomain = "bytedance.com";
    const internStart = 1700000000;

    const signature = await signMint(
      backend, user1.address, companyDomain, internStart, chainId
    );

    await sbt.connect(user1).mintSBT(
      encodeBytes32String(companyDomain),
      internStart,
      signature
    );

    expect(await sbt.hasSBT(user1.address)).to.equal(true);
    const cred = await sbt.credentials(user1.address);
    expect(cred.isVerified).to.equal(true);
  });

  // ── 测试2：不能 mint 两次 ─────────────────────────────
  it("同一个钱包不能铸造两次", async function () {
    const { sbt, backend, user1, chainId } = await setup();

    const companyDomain = "bytedance.com";
    const internStart = 1700000000;

    const signature = await signMint(
      backend, user1.address, companyDomain, internStart, chainId
    );

    await sbt.connect(user1).mintSBT(
      encodeBytes32String(companyDomain),
      internStart,
      signature
    );

    await expect(
      sbt.connect(user1).mintSBT(
        encodeBytes32String(companyDomain),
        internStart,
        signature
      )
    ).to.be.revertedWith("Already has SBT");
  });

  // ── 测试3：签名无效不能 mint ──────────────────────────
  it("无效签名不能铸造", async function () {
    const { sbt, user1, user2, chainId } = await setup();

    const companyDomain = "bytedance.com";
    const internStart = 1700000000;

    const fakeSignature = await signMint(
      user2, user1.address, companyDomain, internStart, chainId
    );

    await expect(
      sbt.connect(user1).mintSBT(
        encodeBytes32String(companyDomain),
        internStart,
        fakeSignature
      )
    ).to.be.revertedWith("Invalid signature");
  });

  // ── 测试4：SBT 不能转让 ───────────────────────────────
  it("SBT 不能转让给其他人", async function () {
    const { sbt, backend, user1, user2, chainId } = await setup();

    const companyDomain = "bytedance.com";
    const internStart = 1700000000;

    const signature = await signMint(
      backend, user1.address, companyDomain, internStart, chainId
    );

    await sbt.connect(user1).mintSBT(
      encodeBytes32String(companyDomain),
      internStart,
      signature
    );

    await expect(
      sbt.connect(user1).transferFrom(user1.address, user2.address, 0)
    ).to.be.revertedWith("SBT: non-transferable");
  });

});