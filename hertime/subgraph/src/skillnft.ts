import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { SkillMinted } from "../generated/HerTimeSkillNFT/HerTimeSkillNFT"
import { Member, SkillBadge } from "../generated/schema"

function getOrCreateMember(address: Bytes, timestamp: BigInt): Member {
  const id = address.toHexString().toLowerCase()
  let member = Member.load(id)
  if (!member) {
    member = new Member(id)
    member.registeredAt = timestamp
    member.hrtEarned = BigInt.fromI32(0)
    member.hrtSpent = BigInt.fromI32(0)
    member.servicesProvided = 0
    member.servicesRequested = 0
    member.avgScore = BigInt.fromI32(0)
    member.save()
  }
  return member
}

export function handleSkillMinted(event: SkillMinted): void {
  const memberAddr = event.params.member.toHexString().toLowerCase()
  const skillType = event.params.skill
  const id = memberAddr + "-" + skillType.toString()

  const member = getOrCreateMember(event.params.member, event.block.timestamp)

  const badge = new SkillBadge(id)
  badge.member = member.id
  badge.skillType = skillType
  badge.tokenId = event.params.tokenId
  badge.mintedAt = event.block.timestamp
  badge.save()
}
