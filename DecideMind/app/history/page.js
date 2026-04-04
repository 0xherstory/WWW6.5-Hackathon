'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function History() {
  const [history, setHistory] = useState([])
  const router = useRouter()

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('decisionHistory') || '[]')
    setHistory(data)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2>📜 历史决策记录</h2>
        <button onClick={() => router.push('/')}
          style={{ padding: '0.6rem 1rem', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}>
          🏠 返回首页
        </button>

        {history.length === 0 ? (
          <p>暂无历史记录</p>
        ) : (
          history.map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <p><strong>问题：</strong>{item.q}</p>
              <p><strong>建议：</strong>{item.suggest}</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{item.time}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}