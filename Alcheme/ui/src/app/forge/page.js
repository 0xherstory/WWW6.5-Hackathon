'use client';
import { useState, useEffect } from 'react';

export default function Forge() {
  const [cards, setCards] = useState([]); // 我的卡片列表

  // ================================
  // 【接口 1】获取已合成的卡片
  // GET /api/cards
  // ================================
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch('/api/cards');
        const data = await res.json();
        setCards(data);
      } catch (err) {
        // 演示假数据
        setCards([
          { id: 1, name: "学习达人", description: "持续学习成长" },
          { id: 2, name: "运动健将", description: "坚持运动锻炼" },
        ]);
      }
    };
    fetchCards();
  }, []);

  // ================================
  // 【接口 2】铸造SBT勋章（上链）
  // POST /api/forge
  // ================================
  const handleForge = async () => {
    try {
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: cards.map(c => c.id) }),
      });

      const result = await res.json();
      alert("勋章铸造成功！交易哈希：" + result.txHash);
    } catch (err) {
      alert("演示模式：勋章铸造成功！");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">✨ 身份铸造</h1>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl mb-4">可用于铸造的卡片</h2>
          {cards.map(card => (
            <div key={card.id} className="p-4 bg-yellow-600 rounded-lg mb-2">
              {card.name}
            </div>
          ))}
        </div>

        <button
          onClick={handleForge}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl text-xl font-bold"
        >
          铸造区块链勋章（SBT）
        </button>
      </div>
    </main>
  );
}
