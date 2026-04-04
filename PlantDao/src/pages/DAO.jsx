import { useState, useEffect } from 'react'
import { useWeb3 } from '../web3/Web3Context'

const CATEGORY_NAMES = ['活动', '经济', '功能']
const CATEGORY_COLORS = { 0: 'bg-pink-100 text-pink-600', 1: 'bg-yellow-100 text-yellow-600', 2: 'bg-blue-100 text-blue-600' }
const STATE_NAMES = ['投票中', '已通过', '已结束']
const STATE_COLORS = { 0: 'bg-plant-400/15 text-plant-600', 1: 'bg-green-100 text-green-600', 2: 'bg-gray-100 text-gray-500' }

export default function DAO() {
  const { account, contracts, formatEther } = useWeb3()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [txStatus, setTxStatus] = useState('')
  const [votingPower, setVotingPower] = useState(0)
  const [pleafBalance, setPleafBalance] = useState('0')
  const [seedBalance, setSeedBalance] = useState('0')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState(0)

  const loadDAO = async () => {
    if (!contracts.plantDAO || !account) return
    try {
      setLoading(true)
      const count = await contracts.plantDAO.proposalCount()
      const list = []
      for (let i = 1; i <= Number(count); i++) {
        try {
          const info = await contracts.plantDAO.getProposalInfo(i)
          const voted = await contracts.plantDAO.hasVoted(i, account)
          list.push({
            id: i, title: info.title, description: info.description,
            proposer: info.proposer, category: Number(info.category),
            createdTime: Number(info.createdTime), votingDeadline: Number(info.votingDeadline),
            votesFor: Number(info.votesFor), votesAgainst: Number(info.votesAgainst),
            state: Number(info.state), voted,
          })
        } catch {}
      }
      setProposals(list.reverse())
      const vp = await contracts.plantDAO.getVotingPower(account)
      setVotingPower(Number(formatEther(vp)))
      const pb = await contracts.pleafToken.balanceOf(account)
      setPleafBalance(parseFloat(formatEther(pb)).toFixed(2))
      const sb = await contracts.seedToken.balanceOf(account)
      setSeedBalance(parseFloat(formatEther(sb)).toFixed(1))
    } catch (e) { console.error('加载DAO失败:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadDAO() }, [account, contracts])

  const createProposal = async () => {
    if (!contracts.plantDAO || !newTitle || !newDesc) return
    setTxStatus('⏳ 创建提案中...')
    try {
      const tx = await contracts.plantDAO.createProposal(newTitle, newDesc, newCategory)
      await tx.wait()
      setTxStatus('✅ 提案创建成功！')
      setNewTitle(''); setNewDesc(''); setShowCreateForm(false)
      loadDAO()
    } catch (err) { setTxStatus('❌ 创建失败: ' + (err.reason || err.message)) }
  }

  const voteOnProposal = async (proposalId, support) => {
    if (!contracts.plantDAO) return
    setTxStatus('⏳ 投票中...')
    try {
      const tx = await contracts.plantDAO.vote(proposalId, support)
      await tx.wait()
      setTxStatus('✅ 投票成功！')
      loadDAO()
    } catch (err) { setTxStatus('❌ 投票失败: ' + (err.reason || err.message)) }
  }

  const finalize = async (proposalId) => {
    if (!contracts.plantDAO) return
    setTxStatus('⏳ 结算中...')
    try {
      const tx = await contracts.plantDAO.finalizeProposal(proposalId)
      await tx.wait()
      setTxStatus('✅ 提案已结算！')
      loadDAO()
    } catch (err) { setTxStatus('❌ 结算失败: ' + (err.reason || err.message)) }
  }

  const filtered = proposals.filter(p => filterStatus === 'all' || String(p.state) === filterStatus)
  const displayAddr = account ? account.slice(0, 6) + '...' + account.slice(-4) : ''

  return (
    <div className="space-y-6">
      {txStatus && (
        <div className={`glass-card p-3 text-sm ${txStatus.startsWith('✅') ? 'text-green-600' : txStatus.startsWith('❌') ? 'text-red-500' : 'text-yellow-600'}`}>{txStatus}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏛️ DAO 治理</h2>
          <p className="text-sm text-gray-400">共同决定 Plant DAO 的未来</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-glow flex items-center gap-2">
          <span>📝</span><span>发起提案</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📝 新提案</h3>
          <div className="space-y-3">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              placeholder="提案标题" className="w-full px-4 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400" />
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              placeholder="提案描述" rows={3} className="w-full px-4 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400" />
            <div className="flex items-center gap-4">
              <select value={newCategory} onChange={(e) => setNewCategory(Number(e.target.value))}
                className="px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm">
                <option value={0}>活动</option><option value={1}>经济</option><option value={2}>功能</option>
              </select>
              <button onClick={createProposal} className="btn-glow text-sm px-6 py-2">提交提案</button>
              <button onClick={() => setShowCreateForm(false)} className="text-sm text-gray-400 hover:text-gray-600">取消</button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3"><span className="text-3xl">🧑‍🌾</span><p className="text-sm font-semibold text-gray-800">{displayAddr}</p></div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center"><p className="text-lg font-bold text-plant-600">{seedBalance}</p><p className="text-xs text-gray-400">🌱 $SEED</p></div>
          <div className="text-center"><p className="text-lg font-bold text-gold-400">{pleafBalance}</p><p className="text-xs text-gray-400">🍃 $PLEAF</p></div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center"><p className="text-lg font-bold text-plant-600">{votingPower.toFixed(2)}</p><p className="text-xs text-gray-400">🗳️ 投票权</p></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[{ id: 'all', label: '全部提案' }, { id: '0', label: '投票中' }, { id: '1', label: '已通过' }, { id: '2', label: '已结束' }].map(tab => (
          <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === tab.id ? 'bg-plant-400 text-white shadow-glow' : 'glass-card text-gray-600 hover:text-plant-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="text-4xl animate-spin inline-block">🏛️</span><p className="text-gray-400 mt-4">Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center"><span className="text-6xl">📋</span><p className="text-gray-500 mt-4">暂无提案</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => {
            const total = p.votesFor + p.votesAgainst
            const forPct = total > 0 ? (p.votesFor / total * 100).toFixed(1) : '0.0'
            const againstPct = total > 0 ? (p.votesAgainst / total * 100).toFixed(1) : '0.0'
            const isExpired = Date.now() > p.votingDeadline * 1000
            return (
              <div key={p.id} className="glass-card p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-800">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATE_COLORS[p.state]}`}>{STATE_NAMES[p.state]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[p.category] || CATEGORY_COLORS[0]}`}>{CATEGORY_NAMES[p.category]}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-plant-600">👍 赞成 {forPct}%</span>
                    <span className="text-xs text-red-500">👎 反对 {againstPct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-plant-400 to-plant-500" style={{ width: forPct + '%' }}></div>
                    <div className="h-full bg-gradient-to-r from-red-300 to-red-400" style={{ width: againstPct + '%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>提案者: {p.proposer.slice(0, 6)}...{p.proposer.slice(-4)}</span>
                    <span>总票数: {total.toLocaleString()}</span>
                    {p.voted && <span className="text-plant-600">✓ 已投票</span>}
                  </div>
                  <span>{new Date(p.createdTime * 1000).toLocaleDateString()}</span>
                </div>
                {p.state === 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => voteOnProposal(p.id, true)} disabled={p.voted}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm ${p.voted ? 'bg-gray-100 text-gray-400' : 'bg-plant-400/10 text-plant-600 hover:bg-plant-400/20'}`}>
                      👍 赞成
                    </button>
                    <button onClick={() => voteOnProposal(p.id, false)} disabled={p.voted}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm ${p.voted ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                      👎 反对
                    </button>
                    {isExpired && <button onClick={() => finalize(p.id)} className="btn-gold text-sm px-4 py-2.5">结算</button>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}