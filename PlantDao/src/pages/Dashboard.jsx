import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { plants, growthData, weeklyCareActivity, dailyTasks, userData } from '../data/mockData'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function Dashboard() {
  const [tasks, setTasks] = useState(dailyTasks)
  const fp = plants[0]

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t))

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } },
    scales: { y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
    elements: { point: { radius: 4, hoverRadius: 6 } },
  }

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🌿</span>
          <p className="text-2xl font-bold text-plant-600 mt-1">{userData.totalPlants}</p>
          <p className="text-xs text-gray-500">My Plants</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🔥</span>
          <p className="text-2xl font-bold text-orange-500 mt-1">{userData.careStreak}</p>
          <p className="text-xs text-gray-500">Care Streak</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🌱</span>
          <p className="text-2xl font-bold text-plant-600 mt-1">{userData.seedBalance}</p>
          <p className="text-xs text-gray-500">$SEED</p>
        </div>
        <div className="glass-card p-4 text-center">
          <span className="text-2xl">🍃</span>
          <p className="text-2xl font-bold text-gold-400 mt-1">{userData.pleafBalance}</p>
          <p className="text-xs text-gray-500">$PLEAF</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Featured Plant */}
        <div className="col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-800">Featured Plant</h3>
                <span className="nft-badge">NFT {fp.tokenId}</span>
              </div>
              <p className="text-sm text-gray-500">{fp.species} - {fp.effortLabel}</p>
            </div>
            <Link to={`/plant/${fp.id}`} className="text-sm text-plant-600 hover:underline">Details</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-plant-50 flex items-center justify-center text-6xl shadow-glow">{fp.image}</div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold text-gray-800">{fp.name}</h4>
                <span className="health-dot bg-green-500"></span>
                <span className="text-sm text-gray-500">HP {fp.health}%</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${fp.health}%` }}></div></div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Growth</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-lg ${i < Math.floor(fp.growthLevel / 4) ? '' : 'opacity-30'}`}>⭐</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-plant-600">Lv.{fp.growthLevel}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-blue-50 rounded-lg p-2">💧 Water {fp.water}%</div>
                <div className="bg-yellow-50 rounded-lg p-2">☀️ Sun {fp.sunlight}%</div>
                <div className="bg-amber-50 rounded-lg p-2">🌱 Soil {fp.soil}%</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn-glow flex items-center gap-2"><span>💧</span><span>Care Now</span></button>
          </div>
        </div>

        {/* Care Actions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🌱 Care Actions</h3>
          <div className="space-y-3">
            {[
              { icon: '💧', label: 'Water', reward: '5', bg: 'blue' },
              { icon: '🧪', label: 'Fertilize', reward: '5', bg: 'green' },
              { icon: '🪴', label: 'Repot', reward: '10', bg: 'amber' },
              { icon: '💊', label: 'Medicine', reward: '5', bg: 'purple' },
              { icon: '📸', label: 'Photo', reward: '2', bg: 'cyan' },
            ].map((a) => (
              <button key={a.label} className={`w-full flex items-center gap-3 p-3 rounded-xl bg-${a.bg}-50 hover:bg-${a.bg}-100 transition-colors text-left`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{a.label}</p>
                  <p className="text-xs text-gray-400">+{a.reward} $SEED</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Growth Tracking</h3>
          <div className="h-56"><Line data={growthData} options={chartOpts} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Daily Tasks</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${task.completed ? 'bg-plant-400/10' : 'hover:bg-gray-50'}`}>
                <span className="text-lg">{task.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.task}</p>
                  <p className="text-xs text-plant-600 font-medium">+{task.reward} $SEED</p>
                </div>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-plant-400 border-plant-400 text-white' : 'border-gray-300'}`}>
                  {task.completed && '✓'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Weekly Care</h3>
          <div className="h-44"><Bar data={weeklyCareActivity} options={barOpts} /></div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💎 Token Rewards</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">🌱 $SEED</span>
              <span className="text-sm font-bold text-plant-600">{userData.seedBalance}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(userData.seedBalance / 5000) * 100}%` }}></div></div>
          </div>
          <div className="bg-gold-400/10 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-2"><span>🍃</span><span className="text-sm font-semibold text-gray-700">$SEED to $PLEAF</span></div>
            <p className="text-xs text-gray-500 mb-3">1000 $SEED = 1 $PLEAF</p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Amount" className="flex-1 px-3 py-2 rounded-lg bg-white/80 border border-gray-200 text-sm focus:outline-none focus:border-plant-400" />
              <button className="btn-gold text-xs px-4 py-2">Convert</button>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-glow flex items-center justify-center gap-2 py-3"><span>🌱</span><span>Add Plant</span></button>
            <button className="w-full btn-gold flex items-center justify-center gap-2 py-3"><span>✨</span><span>Mint NFT</span></button>
            <Link to="/marketplace" className="w-full btn-outline flex items-center justify-center gap-2 py-3 block text-center"><span>🛒</span><span>Marketplace</span></Link>
            <Link to="/dao" className="w-full btn-outline flex items-center justify-center gap-2 py-3 block text-center"><span>🏛️</span><span>DAO Vote</span></Link>
          </div>
          <div className="mt-4 bg-plant-400/5 rounded-xl p-3">
            <p className="text-xs font-semibold text-plant-600 mb-1">📐 Reward Formula</p>
            <p className="text-[10px] text-gray-500">Reward = Base x Effort x Quality x Consistency</p>
            <p className="text-[10px] text-gray-400 mt-1">Harder plants = more $SEED</p>
          </div>
        </div>
      </div>
    </div>
  )
}
