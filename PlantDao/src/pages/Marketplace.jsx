import { useState } from 'react'
import { marketPlants } from '../data/mockData'

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterRarity, setFilterRarity] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 1000])

  const tabs = [
    { id: 'all', label: '所有植物', icon: '🌿' },
    { id: 'exchange', label: '邻居交换', icon: '🤝' },
    { id: 'new', label: '新上架', icon: '✨' },
  ]

  const rarityColors = {
    '常见': 'bg-gray-100 text-gray-600',
    '稀有': 'bg-blue-100 text-blue-600',
    '史诗': 'bg-purple-100 text-purple-600',
    '传说': 'bg-gold-400/20 text-gold-500',
  }

  const filteredPlants = marketPlants.filter(p => {
    if (filterRarity !== 'all' && p.rarity !== filterRarity) return false
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🌿 植物市场</h2>
          <p className="text-sm text-gray-400">发现、收集、交换植物 NFT</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">你有</span>
          <span className="text-sm font-bold text-gold-400">18.5 $PLEAF</span>
          <span className="text-sm text-gray-500">可用于购买</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-plant-400 text-white shadow-glow'
                : 'glass-card text-gray-600 hover:text-plant-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-6">
          <div>
            <label className="text-xs text-gray-400 block mb-1">植物类型</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400"
            >
              <option value="all">全部类型</option>
              <option value="flower">花卉</option>
              <option value="tree">树木</option>
              <option value="succulent">多肉</option>
              <option value="herb">草本</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">稀有度</label>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400"
            >
              <option value="all">全部稀有度</option>
              <option value="常见">常见</option>
              <option value="稀有">稀有</option>
              <option value="史诗">史诗</option>
              <option value="传说">传说</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">价格区间 ($PLEAF)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-20 px-2 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-20 px-2 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400"
              />
            </div>
          </div>
          <div className="flex-1"></div>
          <p className="text-xs text-gray-400">共 {filteredPlants.length} 个结果</p>
        </div>
      </div>

      {/* Plant Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredPlants.map(plant => (
          <div
            key={plant.id}
            onClick={() => setSelectedPlant(plant)}
            className="glass-card p-5 cursor-pointer group"
          >
            {/* Plant Image */}
            <div className="w-full h-40 rounded-xl bg-plant-50 flex items-center justify-center text-6xl mb-4 group-hover:shadow-glow transition-all">
              {plant.image}
            </div>

            {/* Info */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-gray-800">{plant.name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityColors[plant.rarity]}`}>
                {plant.rarity}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{plant.species} · {plant.effortLabel}</p>

            {/* Price & Owner */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm">🍃</span>
                <span className="text-lg font-bold text-gold-400">{plant.price}</span>
                <span className="text-xs text-gray-400">$PLEAF</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400">🦊</span>
                <span className="text-[10px] text-gray-400 font-mono">{plant.seller}</span>
              </div>
            </div>

            {/* Listed time */}
            <p className="text-[10px] text-gray-300 mt-2">上架于 {plant.listed}</p>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedPlant(null)}>
          <div className="glass-card p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedPlant.name}</h3>
              <button onClick={() => setSelectedPlant(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32 rounded-2xl bg-plant-50 flex items-center justify-center text-5xl shadow-glow">
                {selectedPlant.image}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-600">物种: <span className="font-semibold">{selectedPlant.species}</span></p>
                <p className="text-sm text-gray-600">稀有度: <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${rarityColors[selectedPlant.rarity]}`}>{selectedPlant.rarity}</span></p>
                <p className="text-sm text-gray-600">健康: <span className="font-semibold">{selectedPlant.health}%</span></p>
                <p className="text-sm text-gray-600">等级: <span className="font-semibold">Lv.{selectedPlant.growthLevel}</span></p>
                <p className="text-sm text-gray-600">权重: <span className="font-semibold">{selectedPlant.effortWeight}x</span></p>
              </div>
            </div>

            <div className="bg-gold-400/10 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">价格</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-gold-400">{selectedPlant.price}</span>
                  <span className="text-sm text-gray-500">$PLEAF</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">卖家: {selectedPlant.seller}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="btn-glow flex items-center justify-center gap-2 py-3">
                <span>🛒</span>
                <span>购买</span>
              </button>
              <button className="btn-gold flex items-center justify-center gap-2 py-3">
                <span>🤝</span>
                <span>交换</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}