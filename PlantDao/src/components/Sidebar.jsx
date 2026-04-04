import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useWeb3 } from '../web3/Web3Context'

const navItems = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/my-plants', label: '我的植物', icon: '🌿' },
  { path: '/marketplace', label: '市场', icon: '🛒' },
  { path: '/community', label: '社区', icon: '👥' },
  { path: '/dao', label: 'DAO', icon: '🏛️' },
]

export default function Sidebar() {
  const { account, contracts, formatEther, connectWallet, connecting } = useWeb3()
  const [seedBalance, setSeedBalance] = useState('--')
  const [pleafBalance, setPleafBalance] = useState('--')

  useEffect(() => {
    if (!account || !contracts.seedToken) return
    const loadBalances = async () => {
      try {
        const [seedBal, pleafBal] = await Promise.all([
          contracts.seedToken.balanceOf(account),
          contracts.pleafToken.balanceOf(account),
        ])
        setSeedBalance(parseFloat(formatEther(seedBal)).toFixed(1))
        setPleafBalance(parseFloat(formatEther(pleafBal)).toFixed(2))
      } catch (e) {
        console.error('加载余额失败:', e)
      }
    }
    loadBalances()
    const interval = setInterval(loadBalances, 15000)
    return () => clearInterval(interval)
  }, [account, contracts, formatEther])

  const displayAddress = account
    ? account.slice(0, 6) + '...' + account.slice(-4)
    : '未连接'

  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-screen w-64 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl float-animation">🌱</span>
          <div>
            <h1 className="text-xl font-bold text-plant-600">Plant DAO</h1>
            <p className="text-xs text-gray-400">Web3 植物护理平台</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-plant-400/15 text-plant-600 shadow-glow'
                      : 'text-gray-600 hover:bg-plant-400/8 hover:text-plant-600'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Card */}
      <div className="p-4">
        {account ? (
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🧑‍🌾</span>
              <div>
                <p className="text-xs font-semibold text-plant-600">🌱 植物主人</p>
                <p className="text-xs text-gray-400 font-mono">{displayAddress}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <p className="font-bold text-plant-600">{seedBalance}</p>
                <p className="text-gray-400">$SEED</p>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="text-center">
                <p className="font-bold text-gold-400">{pleafBalance}</p>
                <p className="text-gray-400">$PLEAF</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 text-center">
            <span className="text-3xl block mb-2">🔗</span>
            <p className="text-xs text-gray-500 mb-3">连接钱包以查看数据</p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="w-full btn-glow text-xs py-2 disabled:opacity-50"
            >
              {connecting ? '连接中...' : '连接钱包'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}