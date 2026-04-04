import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  RatingSubmitted,
  ReputationUpdated,
  ServiceRecorded,
} from "../generated/HerTimeReputation/HerTimeReputation"
import { Member, Rating } from "../generated/schema"

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

export function handleRatingSubmitted(event: RatingSubmitted): void {
  const id = event.params.serviceId.toHexString() + "-" + event.params.rater.toHexString().toLowerCase()
  const rating = new Rating(id)
  rating.serviceId = event.params.serviceId
  rating.rater = event.params.rater
  rating.submittedAt = event.block.timestamp
  rating.revealed = false
  rating.save()
}

export function handleReputationUpdated(event: ReputationUpdated): void {
  const member = getOrCreateMember(event.params.member, event.block.timestamp)
  member.avgScore = event.params.newAvgScoreX100
  member.save()
}

export function handleServiceRecorded(event: ServiceRecorded): void {
  const member = getOrCreateMember(event.params.provider, event.block.timestamp)
  member.servicesProvided = member.servicesProvided + 1
  member.save()
}
