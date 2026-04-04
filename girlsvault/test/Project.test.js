const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GirlsVaultProject", function () {
  let registry, project;
  let owner, donor, beneficiary, validatorA, validatorB, validatorC, stranger;

  const TAG_FOOD = 1; // enum Tag { EDUCATION=0, FOOD=1, ... }
  const PROOF_A = ethers.keccak256(ethers.toUtf8Bytes("proof_from_validator_A"));
  const PROOF_B = ethers.keccak256(ethers.toUtf8Bytes("proof_from_validator_B"));

  beforeEach(async function () {
    [owner, donor, beneficiary, validatorA, validatorB, validatorC, stranger] =
      await ethers.getSigners();

    // 部署 Registry
    const Registry = await ethers.getContractFactory("GirlsVaultRegistry");
    registry = await Registry.deploy();

    // 通过 Registry 创建项目（2-of-3 多签）
    const tx = await registry.createProject(
      "云南女童教育项目",
      "为云南偏远地区女童提供教育资助",
      beneficiary.address,
      [validatorA.address, validatorB.address, validatorC.address],
      2
    );
    const receipt = await tx.wait();

    // 从事件拿到 project 地址
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "ProjectCreated"
    );
    const projectAddress = event.args.projectAddress;
    project = await ethers.getContractAt("GirlsVaultProject", projectAddress);

    // 添加 3 个里程碑（合计 10000 basis points = 100%）
    await project.addMilestone("女童入学注册确认", 3000);  // M0: 30%
    await project.addMilestone("学期中期物资发放确认", 3000); // M1: 30%
    await project.addMilestone("学期结束出勤确认", 4000);   // M2: 40%
  });

  it("捐款后 tagBalance 正确增加", async function () {
    const amount = ethers.parseEther("100");
    await project.connect(donor).donate(TAG_FOOD, { value: amount });

    expect(await project.getTagBalance(TAG_FOOD)).to.equal(amount);
    expect(await project.totalDonated()).to.equal(amount);
  });

  it("捐款金额为 0 应 revert", async function () {
    await expect(
      project.connect(donor).donate(TAG_FOOD, { value: 0 })
    ).to.be.revertedWith("Amount must > 0");
  });

  it("非 Validator 调用 submitProof 应 revert", async function () {
    await project.connect(donor).donate(TAG_FOOD, { value: ethers.parseEther("100") });

    await expect(
      project.connect(stranger).submitProof(0, PROOF_A)
    ).to.be.revertedWith("Not a validator");
  });

  it("同一 Validator 重复提交应 revert", async function () {
    await project.connect(donor).donate(TAG_FOOD, { value: ethers.parseEther("100") });
    await project.connect(validatorA).submitProof(0, PROOF_A);

    await expect(
      project.connect(validatorA).submitProof(0, PROOF_A)
    ).to.be.revertedWith("Already submitted");
  });

  it("2-of-3 满足后自动释放 30% 资金", async function () {
    const donateAmount = ethers.parseEther("100");
    await project.connect(donor).donate(TAG_FOOD, { value: donateAmount });

    const beneficiaryBefore = await ethers.provider.getBalance(beneficiary.address);

    // 第 1 个验证，未达到阈值
    await project.connect(validatorA).submitProof(0, PROOF_A);
    let info = await project.getMilestoneInfo(0);
    expect(info.status).to.equal(0); // PENDING

    // 第 2 个验证，触发释放
    await expect(project.connect(validatorB).submitProof(0, PROOF_B))
      .to.emit(project, "FundsReleased")
      .withArgs(0, beneficiary.address, ethers.parseEther("30"));

    const beneficiaryAfter = await ethers.provider.getBalance(beneficiary.address);
    expect(beneficiaryAfter - beneficiaryBefore).to.equal(ethers.parseEther("30"));

    // 里程碑状态变为 RELEASED
    info = await project.getMilestoneInfo(0);
    expect(info.status).to.equal(2); // RELEASED
  });

  it("里程碑已释放后再次提交应 revert", async function () {
    await project.connect(donor).donate(TAG_FOOD, { value: ethers.parseEther("100") });
    await project.connect(validatorA).submitProof(0, PROOF_A);
    await project.connect(validatorB).submitProof(0, PROOF_B); // 触发释放

    await expect(
      project.connect(validatorC).submitProof(0, ethers.keccak256(ethers.toUtf8Bytes("proof_C")))
    ).to.be.revertedWith("Not pending");
  });

  it("Registry 可查询所有项目", async function () {
    const projects = await registry.getProjects();
    expect(projects.length).to.equal(1);
    expect(projects[0]).to.equal(await project.getAddress());
  });
});
