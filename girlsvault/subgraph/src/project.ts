import {
  Donated,
  ProofSubmitted,
  MilestoneVerified,
  FundsReleased,
  MilestoneChallenged,
  ChallengeVoted,
  ChallengeResolved,
  ValidatorStaked,
  ValidatorSlashed,
  EmergencyVoted,
  EmergencyRefundApproved,
} from "../generated/templates/GirlsVaultProject/GirlsVaultProject";
import { Project, Donation, ProofSubmission, FundRelease, Challenge, ChallengeVote, ValidatorStake, ProjectEvent } from "../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";

// ── 工具函数 ─────────────────────────────────────────────

function challengeId(projectAddr: string, milestoneId: i32): string {
  return projectAddr + "-" + milestoneId.toString();
}

function validatorStakeId(projectAddr: string, validator: string): string {
  return projectAddr + "-" + validator;
}

function saveProjectEvent(
  event: ethereum.Event,
  eventType: string,
  milestoneId: i32,
  upheld: boolean
): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let pe = new ProjectEvent(id);
  pe.project = event.address.toHexString();
  pe.eventType = eventType;
  pe.milestoneId = milestoneId;
  pe.upheld = upheld;
  pe.timestamp = event.block.timestamp;
  pe.blockNumber = event.block.number;
  pe.txHash = event.transaction.hash.toHexString();
  pe.save();
}

// ── 捐款 ─────────────────────────────────────────────────

export function handleDonated(event: Donated): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let donation = new Donation(id);
  donation.project = event.address.toHexString();
  donation.donor = event.params.donor.toHexString();
  donation.amount = event.params.amount;
  donation.tag = event.params.tag;
  donation.timestamp = event.block.timestamp;
  donation.txHash = event.transaction.hash.toHexString();
  donation.save();

  // 更新项目总捐款额
  let project = Project.load(event.address.toHexString());
  if (project != null) {
    project.totalDonated = project.totalDonated.plus(event.params.amount);
    project.save();
  }
}

// ── 验证人提交证明 ──────────────────────────────────────

export function handleProofSubmitted(event: ProofSubmitted): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let proof = new ProofSubmission(id);
  proof.project = event.address.toHexString();
  proof.milestoneId = event.params.milestoneId.toI32();
  proof.validator = event.params.validator.toHexString();
  proof.proofHash = event.params.proofHash;
  proof.proofUri = event.params.proofUri;
  proof.timestamp = event.block.timestamp;
  proof.txHash = event.transaction.hash.toHexString();
  proof.save();
}

// ── 里程碑验证通过 ─────────────────────────────────────

export function handleMilestoneVerified(event: MilestoneVerified): void {
  saveProjectEvent(event, "MilestoneVerified", event.params.milestoneId.toI32(), false);
}

// ── 资金释放 ───────────────────────────────────────────

export function handleFundsReleased(event: FundsReleased): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let release = new FundRelease(id);
  release.project = event.address.toHexString();
  release.milestoneId = event.params.milestoneId.toI32();
  release.beneficiary = event.params.beneficiary.toHexString();
  release.amount = event.params.amount;
  release.timestamp = event.block.timestamp;
  release.txHash = event.transaction.hash.toHexString();
  release.save();

  // 更新项目已释放总额
  let project = Project.load(event.address.toHexString());
  if (project != null) {
    project.totalReleased = project.totalReleased.plus(event.params.amount);
    project.save();
  }

  saveProjectEvent(event, "FundsReleased", event.params.milestoneId.toI32(), false);
}

// ── 举报提交 ───────────────────────────────────────────

export function handleMilestoneChallenged(event: MilestoneChallenged): void {
  let id = challengeId(event.address.toHexString(), event.params.milestoneId.toI32());
  let challenge = new Challenge(id);
  challenge.project = event.address.toHexString();
  challenge.milestoneId = event.params.milestoneId.toI32();
  challenge.challenger = event.params.challenger.toHexString();
  challenge.evidenceCID = event.params.evidenceCID;
  challenge.challengedAt = event.block.timestamp;
  challenge.forVotes = BigInt.fromI32(0);
  challenge.againstVotes = BigInt.fromI32(0);
  challenge.resolved = false;
  challenge.upheld = false;
  challenge.save();

  saveProjectEvent(event, "MilestoneChallenged", event.params.milestoneId.toI32(), false);
}

// ── 举报投票 ───────────────────────────────────────────

export function handleChallengeVoted(event: ChallengeVoted): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let vote = new ChallengeVote(id);
  let cid = challengeId(event.address.toHexString(), event.params.milestoneId.toI32());
  vote.challenge = cid;
  vote.voter = event.params.voter.toHexString();
  vote.support = event.params.support;
  vote.weight = event.params.weight;
  vote.timestamp = event.block.timestamp;
  vote.save();

  // 更新举报票数
  let challenge = Challenge.load(cid);
  if (challenge != null) {
    if (event.params.support) {
      challenge.forVotes = challenge.forVotes.plus(event.params.weight);
    } else {
      challenge.againstVotes = challenge.againstVotes.plus(event.params.weight);
    }
    challenge.save();
  }
}

// ── 举报结算 ───────────────────────────────────────────

export function handleChallengeResolved(event: ChallengeResolved): void {
  let cid = challengeId(event.address.toHexString(), event.params.milestoneId.toI32());
  let challenge = Challenge.load(cid);
  if (challenge != null) {
    challenge.resolved = true;
    challenge.upheld = event.params.upheld;
    challenge.save();
  }

  saveProjectEvent(event, "ChallengeResolved", event.params.milestoneId.toI32(), event.params.upheld);
}

// ── 验证人质押 ─────────────────────────────────────────

export function handleValidatorStaked(event: ValidatorStaked): void {
  let id = validatorStakeId(event.address.toHexString(), event.params.validator.toHexString());
  let stake = ValidatorStake.load(id);
  if (stake == null) {
    stake = new ValidatorStake(id);
    stake.project = event.address.toHexString();
    stake.validator = event.params.validator.toHexString();
    stake.slashed = false;
  }
  stake.amount = event.params.amount;
  stake.timestamp = event.block.timestamp;
  stake.save();
}

// ── 验证人被罚没 ───────────────────────────────────────

export function handleValidatorSlashed(event: ValidatorSlashed): void {
  let id = validatorStakeId(event.address.toHexString(), event.params.validator.toHexString());
  let stake = ValidatorStake.load(id);
  if (stake != null) {
    stake.slashed = true;
    stake.amount = BigInt.fromI32(0);
    stake.save();
  }
}

// ── 紧急退款投票 ───────────────────────────────────────

export function handleEmergencyVoted(event: EmergencyVoted): void {
  saveProjectEvent(event, "EmergencyVoted", -1, false);
}

// ── 紧急退款批准 ───────────────────────────────────────

export function handleEmergencyRefundApproved(event: EmergencyRefundApproved): void {
  let project = Project.load(event.address.toHexString());
  if (project != null) {
    project.emergencyApproved = true;
    project.save();
  }

  saveProjectEvent(event, "EmergencyRefundApproved", -1, false);
}
