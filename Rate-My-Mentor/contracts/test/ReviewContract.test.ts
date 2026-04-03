import { expect } from "chai";
import { network } from "hardhat";
import { encodeBytes32String, getBytes, solidityPackedKeccak256, keccak256, toUtf8Bytes } from "ethers";

describe("ReviewContract", function () {

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

  // ── 部署两个合约 ──────────────────────────────────────
  async function setup() {
    const { ethers } = await network.connect();

    const signers = await ethers.getSigners();
    const backend = signers[1];
    const reviewer = signers[2];
    const mentor = signers[3];

    // 部署 InternSBT
    const InternSBT = await ethers.getContractFactory("InternSBT");
    const sbt = await InternSBT.deploy(backend.address);

    // 部署 ReviewContract，传入 SBT 合约地址
    const ReviewContract = await ethers.getContractFactory("ReviewContract");
    const review = await ReviewContract.deploy(await sbt.getAddress());

    const chainId = (await ethers.provider.getNetwork()).chainId;

    // 给 reviewer 铸造一个 SBT
    const companyDomain = "bytedance.com";
    const internStart = 1700000000;
    const signature = await signMint(
      backend, reviewer.address, companyDomain, internStart, chainId
    );
    await sbt.connect(reviewer).mintSBT(
      encodeBytes32String(companyDomain),
      internStart,
      signature
    );

    return { sbt, review, backend, reviewer, mentor, chainId };
  }

  // ── 工具：生成测试用的 targetId 和 credentialId ───────
  const targetId = keccak256(toUtf8Bytes("mentor:0x1234"));
  const credentialId = keccak256(toUtf8Bytes("credential:001"));
  const cid = keccak256(toUtf8Bytes("ipfs://QmTest123"));

  // ── 测试1：正常提交评价 ───────────────────────────────
  it("持有 SBT 的用户可以提交评价", async function () {
    const { review, reviewer } = await setup();

    await review.connect(reviewer).submitReview(
      targetId,
      4,        // overallScore
      cid,
    );

    const count = await review.getReviewCount(targetId);
    expect(count).to.equal(1n);
  });

  // ── 测试2：没有 SBT 不能评价 ──────────────────────────
  it("没有 SBT 不能提交评价", async function () {
    const { review, mentor } = await setup();

    await expect(
      review.connect(mentor).submitReview(
        targetId,
        4,
        cid,
      )
    ).to.be.revertedWith("No valid credential");
  });

  // ── 测试3：不能对同一个 target 评价两次 ───────────────
  it("不能对同一个 target 评价两次", async function () {
    const { review, reviewer } = await setup();

    await review.connect(reviewer).submitReview(
      targetId, 4, cid
    );

    await expect(
      review.connect(reviewer).submitReview(
        targetId, 3, cid
      )
    ).to.be.revertedWith("Already reviewed this target");
  });

  // ── 测试4：评分必须在 1-5 之间 ────────────────────────
  it("评分超出范围会被拒绝", async function () {
    const { review, reviewer } = await setup();

    await expect(
      review.connect(reviewer).submitReview(
        targetId,
        6,        // 超出范围
        cid
      )
    ).to.be.revertedWith("Score must be between 1 and 5");
  });

  // ── 测试5：聚合评分计算正确 ───────────────────────────
  it("聚合评分计算正确", async function () {
    const { review, reviewer } = await setup();

    await review.connect(reviewer).submitReview(
      targetId, 4, cid
    );

    // 4分 * 100 = 400
    const score = await review.getReputationScore(targetId);
    expect(score).to.equal(400n);
  });

it("Disputed 状态的评价不计入聚合分", async function () {
  const { review, reviewer } = await setup();

  await review.connect(reviewer).submitReview(
    targetId, 4, cid
  );

  // 检查提交后的状态
  const reviewsBefore = await review.getReviews(targetId);
  console.log("提交后 status:", reviewsBefore[0].status);
  console.log("提交后 score:", await review.getReputationScore(targetId));

  // 更新状态
  await review.updateReviewStatus(targetId, 0n, 1n);

  // 检查更新后的状态
  const reviewsAfter = await review.getReviews(targetId);
  console.log("更新后 status:", reviewsAfter[0].status);
  console.log("更新后 score:", await review.getReputationScore(targetId));

  const score = await review.getReputationScore(targetId);
expect(score).to.equal(0n);
  });

});