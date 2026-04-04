import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../web3/Web3Context'
import { getPlants } from '../utils/plantStorage'
import AddPlantModal from '../components/AddPlantModal'

const SPECIES_EMOJI = { '绿萝': '🌿', '月季': '🌹', '仙人掌': '🌵', '樱花': '🌸', '石莲花': '🪴', '太阳花': '🌻' }
const RARITY_NAMES = ['常见', '稀有', '史诗', '传说']
const RARITY_COLORS = ['bg-gray-100 text-gray-600', 'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-yellow-100 text-yellow-600']

export default function MyPlants() {
  const { account, contracts } = useWeb3()
  const [nftPlants, setNftPlants] = useState([])
  const [localPlants, setLocalPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddPlant, setShowAddPlant] = useState(false)
  const [filter, setFilter] = useState('all') // all, nft, local

  useEffect(() => {
    setLocalPlants(getPlants())
  }, [])

  const loadNftPlants = async () => {
    if (!account || !contracts.plantNFT) { setLoading(false); return }
    try {
      setLoading(true)
      const total = await contracts.plantNFT.getTotalPlants()
      const plants = []
      for (let tid = 1; tid <= Math.min(Number(total), 50); tid++) {
        try {
          const owner = await contracts.plantNFT.ownerOf(tid)
          if (owner.toLowerCase() === account.toLowerCase()) {
            const attrs = await contracts.plantNFT.getPlantAttributes(tid)
            plants.push({ tokenId: tid, ...attrs })
          }
        } catch { break }
      }
      setNftPlants(plants)
    } catch (e) { console.error('加载植物失败:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadNftPlants() }, [account, contracts])

  const filteredPlants = () => {
    switch (filter) {
      case 'nft': return [...nftPlants.map(p => ({ ...p, type: 'nft' }))]
      case 'local': return [...localPlants.map(p => ({ ...p, type: 'local' }))]
      default: return [
        ...nftPlants.map(p => ({ ...p, type: 'nft' })),
        ...localPlants.map(p => ({ ...p, type: 'local' })),
      ]
    }
  }

  const plants = filteredPlants()
  const totalCount = nftPlants.length + localPlants.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🌿 我的植物</h2>
          <p className="text-sm text-gray-400">管理你的链上 NFT 和本地植物</p>
        </div>
        <button onClick={() => setShowAddPlant(true)} className="btn-glow px-5 py-2 text-sm font-semibold">
          ＋ 添加植物
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🌿</span>
          <p className="text-2xl font-bold text-plant-600 mt-1">{totalCount}</p>
          <p className="text-xs text-gray-500">全部植物</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">⛓️</span>
          <p className="text-2xl font-bold text-blue-500 mt-1">{nftPlants.length}</p>
          <p className="text-xs text-gray-500">链上 NFT</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">📱</span>
          <p className="text-2xl font-bold text-amber-500 mt-1">{localPlants.length}</p>
          <p className="text-xs text-gray-500">本地植物</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: '全部', count: totalCount },
          { key: 'nft', label: '链上 NFT ⛓️', count: nftPlants.length },
          { key: 'local', label: '本地 📱', count: localPlants.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-plant-400 text-white shadow-glow'
                : 'bg-white/60 text-gray-600 hover:bg-white/80'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="text-center py-20">
          <span className="text-4xl animate-spin inline-block">🌱</span>
          <p className="text-gray-400 mt-4">加载中...</p>
        </div>
      ) : plants.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <span className="text-6xl">🌱</span>
          <p className="text-gray-500 mt-4 mb-2">
            {filter === 'nft' ? '还没有链上植物 NFT' : filter === 'local' ? '还没有本地植物' : '还没有任何植物'}
          </p>
          <p className="text-sm text-gray-400 mb-6">添加你的第一棵植物，开始植物护理之旅</p>
          <button onClick={() => setShowAddPlant(true)} className="btn-glow px-8 py-3 text-sm font-semibold">
            ＋ 添加第一棵植物
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {plants.map(plant => {
            const isNft = plant.type === 'nft'
            return (
              <Link
                to={isNft ? `/plant/${plant.tokenId}` : `/plant/local/${plant.id}`}
                key={isNft ? `nft-${plant.tokenId}` : `local-${plant.id}`}
                className="glass-card p-5 group hover:shadow-glow transition-all"
              >
                <div className="w-full h-32 rounded-xl bg-plant-50 flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {isNft ? (SPECIES_EMOJI[plant.species] || '🌿') : (plant.emoji || '🌱')}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-800 truncate">
                    {isNft ? `#${plant.tokenId} ${plant.species}` : plant.name}
                  </h4>
                  {isNft && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${RARITY_COLORS[Number(plant.rarity)] || RARITY_COLORS[0]}`}>
                      {RARITY_NAMES[Number(plant.rarity)] || '常见'}
                    </span>
                  )}
                  {!isNft && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plant-100 text-plant-600">
                      {plant.species}
                    </span>
                  )}
                </div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${isNft ? Number(plant.health) : plant.health}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-gray-400">
                    HP {isNft ? Number(plant.health) : plant.health}% | Lv.{isNft ? Number(plant.growthLevel) : plant.growthLevel}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${isNft ? 'bg-plant-100 text-plant-600' : 'bg-gray-100 text-gray-500'}`}>
                    {isNft ? 'NFT ⛓️' : '本地 📱'}
                  </span>
                </div>
              </Link>
            )
          })}

          {/* Add Plant Card */}
          <button onClick={() => setShowAddPlant(true)}
            className="glass-card p-5 group border-2 border-dashed border-plant-200 hover:border-plant-400 transition-all flex flex-col items-center justify-center min-h-[240px]">
            <span className="text-5xl text-plant-300 group-hover:text-plant-500 transition-colors">＋</span>
            <p className="text-sm text-plant-400 group-hover:text-plant-600 mt-3 font-medium transition-colors">添加植物</p>
          </button>
        </div>
      )}

      {/* Add Plant Modal */}
      <AddPlantModal isOpen={showAddPlant} onClose={() => setShowAddPlant(false)} onSubmit={() => {
        setLocalPlants(getPlants())
        setShowAddPlant(false)
        loadNftPlants()
      }} />
    </div>
  )
}