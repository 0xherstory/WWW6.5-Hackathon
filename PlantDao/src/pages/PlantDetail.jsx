import { useParams, Link } from 'react-router-dom'
import { plants, careTimeline, milestones } from '../data/mockData'

export default function PlantDetail() {
  const { id } = useParams()
  const plant = plants.find(p => p.id === parseInt(id)) || plants[0]

  const rarityColors = {
    '常见': 'bg-gray-100 text-gray-600',
    '稀有': 'bg-blue-100 text-blue-600',
    '史诗': 'bg-purple-100 text-purple-600',
    '传说': 'bg-gold-400/20 text-gold-500',
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-plant-600 transition-colors">
        <span>←</span>
        <span>返回仪表盘</span>
      </Link>

      {/* Main Plant View */}
      <div className="grid grid-cols-3 gap-6">
        {/* Plant Image & NFT */}
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-3xl bg-plant-50 flex items-center justify-center text-8xl shadow-glow mb-6 float-animation">
            {plant.image}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{plant.name}</h2>
            <span className="nft-badge">NFT</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">{plant.species}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rarityColors[plant.rarity] || 'bg-gray-100 text-gray-600'}`}>
            {plant.rarity}
          </span>
          <p className="text-xs text-gray-400 mt-2">权重: {plant.effortWeight}x ({plant.effortLabel})</p>

          {/* NFT Info */}
          <div className="w-full mt-6 bg-plant-400/5 rounded-xl p-4">
            <p className="text-xs font-semibold text-plant-600 mb-2">🔗 NFT 信息</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Token ID</span>
                <span className="font-mono">{plant.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span>区块链</span>
                <span className="font-mono">Ethereum</span>
              </div>
              <div className="flex justify-between">
                <span>标准</span>
                <span className="font-mono">ERC-721</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Details */}
        <div className="col-span-2 space-y-4">
          {/* Metadata */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 植物元数据</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-plant-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">物种</p>
                <p className="text-sm font-semibold text-gray-700">{plant.species}</p>
              </div>
              <div className="bg-plant-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">所有者钱包</p>
                <p className="text-sm font-semibold text-gray-700 font-mono">{plant.ownerId}</p>
              </div>
              <div className="bg-plant-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">铸币日期</p>
                <p className="text-sm font-semibold text-gray-700">{plant.mintDate}</p>
              </div>
              <div className="bg-plant-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">来源</p>
                <p className="text-sm font-semibold text-gray-700">{plant.origin}</p>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">❤️ 健康状况</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">💧 水分</span>
                  <span className="text-sm font-bold text-blue-500">{plant.water}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${plant.water}%`, background: 'linear-gradient(90deg, #60a5fa, #3b82f6)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">☀️ 阳光</span>
                  <span className="text-sm font-bold text-yellow-500">{plant.sunlight}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${plant.sunlight}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">🌱 土壤</span>
                  <span className="text-sm font-bold text-amber-600">{plant.soil}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${plant.soil}%`, background: 'linear-gradient(90deg, #d97706, #b45309)' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="health-dot bg-green-500"></span>
              <span className="text-sm text-gray-600">整体健康: {plant.health}%</span>
              <span className="text-sm text-gray-400 ml-4">生长等级: Lv.{plant.growthLevel} / {plant.maxGrowth}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button className="btn-glow flex items-center justify-center gap-2 py-3">
              <span>📝</span>
              <span>记录维护</span>
            </button>
            <button className="btn-gold flex items-center justify-center gap-2 py-3">
              <span>📸</span>
              <span>上传照片</span>
            </button>
            <button className="btn-outline flex items-center justify-center gap-2 py-3">
              <span>🔗</span>
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🌟 增长里程碑</h3>
        <div className="flex items-center gap-4">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                milestone.achieved
                  ? 'bg-plant-400 text-white shadow-glow'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {milestone.achieved ? '⭐' : '🔒'}
              </div>
              <p className={`text-xs mt-2 font-semibold ${milestone.achieved ? 'text-plant-600' : 'text-gray-400'}`}>
                Lv.{milestone.level}
              </p>
              <p className="text-[10px] text-gray-400">{milestone.title}</p>
              {milestone.achieved && milestone.date && (
                <p className="text-[10px] text-gray-300">{milestone.date}</p>
              )}
              {idx < milestones.length - 1 && (
                <div className={`hidden md:block absolute ${
                  milestone.achieved ? 'bg-plant-400' : 'bg-gray-200'
                }`} style={{ width: 'calc(20% - 48px)', height: '2px', left: `calc(${(idx + 1) * 20}% + 24px)` }}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Care Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📜 护理时间线</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-plant-400/20"></div>

          <div className="space-y-4">
            {careTimeline.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                {/* Timeline dot */}
                <div className="w-12 h-12 rounded-full bg-white border-2 border-plant-400 flex items-center justify-center text-lg z-10 flex-shrink-0">
                  {entry.icon}
                </div>
                {/* Content */}
                <div className="flex-1 bg-plant-400/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700">{entry.action}</p>
                    <p className="text-xs text-gray-400">{entry.date}</p>
                  </div>
                  <p className="text-xs text-gray-500">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}