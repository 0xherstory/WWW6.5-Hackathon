const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HerTimeService", function () {
  let token, reputation, skillNFT, service;
  let owner, xiaoli, xiaowang;

  beforeEach(async function () {
    [owner, xiaoli, xiaowang] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("HerTimeToken");
    token = await Token.deploy();

    const SkillNFT = await ethers.getContractFactory("HerTimeSkillNFT");
    skillNFT = await SkillNFT.deploy();

    const Reputation = await ethers.getContractFactory("HerTimeReputation");
    reputation = await Reputation.deploy();

    const Service = await ethers.getContractFactory("HerTimeService");
    service = await Service.deploy(await token.getAddress(), await reputation.getAddress());

    const serviceAddr = await service.getAddress();
    const reputationAddr = await reputation.getAddress();
    const skillNFTAddr = await skillNFT.getAddress();

    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
    const SERVICE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("SERVICE_CONTRACT_ROLE"));
    const REPUTATION_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REPUTATION_ROLE"));

    await token.grantRole(MINTER_ROLE, serviceAddr);
    await token.grantRole(BURNER_ROLE, serviceAddr);
    await reputation.grantRole(SERVICE_ROLE, serviceAddr);
    await reputation.setSkillNFT(skillNFTAddr);
    await skillNFT.setReputation(reputationAddr);
    await skillNFT.grantRole(REPUTATION_ROLE, reputationAddr);
  });

  async function setupAndComplete() {
    await service.connect(xiaoli).register();
    await service.connect(xiaowang).register();

    const tx = await service.connect(xiaoli).postService(0, 1, false);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => {
      try { return service.interface.parseLog(l).name === "ServicePosted"; } catch { return false; }
    });
    const serviceId = service.interface.parseLog(event).args[0];

    await service.connect(xiaowang).acceptService(serviceId);
    return serviceId;
  }

  it("register: 新成员获得 2 HRT", async function () {
    await service.connect(xiaoli).register();
    expect(await token.balanceOf(xiaoli.address)).to.equal(ethers.parseEther("2"));
  });

  it("postService: 发布成功，返回服务ID", async function () {
    await service.connect(xiaoli).register();
    const tx = await service.connect(xiaoli).postService(1, 2, false);
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });

  it("acceptService: 不能自己接自己的单", async function () {
    await service.connect(xiaoli).register();
    const tx = await service.connect(xiaoli).postService(0, 1, false);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => {
      try { return service.interface.parseLog(l).name === "ServicePosted"; } catch { return false; }
    });
    const serviceId = service.interface.parseLog(event).args[0];
    await expect(service.connect(xiaoli).acceptService(serviceId))
      .to.be.revertedWith("Cannot serve yourself");
  });

  it("confirmCompletion: 服务完成后 token 正确流转", async function () {
    const serviceId = await setupAndComplete();

    const balanceBefore = await token.balanceOf(xiaowang.address);
    await service.connect(xiaoli).confirmCompletion(serviceId);
    await service.connect(xiaowang).confirmCompletion(serviceId);

    expect(await token.balanceOf(xiaoli.address)).to.equal(ethers.parseEther("1")); // 2 - 1
    expect(await token.balanceOf(xiaowang.address)).to.equal(ethers.parseEther("3")); // 2 + 1
  });

  it("confirmCompletion: 非参与方 revert", async function () {
    const serviceId = await setupAndComplete();
    const [,,,stranger] = await ethers.getSigners();
    await expect(service.connect(stranger).confirmCompletion(serviceId))
      .to.be.revertedWith("Not a party to this service");
  });

  it("cancelService: 只能取消 OPEN 状态的服务", async function () {
    await service.connect(xiaoli).register();
    const tx = await service.connect(xiaoli).postService(0, 1, false);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => {
      try { return service.interface.parseLog(l).name === "ServicePosted"; } catch { return false; }
    });
    const serviceId = service.interface.parseLog(event).args[0];

    await service.connect(xiaoli).cancelService(serviceId);
    const s = await service.services(serviceId);
    expect(s.status).to.equal(3); // CANCELLED
  });
});
