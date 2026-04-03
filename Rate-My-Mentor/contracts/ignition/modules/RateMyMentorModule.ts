import { buildModule } from "@nomicfoundation/ignition-core";

const RateMyMentorModule = buildModule("RateMyMentorModule", (m) => {
  // 1. 部署 InternSBT
  const deployer = m.getAccount(0);
  const internSBT = m.contract("InternSBT", [deployer]);

  // 2. 部署 ReviewContract
  const reviewContract = m.contract("ReviewContract", [internSBT]);

  // 3. 部署 ReviewDAO
  const votingDuration = 60;
  const timelockDuration = 60;
  const reviewDAO = m.contract("ReviewDAO", [
    internSBT,
    votingDuration,
    timelockDuration
  ]);

  // 4. 自动化配置
  m.call(reviewDAO, "setReviewContract", [reviewContract]);
  m.call(reviewContract, "transferOwnership", [reviewDAO]);

  return { internSBT, reviewContract, reviewDAO };
});

export default RateMyMentorModule;