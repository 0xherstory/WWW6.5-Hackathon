import { Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  ServicePosted,
  ServiceMatched,
  ServiceCompleted,
  ServiceCancelled,
  MemberRegistered,
} from "../generated/HerTimeService/HerTimeService"
import { Service, Member } from "../generated/schema"

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

export function handleMemberRegistered(event: MemberRegistered): void {
  getOrCreateMember(event.params.member, event.block.timestamp)
}

export function handleServicePosted(event: ServicePosted): void {
  const id = event.params.id.toHexString()
  const service = new Service(id)

  // 匿名服务 requester 为 address(0)，actualRequester 从 tx 发起人推断
  // 注意：ServicePosted 没有 actualRequester，只有 id/tag/numHours/isAnonymous
  // actualRequester = tx.from（发布者）
  const txFrom = event.transaction.from
  service.requester = event.params.isAnonymous
    ? Bytes.fromHexString("0x0000000000000000000000000000000000000000")
    : txFrom
  service.actualRequester = txFrom
  service.provider = null
  service.tag = event.params.tag
  service.numHours = event.params.numHours
  service.status = 0 // OPEN
  service.isAnonymous = event.params.isAnonymous
  service.createdAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.completedAt = null
  service.cancelledAt = null
  service.save()

  // 更新发起人服务计数
  const member = getOrCreateMember(txFrom, event.block.timestamp)
  member.servicesRequested = member.servicesRequested + 1
  member.save()
}

export function handleServiceMatched(event: ServiceMatched): void {
  const id = event.params.id.toHexString()
  const service = Service.load(id)
  if (!service) return
  service.provider = event.params.provider
  service.status = 1 // MATCHED
  service.updatedAt = event.block.timestamp
  service.save()
}

export function handleServiceCompleted(event: ServiceCompleted): void {
  const id = event.params.id.toHexString()
  const service = Service.load(id)
  if (!service) return
  service.status = 2 // COMPLETED
  service.completedAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.save()
}

export function handleServiceCancelled(event: ServiceCancelled): void {
  const id = event.params.id.toHexString()
  const service = Service.load(id)
  if (!service) return
  service.status = 3 // CANCELLED
  service.cancelledAt = event.block.timestamp
  service.updatedAt = event.block.timestamp
  service.save()
}
