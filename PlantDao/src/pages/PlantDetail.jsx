import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWeb3 } from '../web3/Web3Context'
import { getPlant, updatePlant, deletePlant, getCareRecords, addCareRecord, getPlantStats, ACTION_TYPES } from '../utils/plantStorage'

// 里程碑定义（静态配置数据）
const milestones = [
  { level: 5, title: '初生幼苗' },
  { level: 10, title: '茁壮成长' },
  { level: 12, title: '枝繁叶茂' },
  { level: 15, title: '生机盎然' },
  { level: 20, title: '参天大树' },
]

const SPECIES_EMOJI = { '绿萝': '🌿', '月季': '🌹', '仙人掌': '🌵', '樱花': '🌸', '石莲花': '🪴', '太阳花': '🌻' }
const RARITY_NAMES = ['常见', '稀有', '史诗', '传说']
const RARITY_COLORS = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-blue-100 text-blue-600', 2: 'bg-purple-100 text-purple-600', 3: 'bg-yellow-100 text-yellow-600' }
const EFFORT_NAMES = ['简单', '中等', '困难', '专家']

export default function PlantDetail() {
  const { id } = useParams()
  const { account, contracts } = useWeb3()

  // Detect if this is a local plant
  const isLocal = window.location.pathname.includes('/plant/local/')

  // NFT plant state
  const [plant, setPlant] = useState(null)
  const [offspring, setOffspring] = useState([])
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(true)
  const [txStatus, setTxStatus] = useState('')
  const [careLoading, setCareLoading] = useState({})

  // Local plant state
  const [localPlant, setLocalPlant] = useState(null)
  const [careRecords, setCareRecords] = useState([])
  const [plantStats, setPlantStats] = useState(null)
  const [showCareModal, setShowCareModal] = useState(false)
  const [careAction, setCareAction] = useState(null)
  const [careNote, setCareNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  // Load NFT plant
  const loadPlant = async () => {
    if (!contracts.plantNFT || !id) return
    try {
      setLoading(true)
      const attrs = await contracts.plantNFT.getPlantAttributes(id)
      const ownerAddr = await contracts.plantNFT.ownerOf(id)
      setPlant({ tokenId: Number(id), ...attrs })
      setOwner(ownerAddr)
      if (contracts.plantOffspring) {
        try {
          const ids = await contracts.plantOffspring.getOffspringOf(id)
          const list = []
          for (const oid of ids) {
            try { const o = await contracts.plantOffspring.getOffspringAttributes(oid); list.push({ tokenId: Number(oid), ...o }) } catch {}
          }
          setOffspring(list)
        } catch {}
      }
    } catch (e) { console.error('加载植物失败:', e) }
    finally { setLoading(false) }
  }

  // Load local plant
  const loadLocalPlant = () => {
    const p = getPlant(id)
    if (p) {
      setLocalPlant(p)
      setCareRecords(getCareRecords(id))
      setPlantStats(getPlantStats(id))
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLocal) {
      loadLocalPlant()
    } else {
      loadPlant()
    }
  }, [id, contracts, account])

  // NFT care action
  const performCare = async (action) => {
    if (!contracts.plantCare || !id) return
    setCareLoading(prev => ({ ...prev, [action]: true }))
    setTxStatus('')
    try {
      const q = 100
      let tx
      switch (action) {
        case 'water': tx = await contracts.plantCare.water(id, q); break
        case 'fertilize': tx = await contracts.plantCare.fertilize(id, q); break
        case 'repot': tx = await contracts.plantCare.repot(id, q); break
        case 'photo': tx = await contracts.plantCare.takePhoto(id, q); break
        case 'medicine': tx = await contracts.plantCare.applyMedicine(id, q); break
      }
      setTxStatus('⏳ 交易已提交...')
      await tx.wait()
      setTxStatus('✅ ' + action + ' 成功！获得 $SEED 奖励！')
      setTimeout(() => loadPlant(), 2000)
    } catch (err) { setTxStatus('❌ 失败: ' + (err.reason || err.message)) }
    finally { setCareLoading(prev => ({ ...prev, [action]: false })) }
  }

  // Local care action
  const handleLocalCare = (action) => {
    setCareAction(action)
    setCareNote('')
    setPhotoPreview(null)
    setShowCareModal(true)
  }

  const submitLocalCare = () => {
    if (!careAction || !id) return
    addCareRecord({
      plantId: id,
      action: careAction,
      note: careNote,
      photo: photoPreview,
    })
    // Refresh
    setLocalPlant(getPlant(id))
    setCareRecords(getCareRecords(id))
    setPlantStats(getPlantStats(id))
    setShowCareModal(false)
    setCareAction(null)
    setCareNote('')
    setPhotoPreview(null)
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('照片大小不能超过5MB'); return }
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePlant = () => {
    deletePlant(id)
    window.location.href = '/'
  }

  // Format time for timeline
  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diffMins = Math.floor((now - d) / 60000)
    const diffHours = Math.floor((now - d) / 3600000)
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const formatDateGroup = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return `${diffDays}天前`
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  }

  // Group records by date
  const groupedRecords = {}
  careRecords.forEach(r => {
    const dateKey = formatDateGroup(r.timestamp)
    if (!groupedRecords[dateKey]) groupedRecords[dateKey] = []
    groupedRecords[dateKey].push(r)
  })

  // Loading
  if (loading) return (<div className="flex items-center justify-center h-96"><div className="text-center"><span className="text-6xl animate-spin inline-block">🌱</span><p className="text-gray-400 mt-4">Loading...</p></div></div>)

  // Not found
  if (isLocal && !localPlant) return (
    <div className="text-center py-20">
      <span className="text-6xl">🏜️</span>
      <p className="text-gray-500 mt-4">植物未找到</p>
      <Link to="/" className="text-plant-600 hover:underline mt-2 inline-block">返回首页</Link>
    </div>
  )

  if (!isLocal && !plant) return (
    <div className="text-center py-20">
      <span className="text-6xl">🏜️</span>
      <p className="text-gray-500 mt-4">Plant not found</p>
      <Link to="/" className="text-plant-600 hover:underline mt-2 inline-block">Back</Link>
    </div>
  )

  // ===== LOCAL PLANT DETAIL =====
  if (isLocal && localPlant) {
    return (
      <div className="space-y-6">
        {txStatus && (<div className={`glass-card p-3 text-sm ${txStatus.startsWith('✅') ? 'text-green-600' : txStatus.startsWith('❌') ? 'text-red-500' : 'text-yellow-600'}`}>{txStatus}</div>)}

        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-plant-600"><span>←</span><span>返回首页</span></Link>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-plant-100 text-plant-600 px-2 py-1 rounded-full">本地植物 📱</span>
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">删除</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Plant Info Card */}
          <div className="glass-card p-8 flex flex-col items-center justify-center">
            <div className="w-48 h-48 rounded-3xl bg-plant-50 flex items-center justify-center text-8xl shadow-glow mb-6 float-animation">
              {localPlant.emoji || '🌱'}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{localPlant.name}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-2">{localPlant.species} · {localPlant.difficulty}</p>
            <div className="flex items-center gap-2">
              <span className={`health-dot ${localPlant.health > 60 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">健康 {localPlant.health}%</span>
            </div>
            {localPlant.note && <p className="text-xs text-gray-400 mt-3 text-center max-w-xs">{localPlant.note}</p>}
            <div className="w-full mt-6 bg-plant-400/5 rounded-xl p-4">
              <p className="text-xs font-semibold text-plant-600 mb-2">📊 植物信息</p>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between"><span>添加时间</span><span>{new Date(localPlant.createdAt).toLocaleDateString('zh-CN')}</span></div>
                <div className="flex justify-between"><span>护理次数</span><span>{plantStats?.totalCares || 0} 次</span></div>
                <div className="flex justify-between"><span>连续护理</span><span>{localPlant.careStreak} 天</span></div>
                <div className="flex justify-between"><span>照片数量</span><span>{plantStats?.photoRecords?.length || 0} 张</span></div>
              </div>
            </div>
          </div>

          {/* Stats + Care Actions */}
          <div className="col-span-2 space-y-4">
            {/* Health Stats */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">❤️ 健康状况</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">💧 水分</span><span className="text-sm font-bold text-blue-500">{localPlant.water}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${localPlant.water}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }}></div></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">☀️ 阳光</span><span className="text-sm font-bold text-yellow-500">{localPlant.sunlight}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${localPlant.sunlight}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">🌱 土壤</span><span className="text-sm font-bold text-amber-600">{localPlant.soil}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${localPlant.soil}%`, background: 'linear-gradient(90deg, #d97706, #b45309)' }}></div></div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className={`health-dot ${localPlant.health > 60 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm text-gray-600">整体健康: {localPlant.health}%</span>
                <span className="text-sm text-gray-400 ml-4">生长等级: Lv.{localPlant.growthLevel} / {localPlant.maxGrowth}</span>
              </div>
            </div>

            {/* Care Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌱 护理操作</h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { key: 'water', icon: '💧', label: '浇水', desc: '水分+20' },
                  { key: 'fertilize', icon: '🧪', label: '施肥', desc: '土壤+25' },
                  { key: 'repot', icon: '🪴', label: '换盆', desc: '土壤满' },
                  { key: 'medicine', icon: '💊', label: '用药', desc: '健康+15' },
                  { key: 'photo', icon: '📸', label: '拍照', desc: '记录照片' },
                ].map(a => (
                  <button key={a.key} onClick={() => handleLocalCare(a.key)}
                    className="btn-glow flex flex-col items-center gap-1 py-3 text-sm hover:scale-105 transition-transform">
                    <span className="text-xl">{a.icon}</span>
                    <span className="font-medium">{a.label}</span>
                    <span className="text-[10px] text-gray-400">{a.desc}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { key: 'prune', icon: '✂️', label: '修剪', desc: '健康+5' },
                  { key: 'move', icon: '🏠', label: '移动位置', desc: '记录' },
                  { key: 'note', icon: '📝', label: '备注', desc: '添加备注' },
                ].map(a => (
                  <button key={a.key} onClick={() => handleLocalCare(a.key)}
                    className="bg-gray-50 hover:bg-gray-100 rounded-xl py-2 flex flex-col items-center gap-0.5 text-sm transition-colors">
                    <span className="text-lg">{a.icon}</span>
                    <span className="text-xs font-medium text-gray-600">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            {plantStats?.photoRecords?.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📸 照片记录 ({plantStats.photoRecords.length})</h3>
                <div className="grid grid-cols-4 gap-3">
                  {plantStats.photoRecords.slice(0, 8).map(r => (
                    <div key={r.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                        <img src={r.photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 text-center">{formatTime(r.timestamp)}</p>
                      {r.note && <p className="text-[10px] text-gray-500 text-center truncate">{r.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Care Timeline */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📅 护理时间轴</h3>
          {careRecords.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📭</span>
              <p className="text-gray-400 mt-3 text-sm">还没有护理记录，开始记录吧！</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {Object.entries(groupedRecords).map(([dateLabel, dateRecords]) => (
                <div key={dateLabel}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">📅 {dateLabel}</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                  </div>
                  <div className="space-y-3 ml-4 border-l-2 border-plant-100 pl-6 relative">
                    {dateRecords.map((record) => {
                      const actionInfo = ACTION_TYPES[record.action] || ACTION_TYPES.note
                      return (
                        <div key={record.id} className="relative">
                          <div className={`absolute -left-[31px] top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            record.action === 'water' ? 'bg-blue-400' :
                            record.action === 'fertilize' ? 'bg-green-400' :
                            record.action === 'repot' ? 'bg-amber-400' :
                            record.action === 'photo' ? 'bg-cyan-400' :
                            record.action === 'medicine' ? 'bg-purple-400' :
                            record.action === 'prune' ? 'bg-teal-400' :
                            'bg-gray-400'
                          }`}></div>
                          <div className="bg-white/60 rounded-xl p-3 hover:bg-white/80 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{actionInfo.icon}</span>
                              <span className="text-sm font-semibold text-gray-700">{actionInfo.label}</span>
                              <span className="text-[10px] text-gray-400 ml-auto">{formatTime(record.timestamp)}</span>
                            </div>
                            {record.note && <p className="text-xs text-gray-500 mt-1">{record.note}</p>}
                            {record.photo && (
                              <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-gray-100">
                                <img src={record.photo} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Growth Milestones */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🌟 增长里程碑</h3>
          <div className="flex items-center gap-4">
            {milestones.map((m, idx) => {
              const achieved = localPlant.growthLevel >= m.level
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${achieved ? 'bg-plant-400 text-white shadow-glow' : 'bg-gray-100 text-gray-400'}`}>
                    {achieved ? '⭐' : '🔒'}
                  </div>
                  <p className={`text-xs mt-2 font-semibold ${achieved ? 'text-plant-600' : 'text-gray-400'}`}>Lv.{m.level}</p>
                  <p className="text-[10px] text-gray-400">{m.title}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Care Modal */}
        {showCareModal && careAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCareModal(false)}></div>
            <div className="relative glass-card w-full max-w-md mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{ACTION_TYPES[careAction]?.icon}</span>
                <h3 className="text-lg font-bold text-gray-800">{ACTION_TYPES[careAction]?.label}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">备注（可选）</label>
                  <textarea
                    value={careNote}
                    onChange={(e) => setCareNote(e.target.value)}
                    placeholder="记录一下这次操作..."
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400 resize-none"
                    rows={2}
                  />
                </div>
                {(careAction === 'photo' || careAction === 'note') && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">照片（可选）</label>
                    <div className="flex items-center gap-3">
                      {photoPreview ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-plant-400">
                          <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setPhotoPreview(null)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                        </div>
                      ) : (
                        <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-plant-400 transition-all">
                          <span className="text-xl text-gray-400">📷</span>
                          <span className="text-[10px] text-gray-400">上传照片</span>
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setShowCareModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">取消</button>
                  <button onClick={submitLocalCare} className="flex-1 btn-glow py-2 text-sm font-semibold">确认</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}></div>
            <div className="relative glass-card w-full max-w-sm mx-4 p-6 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-bold text-gray-800 mt-3">确认删除？</h3>
              <p className="text-sm text-gray-500 mt-2">删除「{localPlant.name}」及所有护理记录，此操作不可恢复。</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">取消</button>
                <button onClick={handleDeletePlant} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">确认删除</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== NFT PLANT DETAIL (original) =====
  const isOwner = account && owner.toLowerCase() === account.toLowerCase()

  return (
    <div className="space-y-6">
      {txStatus && (<div className={`glass-card p-3 text-sm ${txStatus.startsWith('✅') ? 'text-green-600' : txStatus.startsWith('❌') ? 'text-red-500' : 'text-yellow-600'}`}>{txStatus}</div>)}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-plant-600"><span>←</span><span>返回仪表盘</span></Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-3xl bg-plant-50 flex items-center justify-center text-8xl shadow-glow mb-6 float-animation">
            {SPECIES_EMOJI[plant.species] || '🌿'}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{plant.species}</h2>
            <span className="nft-badge">NFT</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">#{plant.tokenId}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${RARITY_COLORS[Number(plant.rarity)] || RARITY_COLORS[0]}`}>
            {RARITY_NAMES[Number(plant.rarity)] || '常见'}
          </span>
          <p className="text-xs text-gray-400 mt-2">权重: {Number(plant.effortWeight)}x ({EFFORT_NAMES[Number(plant.effortLevel)] || '中等'})</p>
          <div className="w-full mt-6 bg-plant-400/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-plant-600 mb-2">🔗 NFT 信息</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between"><span>Token ID</span><span className="font-mono">#{plant.tokenId}</span></div>
              <div className="flex justify-between"><span>Owner</span><span className="font-mono">{owner.slice(0, 6)}...{owner.slice(-4)}</span></div>
              <div className="flex justify-between"><span>标准</span><span className="font-mono">ERC-721</span></div>
              <div className="flex justify-between"><span>连续护理</span><span className="font-mono">{Number(plant.careStreak)} 天</span></div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 植物元数据</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-plant-50 rounded-xl p-3"><p className="text-xs text-gray-400">物种</p><p className="text-sm font-semibold text-gray-700">{plant.species}</p></div>
              <div className="bg-plant-50 rounded-xl p-3"><p className="text-xs text-gray-400">所有者</p><p className="text-sm font-semibold text-gray-700 font-mono">{owner.slice(0, 8)}...{owner.slice(-6)}</p></div>
              <div className="bg-plant-50 rounded-xl p-3"><p className="text-xs text-gray-400">稀有度</p><p className="text-sm font-semibold text-gray-700">{RARITY_NAMES[Number(plant.rarity)]}</p></div>
              <div className="bg-plant-50 rounded-xl p-3"><p className="text-xs text-gray-400">难度</p><p className="text-sm font-semibold text-gray-700">{EFFORT_NAMES[Number(plant.effortLevel)]} ({Number(plant.effortWeight)}x)</p></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">❤️ 健康状况</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">💧 水分</span><span className="text-sm font-bold text-blue-500">{Number(plant.water)}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Number(plant.water)}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }}></div></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">☀️ 阳光</span><span className="text-sm font-bold text-yellow-500">{Number(plant.sunlight)}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Number(plant.sunlight)}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-600">🌱 土壤</span><span className="text-sm font-bold text-amber-600">{Number(plant.soil)}%</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${Number(plant.soil)}%`, background: 'linear-gradient(90deg, #d97706, #b45309)' }}></div></div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`health-dot ${Number(plant.health) > 60 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-600">整体健康: {Number(plant.health)}%</span>
              <span className="text-sm text-gray-400 ml-4">生长等级: Lv.{Number(plant.growthLevel)} / {Number(plant.maxGrowth)}</span>
            </div>
          </div>

          {isOwner && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌱 护理操作 <span className="text-xs font-normal text-gray-400">（链上操作，获得 $SEED 奖励）</span></h3>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { key: 'water', icon: '💧', label: '浇水' },
                  { key: 'fertilize', icon: '🧪', label: '施肥' },
                  { key: 'repot', icon: '🪴', label: '换盆' },
                  { key: 'medicine', icon: '💊', label: '用药' },
                  { key: 'photo', icon: '📸', label: '拍照' },
                ].map(a => (
                  <button key={a.key} onClick={() => performCare(a.key)} disabled={careLoading[a.key]}
                    className={`btn-glow flex flex-col items-center gap-1 py-3 text-sm ${careLoading[a.key] ? 'opacity-50' : ''}`}>
                    <span className="text-xl">{a.icon}</span><span>{a.label}</span>
                    {careLoading[a.key] && <span className="animate-spin text-xs">⏳</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {offspring.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🌱 繁殖后代 ({offspring.length})</h3>
          <div className="grid grid-cols-4 gap-4">
            {offspring.map(o => (
              <div key={o.tokenId} className="bg-plant-50 rounded-xl p-4 text-center">
                <span className="text-3xl">{SPECIES_EMOJI[o.species] || '🌱'}</span>
                <p className="text-sm font-bold mt-2">#{o.tokenId} {o.species}</p>
                <p className="text-xs text-gray-400">Gen {Number(o.generation)} | HP {Number(o.health)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🌟 增长里程碑</h3>
        <div className="flex items-center gap-4">
          {milestones.map((m, idx) => {
            const achieved = Number(plant.growthLevel) >= m.level
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${achieved ? 'bg-plant-400 text-white shadow-glow' : 'bg-gray-100 text-gray-400'}`}>
                  {achieved ? '⭐' : '🔒'}
                </div>
                <p className={`text-xs mt-2 font-semibold ${achieved ? 'text-plant-600' : 'text-gray-400'}`}>Lv.{m.level}</p>
                <p className="text-[10px] text-gray-400">{m.title}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}