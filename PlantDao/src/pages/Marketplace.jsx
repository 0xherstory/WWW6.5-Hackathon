import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../web3/Web3Context'

const SPECIES_EMOJI = { '绿萝': '🌿', '月季': '🌹', '仙人掌': '🌵', '樱花': '🌸', '石莲花': '🪴', '太阳花': '🌻' }
const RARITY_NAMES = ['常见', '稀有', '史诗', '传说']
const RARITY_COLORS = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-blue-100 text-blue-600', 2: 'bg-purple-100 text-purple-600', 3: 'bg-yellow-100 text-yellow-600' }

export default function Marketplace() {
  const { account, contracts, formatEther, parseEther, connectWallet } = useWeb3()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [txStatus, setTxStatus] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [listPlantId, setListPlantId] = useState('')
  const [myPlants, setMyPlants] = useState([])
  const [pleafBalance, setPleafBalance] = useState('0')

  const loadMarketplace = async () => {
    if (!contracts.marketplace) return
    try {
      setLoading(true)
      const active = await contracts.marketplace.getActiveListings()
      const listingData = await Promise.all(active.map(async (l, idx) => {
        let plantAttrs = null
        try { plantAttrs = await contracts.plantNFT.getPlantAttributes(l.plantId) } catch {}
        return {
          index: idx,
          plantId: Number(l.plantId),
          seller: l.seller,
          price: formatEther(l.price),
          active: l.active,
          listedTime: Number(l.listedTime),
          attrs: plantAttrs,
        }
      }))
      setListings(listingData)

      // Load pleaf balance
      if (account) {
        const bal = await contracts.pleafToken.balanceOf(account)
        setPleafBalance(parseFloat(formatEther(bal)).toFixed(2))

        // Load my plants for listing
        const total = await contracts.plantNFT.getTotalPlants()
        const plants = []
        for (let tid = 1; tid <= Math.min(Number(total), 20); tid++) {
          try {
            const owner = await contracts.plantNFT.ownerOf(tid)
            if (owner.toLowerCase() === account.toLowerCase()) {
              const attrs = await contracts.plantNFT.getPlantAttributes(tid)
              plants.push({ tokenId: tid, ...attrs })
            }
          } catch { break }
        }
        setMyPlants(plants)
      }
    } catch (e) { console.error('加载市场失败:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadMarketplace() }, [account, contracts])

  const buyPlant = async (index) => {
    if (!contracts.marketplace) return
    setTxStatus('⏳ 购买中...')
    try {
      const tx = await contracts.marketplace.buyPlant(index)
      await tx.wait()
      setTxStatus('✅ 购买成功！')
      setSelectedPlant(null)
      loadMarketplace()
    } catch (err) { setTxStatus('❌ 购买失败: ' + (err.reason || err.message)) }
  }

  const listPlant = async () => {
    if (!contracts.marketplace || !listPlantId || !listPrice) return
    setTxStatus('⏳ 上架中...')
    try {
      // First approve marketplace
      const approveTx = await contracts.plantNFT.approve(contracts.marketplace.target, listPlantId)
      await approveTx.wait()
      const price = parseEther(listPrice)
      const tx = await contracts.marketplace.listPlant(listPlantId, price)
      await tx.wait()
      setTxStatus('✅ 上架成功！')
      setListPlantId('')
      setListPrice('')
      loadMarketplace()
    } catch (err) { setTxStatus('❌ 上架失败: ' + (err.reason || err.message)) }
  }

  const cancelListing = async (index) => {
    if (!contracts.marketplace) return
    setTxStatus('⏳ 取消中...')
    try {
      const tx = await contracts.marketplace.cancelListing(index)
      await tx.wait()
      setTxStatus('✅ 已取消')
      loadMarketplace()
    } catch (err) { setTxStatus('❌ 取消失败: ' + (err.reason || err.message)) }
  }

  return (
    <div className="space-y-6">
      {txStatus && (
        <div className={`glass-card p-3 text-sm ${txStatus.startsWith('✅') ? 'text-green-600' : txStatus.startsWith('❌') ? 'text-red-500' : 'text-yellow-600'}`}>
          {txStatus}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🌿 植物市场</h2>
          <p className="text-sm text-gray-400">发现、收集、交换植物 NFT</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">你有</span>
          <span className="text-sm font-bold text-gold-400">{pleafBalance} $PLEAF</span>
        </div>
      </div>

      {/* List Plant Section - Always visible */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 上架我的植物</h3>
        {!account ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-3">连接钱包后即可上架植物</p>
            <button onClick={connectWallet} className="btn-glow text-sm px-6 py-2">🔗 连接钱包</button>
          </div>
        ) : myPlants.length === 0 ? (
          <div className="text-center py-4">
            <span className="text-3xl">🌱</span>
            <p className="text-sm text-gray-400 mt-2 mb-3">你还没有链上植物 NFT</p>
            <Link to="/" className="text-sm text-plant-600 hover:underline">去首页添加植物 →</Link>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <select value={listPlantId} onChange={(e) => setListPlantId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400">
              <option value="">选择植物</option>
              {myPlants.map(p => (
                <option key={p.tokenId} value={p.tokenId}>#{p.tokenId} {p.species} (HP: {Number(p.health)}%)</option>
              ))}
            </select>
            <input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)}
              placeholder="价格 ($PLEAF)" className="px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400 w-40" />
            <button onClick={listPlant} disabled={!listPlantId || !listPrice}
              className={`text-sm px-6 py-2 rounded-xl ${(!listPlantId || !listPrice) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-glow'}`}>
              上架
            </button>
          </div>
        )}
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="text-center py-20"><span className="text-4xl animate-spin inline-block">🌱</span><p className="text-gray-400 mt-4">Loading marketplace...</p></div>
      ) : listings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <span className="text-6xl">🏜️</span>
          <p className="text-gray-500 mt-4">暂无在售植物</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {listings.map((listing, idx) => {
            const a = listing.attrs
            const isSeller = account && listing.seller.toLowerCase() === account.toLowerCase()
            return (
              <div key={idx} onClick={() => setSelectedPlant(listing)} className="glass-card p-5 cursor-pointer group">
                <div className="w-full h-40 rounded-xl bg-plant-50 flex items-center justify-center text-6xl mb-4 group-hover:shadow-glow transition-all">
                  {a ? (SPECIES_EMOJI[a.species] || '🌿') : '🌱'}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-gray-800">{a ? a.species : 'Plant #' + listing.plantId}</h4>
                  {a && <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${RARITY_COLORS[Number(a.rarity)]}`}>{RARITY_NAMES[Number(a.rarity)]}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-3">#{listing.plantId}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🍃</span>
                    <span className="text-lg font-bold text-gold-400">{Number(listing.price).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">$PLEAF</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</span>
                </div>
                {isSeller && (
                  <button onClick={(e) => { e.stopPropagation(); cancelListing(idx) }}
                    className="mt-2 w-full text-xs text-red-500 hover:text-red-700 py-1">取消上架</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlant && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedPlant(null)}>
          <div className="glass-card p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedPlant.attrs ? selectedPlant.attrs.species : 'Plant #' + selectedPlant.plantId}
              </h3>
              <button onClick={() => setSelectedPlant(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-32 rounded-2xl bg-plant-50 flex items-center justify-center text-5xl shadow-glow">
                {selectedPlant.attrs ? (SPECIES_EMOJI[selectedPlant.attrs.species] || '🌿') : '🌱'}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-600">ID: <span className="font-semibold">#{selectedPlant.plantId}</span></p>
                {selectedPlant.attrs && (
                  <>
                    <p className="text-sm text-gray-600">稀有度: <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${RARITY_COLORS[Number(selectedPlant.attrs.rarity)]}`}>{RARITY_NAMES[Number(selectedPlant.attrs.rarity)]}</span></p>
                    <p className="text-sm text-gray-600">健康: <span className="font-semibold">{Number(selectedPlant.attrs.health)}%</span></p>
                    <p className="text-sm text-gray-600">等级: <span className="font-semibold">Lv.{Number(selectedPlant.attrs.growthLevel)}</span></p>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gold-400/10 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">价格</span>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-gold-400">{Number(selectedPlant.price).toFixed(2)}</span>
                  <span className="text-sm text-gray-500">$PLEAF</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">卖家: {selectedPlant.seller.slice(0, 6)}...{selectedPlant.seller.slice(-4)}</p>
            </div>
            <button onClick={() => buyPlant(selectedPlant.index)} className="w-full btn-glow flex items-center justify-center gap-2 py-3">
              <span>🛒</span><span>购买</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}