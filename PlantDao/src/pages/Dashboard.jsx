import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { useWeb3 } from '../web3/Web3Context'
import { getPlants, addPlant, addCareRecord } from '../utils/plantStorage'
import AddPlantModal from '../components/AddPlantModal'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// 静态图表数据
const growthData = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    { label: '植物健康值', data: [65, 70, 72, 78, 82, 80, 85], borderColor: '#6DBE45', backgroundColor: 'rgba(109,190,69,0.1)', tension: 0.4, fill: true },
    { label: '生长等级', data: [10, 10.5, 11, 11.2, 11.5, 11.8, 12], borderColor: '#F4B400', backgroundColor: 'rgba(244,180,0,0.1)', tension: 0.4, fill: true },
  ],
}
const weeklyCareActivity = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [{ label: '护理次数', data: [3, 2, 4, 1, 3, 5, 2], backgroundColor: 'rgba(109,190,69,0.6)', borderRadius: 8 }],
}

const SPECIES_EMOJI = { '绿萝': '🌿', '月季': '🌹', '仙人掌': '🌵', '樱花': '🌸', '石莲花': '🪴', '太阳花': '🌻' }
const RARITY_NAMES = ['常见', '稀有', '史诗', '传说']
const RARITY_COLORS = ['bg-gray-100 text-gray-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600']
const EFFORT_NAMES = ['简单', '中等', '困难', '专家']

export default function Dashboard() {
  const { account, contracts, formatEther, parseEther } = useWeb3()
  const [seedBalance, setSeedBalance] = useState('0')
  const [pleafBalance, setPleafBalance] = useState('0')
  const [totalPlants, setTotalPlants] = useState(0)
  const [careStreak, setCareStreak] = useState(0)
  const [myPlants, setMyPlants] = useState([])
  const [gardenInfo, setGardenInfo] = useState(null)
  const [season, setSeason] = useState(0)
  const [ecologyIndex, setEcologyIndex] = useState(70)
  const [careLoading, setCareLoading] = useState({})
  const [convertAmount, setConvertAmount] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [showAddPlant, setShowAddPlant] = useState(false)
  const [localPlants, setLocalPlants] = useState([])

  // Care reminders - pure local state, no contract
  const [checkedReminders, setCheckedReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('careReminders') || '{}') } catch { return {} }
  })
  const toggleReminder = (id) => {
    setCheckedReminders(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('careReminders', JSON.stringify(next))
      return next
    })
  }

  const loadDashboard = async () => {
    if (!account || !contracts.seedToken) return
    try {
      const [seedBal, pleafBal] = await Promise.all([
        contracts.seedToken.balanceOf(account),
        contracts.pleafToken.balanceOf(account),
      ])
      setSeedBalance(parseFloat(formatEther(seedBal)).toFixed(1))
      setPleafBalance(parseFloat(formatEther(pleafBal)).toFixed(2))

      const total = await contracts.plantNFT.getTotalPlants()
      setTotalPlants(Number(total))

      try { const streak = await contracts.plantCare.userStreak(account); setCareStreak(Number(streak)) } catch { setCareStreak(0) }
      try { const gi = await contracts.gardenEnv.getGardenInfo(account); setGardenInfo(gi) } catch { setGardenInfo(null) }
      try { const s = await contracts.seasonManager.currentSeason(); setSeason(Number(s)) } catch {}
      try { const idx = await contracts.globalEcology.ecologyIndex(); setEcologyIndex(Number(idx)) } catch {}

      const plantList = []
      for (let tid = 1; tid <= Math.min(Number(total), 20); tid++) {
        try {
          const owner = await contracts.plantNFT.ownerOf(tid)
          if (owner.toLowerCase() === account.toLowerCase()) {
            const attrs = await contracts.plantNFT.getPlantAttributes(tid)
            plantList.push({ tokenId: tid, ...attrs })
          }
        } catch { break }
      }
      setMyPlants(plantList)
    } catch (e) { console.error('加载仪表盘失败:', e) }
  }

  useEffect(() => { setLocalPlants(getPlants()) }, [])

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [account, contracts])

  const handleAddPlant = (plantData) => {
    const newPlant = addPlant(plantData)
    if (newPlant.initialPhoto) {
      addCareRecord({ plantId: newPlant.id, action: 'photo', note: '初始照片', photo: newPlant.initialPhoto })
    }
    setLocalPlants(getPlants())
    setShowAddPlant(false)
    setTxStatus(`✅ 成功添加植物「${newPlant.name}」！`)
  }

  const performCare = async (action, plantId) => {
    if (!contracts.plantCare || !plantId) return
    setCareLoading(prev => ({ ...prev, [action]: true }))
    setTxStatus('')
    try {
      const quality = 100
      let tx
      switch (action) {
        case 'water': tx = await contracts.plantCare.water(plantId, quality); break
        case 'fertilize': tx = await contracts.plantCare.fertilize(plantId, quality); break
        case 'repot': tx = await contracts.plantCare.repot(plantId, quality); break
        case 'photo': tx = await contracts.plantCare.takePhoto(plantId, quality); break
        case 'medicine': tx = await contracts.plantCare.applyMedicine(plantId, quality); break
      }
      setTxStatus('⏳ 交易已提交，等待确认...')
      await tx.wait()
      setTxStatus(`✅ ${action} 成功！`)
      setTimeout(() => loadDashboard(), 2000)
    } catch (err) {
      setTxStatus(`❌ 失败: ${err.reason || err.message}`)
    } finally {
      setCareLoading(prev => ({ ...prev, [action]: false }))
    }
  }

  const convertToPleaf = async () => {
    if (!convertAmount || !contracts.seedToken) return
    try {
      const amount = parseEther(convertAmount)
      setTxStatus('⏳ 转换中...')
      const tx = await contracts.seedToken.convertToPleaf(amount)
      await tx.wait()
      setTxStatus('✅ 转换成功！')
      setConvertAmount('')
      loadDashboard()
    } catch (err) { setTxStatus(`❌ 转换失败: ${err.reason || err.message}`) }
  }

  // Generate care reminders based on actual plants
  const careReminders = [
    ...myPlants.flatMap(p => {
      const name = `#${p.tokenId} ${p.species}`
      const items = []
      if (Number(p.water) < 50) items.push({ id: `w-${p.tokenId}`, text: `给 ${name} 浇水`, icon: '💧' })
      if (Number(p.soil) < 40) items.push({ id: `f-${p.tokenId}`, text: `给 ${name} 施肥`, icon: '🧪' })
      if (Number(p.health) < 60) items.push({ id: `m-${p.tokenId}`, text: `给 ${name} 用药`, icon: '💊' })
      return items
    }),
    ...localPlants.flatMap(p => {
      const items = []
      if (p.water < 50) items.push({ id: `lw-${p.id}`, text: `给 ${p.name} 浇水`, icon: '💧' })
      if (p.soil < 40) items.push({ id: `lf-${p.id}`, text: `给 ${p.name} 施肥`, icon: '🧪' })
      if (p.health < 60) items.push({ id: `lm-${p.id}`, text: `给 ${p.name} 用药`, icon: '💊' })
      return items
    }),
  ]

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } },
    scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
    elements: { point: { radius: 4, hoverRadius: 6 } },
  }
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
  }

  const fp = myPlants[0]
  const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter']

  return (
    <div className="space-y-6">
      {txStatus && (
        <div className={`glass-card p-3 text-sm ${txStatus.startsWith('✅') ? 'text-green-600' : txStatus.startsWith('❌') ? 'text-red-500' : 'text-yellow-600'}`}>
          {txStatus}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🌿</span>
          <p className="text-2xl font-bold text-plant-600 mt-1">{myPlants.length}</p>
          <p className="text-xs text-gray-500">My Plants</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🔥</span>
          <p className="text-2xl font-bold text-orange-500 mt-1">{careStreak}</p>
          <p className="text-xs text-gray-500">Care Streak</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🌱</span>
          <p className="text-2xl font-bold text-plant-600 mt-1">{account ? seedBalance : '--'}</p>
          <p className="text-xs text-gray-500">$SEED</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🍃</span>
          <p className="text-2xl font-bold text-gold-400 mt-1">{account ? pleafBalance : '--'}</p>
          <p className="text-xs text-gray-500">$PLEAF</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Featured Plant */}
        <div className="col-span-2 glass-card p-6 relative overflow-hidden">
          {fp ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-800">Featured Plant</h3>
                    <span className="nft-badge">NFT #{fp.tokenId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${RARITY_COLORS[Number(fp.rarity)] || RARITY_COLORS[0]}`}>
                      {RARITY_NAMES[Number(fp.rarity)] || '常见'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{fp.species} - {EFFORT_NAMES[Number(fp.effortLevel)] || '中等'}</p>
                </div>
                <Link to={`/plant/${fp.tokenId}`} className="text-sm text-plant-600 hover:underline">Details</Link>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-2xl bg-plant-50 flex items-center justify-center text-6xl shadow-glow">
                  {SPECIES_EMOJI[fp.species] || '🌿'}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-gray-800">{fp.species}</h4>
                    <span className={`health-dot ${Number(fp.health) > 60 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-500">HP {Number(fp.health)}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${Number(fp.health)}%` }}></div></div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Growth</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(Number(fp.growthLevel) / 4) ? '' : 'opacity-30'}`}>⭐</span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-plant-600">Lv.{Number(fp.growthLevel)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">💧 Water {Number(fp.water)}%</div>
                    <div className="bg-yellow-50 rounded-lg p-2">☀️ Sun {Number(fp.sunlight)}%</div>
                    <div className="bg-amber-50 rounded-lg p-2">🌱 Soil {Number(fp.soil)}%</div>
                  </div>
                </div>
              </div>
            </>
          ) : localPlants.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-2xl bg-plant-50 flex items-center justify-center text-6xl shadow-glow">
                {localPlants[0].emoji || '🌱'}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-gray-800">{localPlants[0].name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plant-100 text-plant-600">本地</span>
                </div>
                <p className="text-sm text-gray-500">{localPlants[0].species} · {localPlants[0].difficulty}</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${localPlants[0].health}%` }}></div></div>
                <p className="text-xs text-gray-400">HP {localPlants[0].health}% | Lv.{localPlants[0].growthLevel}</p>
                <Link to={`/plant/local/${localPlants[0].id}`} className="text-sm text-plant-600 hover:underline">查看详情 →</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-6xl">🌱</span>
              <p className="text-gray-500 mt-4 mb-4">还没有植物，开始添加吧！</p>
              <button onClick={() => setShowAddPlant(true)} className="btn-glow px-6 py-2 text-sm">
                ＋ 添加第一棵植物
              </button>
            </div>
          )}
        </div>

        {/* Care Actions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🌱 Care Actions</h3>
          {!fp ? (
            <p className="text-sm text-gray-400">{account ? '领养植物后即可护理' : '连接钱包开始'}</p>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'water', icon: '💧', label: 'Water', btnClass: 'bg-blue-50 hover:bg-blue-100' },
                { key: 'fertilize', icon: '🧪', label: 'Fertilize', btnClass: 'bg-green-50 hover:bg-green-100' },
                { key: 'repot', icon: '🪴', label: 'Repot', btnClass: 'bg-amber-50 hover:bg-amber-100' },
                { key: 'medicine', icon: '💊', label: 'Medicine', btnClass: 'bg-purple-50 hover:bg-purple-100' },
                { key: 'photo', icon: '📸', label: 'Photo', btnClass: 'bg-cyan-50 hover:bg-cyan-100' },
              ].map((a) => (
                <button key={a.key} onClick={() => performCare(a.key, fp.tokenId)}
                  disabled={careLoading[a.key]}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${a.btnClass} transition-colors text-left ${careLoading[a.key] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-sm font-semibold text-gray-700">{a.label}</p>
                  {careLoading[a.key] && <span className="ml-auto animate-spin text-sm">⏳</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Growth Tracking</h3>
          <div className="h-56"><Line data={growthData} options={chartOpts} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 护理提醒</h3>
          {careReminders.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">✅</span>
              <p className="text-sm text-gray-400 mt-2">
                {(myPlants.length > 0 || localPlants.length > 0)
                  ? '所有植物状态良好，暂无提醒'
                  : '添加植物后会出现护理提醒'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {careReminders.map((r) => (
                <div key={r.id} onClick={() => toggleReminder(r.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${checkedReminders[r.id] ? 'bg-plant-400/10' : 'hover:bg-gray-50'}`}>
                  <span className="text-lg">{r.icon}</span>
                  <p className={`flex-1 text-sm ${checkedReminders[r.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{r.text}</p>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checkedReminders[r.id] ? 'bg-plant-400 border-plant-400 text-white' : 'border-gray-300'}`}>
                    {checkedReminders[r.id] && '✓'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Weekly Care</h3>
          <div className="h-44"><Bar data={weeklyCareActivity} options={barOpts} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💎 Token Rewards</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">🌱 $SEED</span>
              <span className="text-sm font-bold text-plant-600">{account ? seedBalance : '--'}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min((Number(seedBalance) / 100) * 100, 100)}%` }}></div></div>
          </div>
          <div className="bg-gold-400/10 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2"><span>🍃</span><span className="text-sm font-semibold text-gray-700">$SEED to $PLEAF</span></div>
            <p className="text-xs text-gray-500 mb-3">1000 $SEED = 1 $PLEAF</p>
            <div className="flex items-center gap-2">
              <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Min 1000" className="flex-1 px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400" />
              <button onClick={convertToPleaf} className="btn-gold text-xs px-4 py-2">Convert</button>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🌍 Garden & Ecology</h3>
          <div className="space-y-3">
            {gardenInfo && (
              <div className="bg-plant-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">🏡 Garden Status</p>
                <p className="text-sm font-semibold">Plants: {Number(gardenInfo.plantCount)} | Bonus: {Number(gardenInfo.bonusPercentage)}%</p>
                <p className="text-xs text-gray-400">Streak: {Number(gardenInfo.consecutiveDays)} days</p>
              </div>
            )}
            <div className="bg-plant-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">🌐 Ecology Index</p>
              <p className="text-sm font-semibold">{ecologyIndex} / 100</p>
              <div className="progress-bar mt-1"><div className="progress-fill" style={{ width: `${ecologyIndex}%` }}></div></div>
            </div>
            <div className="bg-plant-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">🌸 Season: {SEASON_NAMES[season]}</p>
              <p className="text-xs text-gray-400">Total Plants on chain: {totalPlants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Plants Grid (NFT + Local) */}
      {(myPlants.length > 0 || localPlants.length > 0) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">🌿 我的植物</h3>
            <Link to="/my-plants" className="text-sm text-plant-600 hover:underline">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {myPlants.map(plant => (
              <Link to={`/plant/${plant.tokenId}`} key={`nft-${plant.tokenId}`} className="glass-card p-4 group">
                <div className="w-full h-24 rounded-xl bg-plant-50 flex items-center justify-center text-4xl mb-3 group-hover:shadow-glow transition-all">
                  {SPECIES_EMOJI[plant.species] || '🌿'}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-800">#{plant.tokenId} {plant.species}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${RARITY_COLORS[Number(plant.rarity)]}`}>{RARITY_NAMES[Number(plant.rarity)]}</span>
                </div>
                <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${Number(plant.health)}%` }}></div></div>
                <p className="text-[10px] text-gray-400 mt-1">HP {Number(plant.health)}% | Lv.{Number(plant.growthLevel)}</p>
                <span className="inline-block mt-1 text-[10px] bg-plant-100 text-plant-600 px-1.5 py-0.5 rounded">NFT ⛓️</span>
              </Link>
            ))}
            {localPlants.map(plant => (
              <Link to={`/plant/local/${plant.id}`} key={`local-${plant.id}`} className="glass-card p-4 group">
                <div className="w-full h-24 rounded-xl bg-plant-50 flex items-center justify-center text-4xl mb-3 group-hover:shadow-glow transition-all">
                  {plant.emoji || '🌱'}
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-800">{plant.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plant-100 text-plant-600">{plant.species}</span>
                </div>
                <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${plant.health}%` }}></div></div>
                <p className="text-[10px] text-gray-400 mt-1">HP {plant.health}% | Lv.{plant.growthLevel}</p>
                <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">本地 📱</span>
              </Link>
            ))}
            <Link to="/my-plants" className="glass-card p-4 group border-2 border-dashed border-plant-200 hover:border-plant-400 transition-all flex flex-col items-center justify-center min-h-[180px]">
              <span className="text-4xl text-plant-300 group-hover:text-plant-500 transition-colors">＋</span>
              <p className="text-sm text-plant-400 group-hover:text-plant-600 mt-2 font-medium transition-colors">管理植物</p>
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {myPlants.length === 0 && localPlants.length === 0 && (
        <div className="glass-card p-8 text-center">
          <span className="text-5xl">🌱</span>
          <p className="text-gray-500 mt-4 mb-4">还没有任何植物，点击下方开始你的植物管理之旅</p>
          <button onClick={() => setShowAddPlant(true)} className="btn-glow px-8 py-3 text-sm font-semibold">
            ＋ 添加第一棵植物
          </button>
        </div>
      )}

      <AddPlantModal isOpen={showAddPlant} onClose={() => setShowAddPlant(false)} onSubmit={handleAddPlant} />
    </div>
  )
}