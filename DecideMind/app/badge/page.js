'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const SBT_CONTRACT_ADDRESS = "0x62E6c367e399eB7D7071754F80aDA7D716517960"
const SBT_ABI = [
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name":"mintBadge",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs": [{"internalType":"address","name":"","type":"address"}],
    "name":"hasMinted",
    "outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view",
    "type":"function"
  }
]

export default function Badge() {
  const [loading, setLoading] = useState(false)
  const [minted, setMinted] = useState(false)
  const [wallet, setWallet] = useState('')
  const hasProof = localStorage.getItem('hasProof')

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        setWallet(accounts[0])
        checkMinted(accounts[0])
      }
    }
    init()
  }, [])

  async function checkMinted(address) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(SBT_CONTRACT_ADDRESS, SBT_ABI, provider)
      const status = await contract.hasMinted(address)
      setMinted(status)
    } catch (err) {
      console.log(err)
    }
  }

  async function mintBadge() {
    if (!wallet) return alert("请先连接钱包")
    if (!hasProof) return alert("请先完成上链存证才能领取！")

    setLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(SBT_CONTRACT_ADDRESS, SBT_ABI, signer)
      const tx = await contract.mintBadge(wallet)
      await tx.wait()
      setMinted(true)
      alert("✅ SBT 徽章领取成功！")
    } catch (err) {
      console.log(err)
      alert("❌ 失败：只有合约部署者可领取！")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '16px' }}>
        <h2>🏅 决策达人 SBT 徽章</h2>
        {!hasProof ? (
          <p style={{ color: '#e11d48' }}>⚠️ 请先完成上链存证</p>
        ) : minted ? (
          <p style={{ color: '#16a34a' }}>✅ 已领取 SBT 徽章</p>
        ) : (
          <button onClick={mintBadge} disabled={loading}
            style={{ padding: '0.8rem 2rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px' }}>
            {loading ? '领取中…' : '🎖️ 领取 SBT 徽章'}
          </button>
        )}
      </div>
    </div>
  )
}