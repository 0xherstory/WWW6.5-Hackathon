import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiShare, HiUser } from 'react-icons/hi'
import { connectWallet, getConnectedAccount, shortenAddress, subscribeWallet } from '../utils/chain'

const navItems = [
  { to: '/', end: true, label: '首页', icon: HiHome },
  { to: '/tree', label: '知识树', icon: HiShare },
  { to: '/profile', label: '我的档案', icon: HiUser },
]

const linkBase =
  'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white'

export default function Navbar() {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    let active = true

    getConnectedAccount()
      .then((value) => {
        if (active) setAccount(value)
      })
      .catch(() => {
        if (active) setAccount(null)
      })

    const unsubscribe = subscribeWallet((value) => {
      if (active) setAccount(value)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  async function handleConnect() {
    try {
      const nextAccount = await connectWallet()
      setAccount(nextAccount)
    } catch (error) {
      window.alert(error?.message || '钱包连接失败，请稍后重试。')
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[rgba(255,255,255,0.04)] backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="group shrink-0">
          <motion.span
            className="inline-block bg-gradient-to-r from-coral-500 via-amber-400 to-violet-400 bg-clip-text text-lg font-semibold tracking-tight text-transparent"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            HerLemma
          </motion.span>
        </Link>

        <ul className="flex flex-1 items-center justify-center gap-1 sm:gap-2">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} end={end}>
                {({ isActive }) => (
                  <motion.span
                    className={`${linkBase} ${isActive ? 'text-white' : ''}`}
                    whileHover={{ y: -1 }}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="hidden sm:inline">{label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-coral-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {account ? (
          <motion.div
            className="hidden shrink-0 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-amber-400/90 sm:block"
            whileHover={{ scale: 1.03, borderColor: 'rgba(255,107,107,0.35)' }}
          >
            {shortenAddress(account)}
          </motion.div>
        ) : (
          <motion.button
            type="button"
            onClick={handleConnect}
            className="hidden shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] font-semibold text-amber-200/90 sm:block"
            whileHover={{ scale: 1.03, borderColor: 'rgba(249,202,36,0.55)' }}
            whileTap={{ scale: 0.98 }}
          >
            连接钱包
          </motion.button>
        )}
      </nav>
    </header>
  )
}
