import { useState } from 'react'
import { communityPosts, trendingPlants, helpfulUsers } from '../data/mockData'

export default function Community() {
  const [posts, setPosts] = useState(communityPosts)

  const toggleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">👥 社区</h2>
          <p className="text-sm text-gray-400">分享你的植物故事，与社区一起成长</p>
        </div>
        <button className="btn-glow flex items-center gap-2">
          <span>✏️</span>
          <span>发布动态</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="col-span-2 space-y-4">
          {posts.map(post => (
            <div key={post.id} className="glass-card p-6">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-plant-50 flex items-center justify-center text-xl">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{post.author}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{post.time}</p>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400 font-mono">{post.wallet}</span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">•••</button>
              </div>

              {/* Post Content */}
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>

              {/* Post Image */}
              <div className="w-full h-40 rounded-xl bg-plant-50 flex items-center justify-center text-5xl mb-3">
                {post.image}
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-plant-400/10 text-plant-600 text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Interactions */}
              <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <span>❤️</span>
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-plant-600 transition-colors">
                  <span>💬</span>
                  <span>{post.comments}</span>
                </button>
                <button className={`flex items-center gap-2 text-sm transition-colors ${
                  post.bookmarked ? 'text-gold-400' : 'text-gray-500 hover:text-gold-400'
                }`}>
                  <span>🔖</span>
                  <span>{post.bookmarked ? '已收藏' : '收藏'}</span>
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-plant-600 transition-colors ml-auto">
                  <span>🔗</span>
                  <span>分享</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending Plants */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">🔥 趋势植物</h3>
            <div className="space-y-3">
              {trendingPlants.map((plant, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-plant-400/5 cursor-pointer transition-colors">
                  <span className="text-2xl">{plant.image}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{plant.name}</p>
                    <p className="text-xs text-gray-400">关注度上升中</p>
                  </div>
                  <span className="text-xs font-semibold text-plant-600">{plant.trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Users */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">🌟 活跃用户</h3>
            <div className="space-y-3">
              {helpfulUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-plant-400/5 cursor-pointer transition-colors">
                  <span className="text-2xl">{user.avatar}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-400">帮助值 {user.helpfulness}/100</p>
                  </div>
                  <div className="progress-bar w-12">
                    <div className="progress-fill" style={{ width: `${user.helpfulness}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-gray-800 mb-4">📊 社区数据</h3>
            <div className="space-y-2 text-center">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-plant-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-plant-600">1,247</p>
                  <p className="text-[10px] text-gray-400">活跃成员</p>
                </div>
                <div className="bg-plant-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-plant-600">3,892</p>
                  <p className="text-[10px] text-gray-400">植物 NFT</p>
                </div>
                <div className="bg-plant-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-gold-400">56.2K</p>
                  <p className="text-[10px] text-gray-400">$SEED 发放</p>
                </div>
                <div className="bg-plant-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-gold-400">1,058</p>
                  <p className="text-[10px] text-gray-400">$PLEAF 流通</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}