import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  WelcomeMint,
  ServiceMint,
  ServiceBurn,
} from "../generated/HerTimeToken/HerTimeToken"
import { Member, HRTFlow } from "../generated/schema"

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

export function handleWelcomeMint(event: WelcomeMint): void {
  const member = getOrCreateMember(event.params.member, event.block.timestamp)
  member.hrtEarned = member.hrtEarned.plus(event.params.amount)
  member.save()

  const flow = new HRTFlow(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  flow.type = "welcome"
  flow.member = member.id
  flow.amount = event.params.amount
  flow.serviceId = null
  flow.timestamp = event.block.timestamp
  flow.blockNumber = event.block.number
  flow.save()
}

export function handleServiceMint(event: ServiceMint): void {
  const member = getOrCreateMember(event.params.provider, event.block.timestamp)
  member.hrtEarned = member.hrtEarned.plus(event.params.amount)
  member.save()

  const flow = new HRTFlow(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  flow.type = "earn"
  flow.member = member.id
  flow.amount = event.params.amount
  flow.serviceId = event.params.serviceId
  flow.timestamp = event.block.timestamp
  flow.blockNumber = event.block.number
  flow.save()
}

export function handleServiceBurn(event: ServiceBurn): void {
  const member = getOrCreateMember(event.params.requester, event.block.timestamp)
  member.hrtSpent = member.hrtSpent.plus(event.params.amount)
  member.save()

  const flow = new HRTFlow(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())
  flow.type = "spend"
  flow.member = member.id
  flow.amount = event.params.amount
  flow.serviceId = event.params.serviceId
  flow.timestamp = event.block.timestamp
  flow.blockNumber = event.block.number
  flow.save()
}
