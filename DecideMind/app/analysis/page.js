'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = "0xdC114568922614C9F3Be72225220e7bDc5ff50f0"
const ABI = [
  {
    "inputs": [{"internalType":"string","name":"question","type":"string"},{"internalType":"string","name":"aiResult","type":"string"}],
    "name":"saveDecision",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
]

export default function AnalysisPage() {
  const searchParams = useSearchParams()
  const input = searchParams.get('input') || '我要不要做这个决策？'
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null)
  const [txLoading, setTxLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  useEffect(() => {
    setTimeout(() => {
      const res = {
        q: input,
        pros: ['提升成长空间', '摆脱内耗环境', '拓宽行业人脉'],
        cons: ['短期不稳定', '压力增加', '需要重新适应'],
        suggest: '建议谨慎尝试，稳步推进。',
        score: '78%'
      }
      setResult(res)
      setLoading(false)

      const history = JSON.parse(localStorage.getItem('decisionHistory') || '[]')
      localStorage.setItem('decisionHistory', JSON.stringify([{ ...res, time: new Date().toLocaleString() }, ...history]))
    }, 1500)
  }, [input])

  const saveToChain = async () => {
    setTxLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const content = `优势：${result.pros.join('，')} | 风险：${result.cons.join('，')} | 建议：${result.suggest}`
      const tx = await contract.saveDecision(result.q, content)
      await tx.wait()
      setTxHash(tx.hash)
      localStorage.setItem('hasProof', 'true')
      alert('✅ 上链存证成功！现在可以去领取SBT徽章！')
    } catch (e) {
      console.error(e)
      alert('上链失败')
    } finally {
      setTxLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2>🤖 AI 决策分析结果</h2>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', marginTop: '1rem' }}>
          {loading ? <p>AI 分析中…</p> : (
            <>
              <p><strong>问题：</strong>{result.q}</p>
              <p><strong>✅ 优势：</strong>{result.pros.join('，')}</p>
              <p><strong>❌ 风险：</strong>{result.cons.join('，')}</p>
              <p><strong>💡 建议：</strong>{result.suggest}</p>
              <p><strong>置信度：</strong>{result.score}</p>

              <button onClick={saveToChain} disabled={txLoading}
                style={{ width: '100%', padding: '1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', marginTop: '1rem' }}>
                {txLoading ? '上链中…' : '🔗 上链存证'}
              </button>

              {txHash && <p style={{ color: '#16a34a', marginTop: '1rem' }}>✅ 上链成功！</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}