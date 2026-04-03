'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [input, setInput] = useState('')
  const router = useRouter()

  const startAnalyze = () => {
    if (!input) return alert('请输入你的决策问题')
    router.push(`/analysis?input=${encodeURIComponent(input)}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: '#fff',
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>🤖 AI 决策助手</h1>
        <p>输入你正在纠结的决策，我来帮你分析利弊</p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：我该不该换工作？是否要创业？要不要离开现在的城市？"
          style={{
            width: '100%',
            height: '120px',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginTop: '1rem',
            fontSize: '1rem'
          }}
        />

        <button
          onClick={startAnalyze}
          style={{
            width: '100%',
            padding: '1rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            marginTop: '1rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
          🚀 开始 AI 分析
        </button>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => router.push('/history')}
            style={{ flex: 1, padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }}>
            📜 历史记录
          </button>
          <button onClick={() => router.push('/badge')}
            style={{ flex: 1, padding: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff' }}>
            🏅 我的徽章
          </button>
        </div>
      </div>
    </div>
  )
}