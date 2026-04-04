import { useState } from 'react'
import { proposals, userData } from '../data/mockData'

export default function DAO() {
  const [proposalList, setProposalList] = useState(proposals)
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const vote = (id, type) => {
    setProposalList(proposalList.map(p => {
      if (p.id === id) {
        return {
          ...p,
          votesFor: type === 'for' ? p.votesFor + userData.votingPower : p.votesFor,
          votesAgainst: type === 'against' ? p.votesAgainst + userData.votingPower : p.votesAgainst,
          totalVotes: p.totalVotes + userData.votingPower,
        }
      }
      return p
    }))
  }

  const statusColors = {
    '投票中': 'bg-plant-400/15 text-plant-600',
    '已通过': 'bg-green-100 text-green-600',
    '已结束': 'bg-gray-100 text-gray-500',
  }

  const categoryColors = {
    '活动': 'bg-pink-100 text-pink-600',
    '经济': 'bg-gold-400/15 text-gold-500',
    '功能': 'bg-blue-100 text-blue-600',
  }

  const filteredProposals = proposalList.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏛️ DAO 治理</h2>
          <p className="text-sm text-gray-400">共同决定 Plant DAO 的未来</p>
        </div>
        <button className="btn-glow flex items-center gap-2">
          <span>📝</span>
          <span>发起提案</span>
        </button>
      </div>

      {/* User Info Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{userData.avatar}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{userData.level}</p>
                <p className="text-xs text-gray-400 font-mono">{userData.displayAddress}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-lg font-bold text-plant-600">{userData.seedBalance}</p>
              <p className="text-xs text-gray-400">🌱 $SEED</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gold-400">{userData.pleafBalance}</p>
              <p className="text-xs text-gray-400">🍃 $PLEAF</p>
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-lg font-bold text-plant-600">{userData.votingPower}</p>
              <p className="text-xs text-gray-400">🗳️ 投票权</p>
            </div>
          </div>
          <div className="bg-plant-400/5 rounded-xl p-3">
            <p className="text-xs text-gray-500">
              💡 持有更多 $PLEAF = 更大的投票权
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              1 $PLEAF = 1 投票权
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: '全部提案' },
          { id: '投票中', label: '投票中' },
          { id: '已通过', label: '已通过' },
          { id: '已结束', label: '已结束' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === tab.id
                ? 'bg-plant-400 text-white shadow-glow'
                : 'glass-card text-gray-600 hover:text-plant-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map(proposal => {
          const forPercentage = (proposal.votesFor / proposal.totalVotes * 100).toFixed(1)
          const againstPercentage = (proposal.votesAgainst / proposal.totalVotes * 100).toFixed(1)

          return (
            <div key={proposal.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-800">{proposal.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[proposal.status]}`}>
                      {proposal.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryColors[proposal.category]}`}>
                      {proposal.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{proposal.description}</p>
                </div>
              </div>

              {/* Vote Progress */}
              <div className="mt-4 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-plant-600 font-medium">👍 赞成 {forPercentage}%</span>
                  <span className="text-xs text-red-500 font-medium">👎 反对 {againstPercentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-plant-400 to-plant-500 transition-all duration-500"
                    style={{ width: `${forPercentage}%` }}
                  ></div>
                  <div
                    className="h-full bg-gradient-to-r from-red-300 to-red-400 transition-all duration-500"
                    style={{ width: `${againstPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span>提案者: {proposal.proposer}</span>
                  <span>总票数: {proposal.totalVotes.toLocaleString()}</span>
                </div>
                <span>截止: {proposal.endDate}</span>
              </div>

              {/* Vote Buttons */}
              {proposal.status === '投票中' && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => vote(proposal.id, 'for')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-plant-400/10 text-plant-600 font-semibold text-sm hover:bg-plant-400/20 transition-colors"
                  >
                    <span>👍</span>
                    <span>赞成</span>
                  </button>
                  <button
                    onClick={() => vote(proposal.id, 'against')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors"
                  >
                    <span>👎</span>
                    <span>反对</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}