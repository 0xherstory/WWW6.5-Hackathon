import { useState } from 'react'
import { useWeb3 } from '../web3/Web3Context'
import { SPECIES_LIST } from '../utils/plantStorage'

const SPECIES_EMOJI = { '绿萝': '🌿', '月季': '🌹', '仙人掌': '🌵', '樱花': '🌸', '石莲花': '🪴', '太阳花': '🌻' }
const RARITY_MAP = { '简单': 0, '中等': 1, '困难': 2 }
const DIFFICULTY_TO_EFFORT = { '简单': 0, '中等': 1, '困难': 2 }

export default function AddPlantModal({ isOpen, onClose, onSubmit }) {
  const { account, contracts, connectWallet } = useWeb3()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('绿萝')
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [step, setStep] = useState(1) // 1: basic info, 2: confirm
  const [mintType, setMintType] = useState('local') // 'local' or 'nft'
  const [minting, setMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState('')

  const selectedSpecies = SPECIES_LIST.find(s => s.species === species) || SPECIES_LIST[0]

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('照片大小不能超过 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMintNFT = async () => {
    if (!account) {
      connectWallet()
      return
    }
    if (!contracts.plantCare) {
      setMintStatus('❌ 合约未连接，请先连接钱包')
      return
    }

    setMinting(true)
    setMintStatus('⏳ 铸造中，等待链上确认...')

    try {
      const rarity = RARITY_MAP[selectedSpecies.difficulty] || 0
      const effortLevel = DIFFICULTY_TO_EFFORT[selectedSpecies.difficulty] || 0

      const tx = await contracts.plantCare.mintPlantForUser(
        selectedSpecies.species,
        rarity,
        effortLevel,
        '' // tokenURI
      )
      await tx.wait()

      setMintStatus('✅ 铸造成功！植物已上链 🎉')
      setMinting(false)

      // Also create local record
      onSubmit({
        name: name.trim() || selectedSpecies.species,
        species: selectedSpecies.species,
        emoji: selectedSpecies.emoji,
        difficulty: selectedSpecies.difficulty,
        note: note.trim(),
        initialPhoto: photo,
      })

      setTimeout(() => {
        handleReset()
        onClose()
      }, 1500)
    } catch (err) {
      setMintStatus('❌ 铸造失败: ' + (err.reason || err.message))
      setMinting(false)
    }
  }

  const handleSubmit = () => {
    if (mintType === 'nft') {
      handleMintNFT()
    } else {
      if (!name.trim()) {
        alert('请输入植物名称')
        return
      }
      onSubmit({
        name: name.trim(),
        species,
        emoji: selectedSpecies.emoji,
        difficulty: selectedSpecies.difficulty,
        note: note.trim(),
        initialPhoto: photo,
      })
      handleReset()
    }
  }

  const handleReset = () => {
    setName('')
    setSpecies('绿萝')
    setNote('')
    setPhoto(null)
    setStep(1)
    setMintType('local')
    setMinting(false)
    setMintStatus('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative glass-card w-full max-w-lg mx-4 p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌱</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">添加新植物</h2>
              <p className="text-xs text-gray-400">开始记录你的植物成长之旅</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">✕</button>
        </div>

        {/* Mint Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">植物类型</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMintType('local')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                mintType === 'local'
                  ? 'border-plant-400 bg-plant-50 shadow-glow'
                  : 'border-gray-100 hover:border-plant-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📱</span>
                <span className="text-sm font-semibold text-gray-700">本地植物</span>
              </div>
              <p className="text-[10px] text-gray-400">保存在本地，离线可用，快速记录</p>
            </button>
            <button
              onClick={() => setMintType('nft')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                mintType === 'nft'
                  ? 'border-plant-400 bg-plant-50 shadow-glow'
                  : 'border-gray-100 hover:border-plant-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">⛓️</span>
                <span className="text-sm font-semibold text-gray-700">链上 NFT</span>
              </div>
              <p className="text-[10px] text-gray-400">铸造为 NFT，链上永久保存，可交易</p>
            </button>
          </div>
          {mintType === 'nft' && !account && (
            <div className="mt-2 bg-yellow-50 rounded-lg p-3 text-xs text-yellow-700">
              ⚠️ 铸造链上 NFT 需要先连接钱包
              <button onClick={connectWallet} className="ml-2 text-plant-600 font-semibold underline">去连接</button>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-plant-400' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-plant-400' : 'bg-gray-200'}`}></div>
        </div>

        {/* Mint Status */}
        {mintStatus && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            mintStatus.startsWith('✅') ? 'bg-green-50 text-green-600' :
            mintStatus.startsWith('❌') ? 'bg-red-50 text-red-500' :
            'bg-yellow-50 text-yellow-600'
          }`}>
            {mintStatus}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            {/* Plant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                植物名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="给你的植物取个名字吧~"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400 focus:ring-2 focus:ring-plant-400/20 transition-all"
                maxLength={20}
                autoFocus
              />
            </div>

            {/* Species Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">植物种类</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {SPECIES_LIST.map((s) => (
                  <button
                    key={s.species}
                    onClick={() => setSpecies(s.species)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                      species === s.species
                        ? 'border-plant-400 bg-plant-50 shadow-glow'
                        : 'border-gray-100 hover:border-plant-200 hover:bg-plant-50/50'
                    }`}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-[11px] text-gray-600 leading-tight">{s.species}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty indicator */}
            <div className="flex items-center gap-2 bg-plant-50 rounded-xl p-3">
              <span className="text-sm">{selectedSpecies.emoji}</span>
              <span className="text-sm text-gray-600">
                {selectedSpecies.species} · 难度: 
                <span className={`font-semibold ml-1 ${
                  selectedSpecies.difficulty === '简单' ? 'text-green-600' :
                  selectedSpecies.difficulty === '中等' ? 'text-yellow-600' : 'text-red-500'
                }`}>
                  {selectedSpecies.difficulty}
                </span>
              </span>
              {mintType === 'nft' && (
                <span className="ml-auto text-xs bg-plant-100 text-plant-600 px-2 py-0.5 rounded-full">
                  稀有度: {selectedSpecies.difficulty === '简单' ? '常见' : selectedSpecies.difficulty === '中等' ? '稀有' : '史诗'}
                </span>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">备注（可选）</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录一下这株植物的来源、特点..."
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400 focus:ring-2 focus:ring-plant-400/20 transition-all resize-none"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">初始照片（可选）</label>
              <div className="flex items-center gap-3">
                {photo ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-plant-400">
                    <img src={photo} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhoto(null)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >✕</button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-plant-400 hover:bg-plant-50/50 transition-all">
                    <span className="text-xl text-gray-400">📷</span>
                    <span className="text-[10px] text-gray-400">上传照片</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                )}
                <p className="text-xs text-gray-400">支持 JPG/PNG，最大 5MB</p>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (!name.trim() && mintType === 'local') { alert('请输入植物名称'); return }
                setStep(2)
              }}
              className="w-full btn-glow py-3 text-sm font-semibold"
            >
              下一步 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-plant-50 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-white flex items-center justify-center text-5xl shadow-glow mb-4">
                {selectedSpecies.emoji}
              </div>
              {photo && (
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden mb-4 border-2 border-white shadow-md">
                  <img src={photo} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">{name || selectedSpecies.species}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedSpecies.species} · {selectedSpecies.difficulty}
              </p>
              <div className="mt-2">
                {mintType === 'nft' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-plant-100 text-plant-600 text-xs font-semibold">
                    ⛓️ 链上 NFT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    📱 本地植物
                  </span>
                )}
              </div>
              {note && <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">{note}</p>}
            </div>

            {/* Initial Stats Preview */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <span className="text-lg">❤️</span>
                <p className="text-sm font-bold text-gray-700">80%</p>
                <p className="text-[10px] text-gray-400">健康</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <span className="text-lg">💧</span>
                <p className="text-sm font-bold text-blue-500">70%</p>
                <p className="text-[10px] text-gray-400">水分</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <span className="text-lg">☀️</span>
                <p className="text-sm font-bold text-yellow-500">70%</p>
                <p className="text-[10px] text-gray-400">光照</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <span className="text-lg">🌱</span>
                <p className="text-sm font-bold text-amber-600">70%</p>
                <p className="text-[10px] text-gray-400">土壤</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              {mintType === 'nft'
                ? '铸造 NFT 需要链上 Gas 费用，植物将永久保存在区块链上'
                : '添加后，你可以随时记录浇水、施肥、拍照等操作，时间轴将自动生成'
              }
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                ← 返回修改
              </button>
              <button
                onClick={handleSubmit}
                disabled={minting}
                className={`flex-1 py-3 text-sm font-semibold rounded-xl ${
                  minting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-glow'
                }`}
              >
                {minting ? '⏳ 铸造中...' : mintType === 'nft' ? '⛓️ 铸造 NFT' : '🌱 确认添加'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}