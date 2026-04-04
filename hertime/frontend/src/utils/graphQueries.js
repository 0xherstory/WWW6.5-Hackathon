// The Graph Studio 查询端点（部署子图后替换此 URL）
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1745339/hertime/v0.0.1"

async function query(gql, variables = {}) {
  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: gql, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

// ── 需求广场：分页拉取 OPEN 服务，按发布时间倒序 ─────────────
export async function fetchOpenServices(first = 20, skip = 0) {
  const data = await query(`
    query OpenServices($first: Int!, $skip: Int!) {
      services(
        where: { status: 0 }
        orderBy: createdAt
        orderDirection: desc
        first: $first
        skip: $skip
      ) {
        id
        requester
        actualRequester
        provider
        tag
        numHours
        status
        isAnonymous
        createdAt
      }
    }
  `, { first, skip })
  return data.services
}

// ── 按服务类型过滤 OPEN 服务 ─────────────────────────────────
export async function fetchOpenServicesByTag(tag, first = 20, skip = 0) {
  const data = await query(`
    query OpenByTag($tag: Int!, $first: Int!, $skip: Int!) {
      services(
        where: { status: 0, tag: $tag }
        orderBy: createdAt
        orderDirection: desc
        first: $first
        skip: $skip
      ) {
        id
        requester
        actualRequester
        tag
        numHours
        isAnonymous
        createdAt
      }
    }
  `, { tag, first, skip })
  return data.services
}

// ── 我参与的所有服务（作为发起人或服务方）────────────────────
export async function fetchMyServices(address) {
  const addr = address.toLowerCase()
  const data = await query(`
    query MyServices($addr: Bytes!) {
      asRequester: services(where: { actualRequester: $addr }, orderBy: createdAt, orderDirection: desc) {
        id tag numHours status isAnonymous provider createdAt completedAt cancelledAt
      }
      asProvider: services(where: { provider: $addr }, orderBy: createdAt, orderDirection: desc) {
        id tag numHours status actualRequester createdAt completedAt cancelledAt
      }
    }
  `, { addr })
  return {
    posted: data.asRequester,
    accepted: data.asProvider,
  }
}

// ── 成员信息（声誉分 + HRT 流水 + 技能徽章）────────────────
export async function fetchMember(address) {
  const id = address.toLowerCase()
  const data = await query(`
    query Member($id: ID!) {
      member(id: $id) {
        id
        registeredAt
        hrtEarned
        hrtSpent
        servicesProvided
        servicesRequested
        avgScore
        skills {
          skillType
          tokenId
          mintedAt
        }
        hrtFlows(orderBy: timestamp, orderDirection: desc, first: 30) {
          type
          amount
          serviceId
          timestamp
          blockNumber
        }
      }
    }
  `, { id })
  return data.member
}

// ── 排行榜：按声誉分排名前 20 ────────────────────────────────
export async function fetchLeaderboard(first = 20) {
  const data = await query(`
    query Leaderboard($first: Int!) {
      members(
        where: { servicesProvided_gt: 0 }
        orderBy: avgScore
        orderDirection: desc
        first: $first
      ) {
        id
        avgScore
        servicesProvided
        hrtEarned
        skills { skillType }
      }
    }
  `, { first })
  return data.members
}

// ── 单个服务详情 ──────────────────────────────────────────────
export async function fetchService(serviceId) {
  const data = await query(`
    query Service($id: ID!) {
      service(id: $id) {
        id
        requester
        actualRequester
        provider
        tag
        numHours
        status
        isAnonymous
        createdAt
        completedAt
        cancelledAt
      }
    }
  `, { id: serviceId })
  return data.service
}
