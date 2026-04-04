import { useState, useEffect } from 'react'
import { useWeb3 } from '../web3/Web3Context'

const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter']
const SEASON_ICONS = ['🌸', '☀️', '🍂', '❄️']
const SEASON_COLORS = ['text-pink-500', 'text-yellow-500', 'text-orange-500', 'text-blue-400']
const ECOLOGY_LABELS = ['Thriving', 'Balanced', 'Declining']
const ECOLOGY_ICONS = ['🌿', '⚖️', '⚠️']
const ECOLOGY_COLORS = ['text-green-500', 'text-yellow-500', 'text-red-500']

export default function TopBar() {
  const { account, contracts, connectWallet, disconnectWallet, connecting, formatEther } = useWeb3()
  const [showNotifications, setShowNotifications] = useState(false)
  const [seedBalance, setSeedBalance] = useState('--')
  const [pleafBalance, setPleafBalance] = useState('--')
  const [season, setSeason] = useState(0)
  const [ecologyIndex, setEcologyIndex] = useState(70)
  const [ecologyState, setEcologyState] = useState(1)

  useEffect(() => {
    if (!account || !contracts.seedToken) return
    const loadData = async () => {
      try {
        const seedBal = await contracts.seedToken.balanceOf(account)
        setSeedBalance(parseFloat(formatEther(seedBal)).toFixed(1))
        const pleafBal = await contracts.pleafToken.balanceOf(account)
        setPleafBalance(parseFloat(formatEther(pleafBal)).toFixed(2))
        const s = await contracts.seasonManager.currentSeason()
        setSeason(Number(s))
        const idx = await contracts.globalEcology.ecologyIndex()
        setEcologyIndex(Number(idx))
        const st = await contracts.globalEcology.getEcologyState()
        setEcologyState(Number(st))
      } catch (e) { console.error(e) }
    }
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [account, contracts])

  const displayAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''

  const notifications = [
    { id: 1, text: `${SEASON_ICONS[season]} Current season: ${SEASON_NAMES[season]}`, time: 'System' },
    { id: 2, text: `${ECOLOGY_ICONS[ecologyState]} Ecology: ${ECOLOGY_LABELS[ecologyState]} (${ecologyIndex})`, time: 'Global' },
    { id: 3, text: '📋 New DAO proposal awaiting vote', time: '3h ago' },
  ]

  return (
    <header className="glass-topbar fixed top-0 left-64 right-0 z-30 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, Plant Guardian {SEASON_ICONS[season]}
          </h2>
          <p className="text-xs text-gray-400">
            Season: <span className={SEASON_COLORS[season]}>{SEASON_NAMES[season]}</span>
            {' · '}
            Ecology: <span className={ECOLOGY_COLORS[ecologyState]}>{ECOLOGY_LABELS[ecologyState]} ({ecologyIndex})</span>
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Season & Ecology Badges */}
          <div className="flex items-center gap-2">
            <div className="glass-card px-3 py-1.5 flex items-center gap-1.5">
              <span>{SEASON_ICONS[season]}</span>
              <span className={`text-xs font-semibold ${SEASON_COLORS[season]}`}>{SEASON_NAMES[season]}</span>
            </div>
            <div className="glass-card px-3 py-1.5 flex items-center gap-1.5">
              <span>{ECOLOGY_ICONS[ecologyState]}</span>
              <span className={`text-xs font-semibold ${ECOLOGY_COLORS[ecologyState]}`}>{ecologyIndex}</span>
            </div>
          </div>

          {/* Token Balances */}
          {account && (
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <span className="text-sm">🌱</span>
                <span className="text-sm font-bold text-plant-600">{seedBalance}</span>
                <span className="text-xs text-gray-400">$SEED</span>
              </div>
              <div className="glass-card px-4 py-2 flex items-center gap-2">
                <span className="text-sm">🍃</span>
                <span className="text-sm font-bold text-gold-400">{pleafBalance}</span>
                <span className="text-xs text-gray-400">$PLEAF</span>
              </div>
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl hover:bg-plant-400/10 transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">3</span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 glass-card p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Notifications</p>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-plant-400/5 cursor-pointer">
                    <span className="text-sm">{n.text}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Connect */}
          <button
            onClick={account ? disconnectWallet : connectWallet}
            disabled={connecting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              account ? 'bg-plant-600 text-white shadow-glow' : 'btn-glow'
            }`}
          >
            {connecting ? (
              <><span className="animate-spin">⏳</span><span>Connecting...</span></>
            ) : account ? (
              <><span>🦊</span><span>{displayAddress}</span></>
            ) : (
              <><span>🔗</span><span>Connect Wallet</span></>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}