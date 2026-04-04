import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Zap, ArrowLeft, MessageSquare, Calendar, Trash2, Palette, Link as LinkIcon, Share2, Wallet, Download, Grid } from 'lucide-react';
import { ethers } from 'ethers';

// --- 合约配置 ---
const CONTRACT_ADDRESS = "0x2fc9192E29d514De1A496D5b3BAb37E227082BB9";
const CONTRACT_ABI = [
  "function recordThought(string habitName, string thought, string timestamp) public",
  "function recordProgress(string habitName, uint256 currentCount, uint256 target) public"
];

// --- 工具函数：Hex 转 RGBA ---
const hexToRGBA = (hex, alpha = 1) => {
  let r = 0, g = 0, b = 0;
  if (!hex) return `rgba(255,255,255,${alpha})`;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HabitDashboard = () => {
  // --- 状态管理 ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('islelandHabits_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [account, setAccount] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const heatmapRef = useRef(null);

  const [newHabit, setNewHabit] = useState({
    name: '', icon: '🌱', target: 0, color: ['#8B5CF6', '#A78BFA', '#C4B5FD']
  });

  useEffect(() => {
    localStorage.setItem('islelandHabits_v2', JSON.stringify(habits));
    document.title = "Isleland - 你的习惯岛屿";
  }, [habits]);

  // --- 区块链逻辑 ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) { alert("用户拒绝连接钱包"); }
    } else { alert("请安装 MetaMask 钱包！"); }
  };

  const getContract = async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const syncThoughtToChain = async (habitName, record) => {
    if (!account) return alert("请先连接钱包");
    if (!record.thought) return alert("想法为空，无法上链");
    setIsSyncing(true);
    try {
      const contract = await getContract();
      const tx = await contract.recordThought(habitName, record.thought, record.time);
      await tx.wait();
      alert("想法已成功永久上链！交易哈希: " + tx.hash);
    } catch (error) {
      alert("上链失败: " + (error.reason || "未知错误"));
    } finally { setIsSyncing(false); }
  };

  const syncProgressToChain = async (habit) => {
    if (!account) return alert("请先连接钱包");
    setIsSyncing(true);
    try {
      const contract = await getContract();
      const tx = await contract.recordProgress(habit.name, habit.current, habit.target);
      await tx.wait();
      alert("进度数据已同步至区块链！");
    } catch (error) {
      alert("同步失败");
    } finally { setIsSyncing(false); }
  };

  // --- 基础逻辑函数 ---
  const handleQuickCheckIn = (e, habitId) => {
    e.stopPropagation();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeString = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return { 
          ...h, current: h.current + 1, streak: h.streak + 1,
          records: [{ id: Date.now(), time: timeString, date: dateStr, thought: '' }, ...(h.records || [])]
        };
      }
      return h;
    }));
  };

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    setHabits([...habits, { ...newHabit, id: Date.now(), current: 0, streak: 0, records: [] }]);
    setShowAddModal(false);
    setNewHabit({ name: '', icon: '🌱', target: 0, color: ['#8B5CF6', '#A78BFA', '#C4B5FD'] });
  };

  const updateThought = (habitId, recordId, text) => {
    setHabits(prev => prev.map(h => h.id === habitId ? {
      ...h, records: h.records.map(r => r.id === recordId ? { ...r, thought: text } : r)
    } : h));
  };

  const deleteRecord = (habitId, recordId) => {
    if (window.confirm('确定要删除这条记录吗？打卡次数也将扣除。')) {
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h, current: Math.max(0, h.current - 1),
            records: h.records.filter(r => r.id !== recordId)
          };
        }
        return h;
      }));
    }
  };

  const handleDeleteHabit = (e, habitId) => {
    e.stopPropagation();
    if (window.confirm('确定要让这座岛屿从海面上消失吗？')) setHabits(habits.filter(h => h.id !== habitId));
  };

  const exportHeatmapAsPNG = (habitName, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600; canvas.height = 300;
    ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color; ctx.font = '20px Arial';
    ctx.fillText(`${habitName} - 航行能量图`, 40, 50);
    // 简易绘制示意
    for(let i=0; i<60; i++) {
        ctx.fillStyle = i % 3 === 0 ? color : '#1e1e3e';
        ctx.fillRect(40 + (i%15)*30, 80 + Math.floor(i/15)*30, 20, 20);
    }
    const link = document.createElement('a');
    link.download = `${habitName}_stats.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // --- 内部组件：热力图 ---
  const Heatmap = ({ records, themeColor, habitName }) => {
    const today = new Date();
    const days = Array.from({ length: 84 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (83 - i));
      return d.toISOString().split('T')[0];
    });

    const dataMap = records.reduce((acc, r) => {
      if (r.date) acc[r.date] = (acc[r.date] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {days.map(date => {
            const count = dataMap[date] || 0;
            return (
              <div key={date} className="heatmap-cell"
                style={{ 
                  backgroundColor: count > 0 ? themeColor : 'rgba(255,255,255,0.05)',
                  opacity: count > 0 ? Math.min(0.4 + count * 0.2, 1) : 1
                }}
                title={`${date}: ${count} 次打卡`}
              />
            );
          })}
        </div>
        <div className="heatmap-legend">
          <span>最近 84 天活动能量 (Sea Energy)</span>
          <button onClick={() => exportHeatmapAsPNG(habitName, themeColor)} className="download-btn-small">
            <Download size={12} /> 保存图片
          </button>
        </div>
      </div>
    );
  };

  // --- 详情页组件 ---
  const DetailPage = ({ habit, onBack }) => {
    const [editingId, setEditingId] = useState(null);
    const [tempThought, setTempThought] = useState('');

    return (
      <div className="detail-overlay" onClick={onBack}>
        <div className="detail-card" onClick={e => e.stopPropagation()}>
          {isSyncing && <div className="loading-mask">正在穿越星门，同步数据到区块链... ✨</div>}
          
          <header className="detail-header">
            <button className="back-circle" onClick={onBack}><ArrowLeft size={20} /></button>
            <div className="detail-main-info">
              <span className="detail-icon-large">{habit.icon}</span>
              <h2>{habit.name}</h2>
              <button className="chain-sync-btn" onClick={() => syncProgressToChain(habit)}>
                <Share2 size={14} /> 同步进度至区块链
              </button>
            </div>
          </header>

          <div className="records-container">
            <section className="stats-section">
                <h3 className="section-title"><Grid size={16} /> 数据看板 (Island Stats)</h3>
                <Heatmap records={habit.records || []} themeColor={habit.color[0]} habitName={habit.name} />
            </section>

            <section className="logs-section">
                <h3 className="section-title"><Calendar size={16} /> 航海日志 (Sea Log)</h3>
                {habit.records?.length > 0 ? (
                habit.records.map(record => (
                    <div key={record.id} className="record-item" style={{'--accent-color': habit.color[0]}}>
                    <div className="record-top">
                        <span className="record-time">{record.time}</span>
                        <div className="record-actions">
                        {record.thought && (
                            <button className="onchain-btn" onClick={() => syncThoughtToChain(habit.name, record)} title="存入区块链">
                            <LinkIcon size={14} /> 上链
                            </button>
                        )}
                        <button className="edit-thought-btn" onClick={() => { setEditingId(record.id); setTempThought(record.thought); }}>
                            <MessageSquare size={14} />
                        </button>
                        <button className="record-delete-small-btn" onClick={() => deleteRecord(habit.id, record.id)}>
                            <Trash2 size={14} />
                        </button>
                        </div>
                    </div>
                    {editingId === record.id ? (
                        <div className="thought-editor">
                        <textarea autoFocus value={tempThought} onChange={e => setTempThought(e.target.value)} placeholder="此刻的想法..." />
                        <div className="editor-actions">
                            <button onClick={() => setEditingId(null)}>取消</button>
                            <button className="save-btn" onClick={() => { updateThought(habit.id, record.id, tempThought); setEditingId(null); }}>保存日志</button>
                        </div>
                        </div>
                    ) : (
                        <p className="record-thought">
                        {record.thought || <span className="empty-hint">点击编辑按钮，记录下此刻的心得...</span>}
                        </p>
                    )}
                    </div>
                ))
                ) : (
                <div className="empty-logs">海面上风平浪静，还没有任何打卡记录。</div>
                )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="isleland-app">
      <div className="cosmic-bg">
        <div className="sun-halo"></div>
        <div className="stars-cluster"></div>
        <div className="stars-cluster-2"></div>
        <div className="shooting-star meteor-1"></div>
        <div className="shooting-star meteor-2"></div>
      </div>
      
      <div className="dashboard-wrapper">
        <header className="app-header">
          <div className="brand-box">
            <h1>Isleland</h1>
            <p>在宇宙星尘中点亮你的习惯 🌌</p>
          </div>
          <div className="header-right">
            <button className={`wallet-btn ${account ? 'connected' : ''}`} onClick={connectWallet}>
              <Wallet size={18} />
              <span>{account ? `${account.substring(0, 6)}...${account.substring(38)}` : "连接钱包"}</span>
            </button>
            <button className="main-add-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={20} /> <span>唤醒岛屿</span>
            </button>
          </div>
        </header>

        <div className="habits-grid">
          {habits.map(habit => (
            <div 
              key={habit.id} 
              className="habit-card" 
              style={{ 
                '--accent-color': habit.color[0],
                '--accent-soft': hexToRGBA(habit.color[0], 0.25)
              }} 
              onClick={() => setSelectedHabit(habit)}
            >
              <button className="card-delete-btn" onClick={(e) => handleDeleteHabit(e, habit.id)}><X size={14} /></button>
              <div className="card-top">
                <div className="icon-sphere" style={{ background: `linear-gradient(135deg, ${habit.color[0]}, #fff)` }}>{habit.icon}</div>
                <div className="name-box">
                  <h3>{habit.name}</h3>
                  <div className="streak-tag"><Zap size={10} fill="currentColor"/> {habit.streak}天连胜</div>
                </div>
              </div>
              {habit.target > 0 && (
                <div className="progress-area">
                  <div className="progress-label"><span>探索进度</span><span>{habit.current}/{habit.target}</span></div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (habit.current / habit.target) * 100)}%`, background: habit.color[0] }} />
                  </div>
                </div>
              )}
              <button className="quick-check-btn" style={{ background: habit.color[0] }} onClick={(e) => handleQuickCheckIn(e, habit.id)}>激活能量</button>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="empty-islands-box" onClick={() => setShowAddModal(true)}>
              <div className="empty-plus">+</div>
              <p>海面上还没有岛屿，点击唤醒第一座</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="nature-modal-horizontal" onClick={e => e.stopPropagation()}>
            <div className="modal-left">
              <div className="modal-header-fancy">
                <h2>唤醒岛屿</h2>
                <p>开启一段新的自律航程</p>
              </div>
              <div className="input-field">
                <label>岛屿之名</label>
                <input placeholder="为你的岛屿命名..." value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})} />
              </div>
              <div className="input-field">
                <label>守护元素</label>
                <div className="nature-grid">
                  {['🌱', '🌊', '🏔️', '🔥', '☁️', '🌙', '☀️', '❄️', '🌵', '🦋'].map(emoji => (
                    <button key={emoji} className={newHabit.icon === emoji ? 'active' : ''} onClick={() => setNewHabit({...newHabit, icon: emoji})}>{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-right">
              <div className="input-field">
                <label>岛屿色彩</label>
                <div className="color-picker-wrapper">
                  <input type="color" value={newHabit.color[0]} onChange={e => setNewHabit({...newHabit, color: [e.target.value, e.target.value + 'CC', e.target.value + '99']})} />
                  <span className="color-hint">点击捕捉色彩灵感</span>
                </div>
              </div>
              <div className="input-field">
                <label>月度能量目标 (0为不设限)</label>
                <div className="target-pill">
                  <button onClick={() => setNewHabit({...newHabit, target: Math.max(0, newHabit.target - 1)})}>-</button>
                  <input readOnly value={newHabit.target === 0 ? "无尽模式" : newHabit.target} />
                  <button onClick={() => setNewHabit({...newHabit, target: newHabit.target + 1})}>+</button>
                </div>
              </div>
              <button className="confirm-fancy" onClick={handleAddHabit}>开启岛屿新篇章</button>
              <button className="cancel-simple" onClick={() => setShowAddModal(false)}>暂不开启</button>
            </div>
          </div>
        </div>
      )}

      {selectedHabit && <DetailPage habit={habits.find(h => h.id === selectedHabit.id)} onBack={() => setSelectedHabit(null)} />}

      <style>{`
        /* 全局基础 */
        .isleland-app { min-height: 100vh; background: #020208; color: white; font-family: system-ui, -apple-system, sans-serif; position: relative; overflow-x: hidden; }
        .cosmic-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        
        .sun-halo {
          position: absolute; top: -150px; right: -150px; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255, 180, 50, 0.2) 0%, rgba(255, 100, 0, 0.05) 50%, transparent 70%);
          filter: blur(60px); border-radius: 50%; animation: sun-move 20s infinite ease-in-out;
        }
        @keyframes sun-move { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1) translate(-20px, 20px); } }

        .stars-cluster { position: absolute; inset: 0; background-image: radial-gradient(1px 1px at 20px 30px, #fff, transparent); background-size: 150px 150px; opacity: 0.4; }
        .shooting-star { position: absolute; width: 2px; height: 100px; background: linear-gradient(-45deg, #fff, transparent); opacity: 0; animation: meteor 7s infinite linear; }
        .meteor-1 { top: 10%; left: 80%; animation-delay: 1s; }
        .meteor-2 { top: 30%; left: 90%; animation-delay: 4s; }
        @keyframes meteor { 0% { transform: translate(0,0) rotate(45deg); opacity: 0; } 5% { opacity: 1; } 15% { transform: translate(-800px, 800px) rotate(45deg); opacity: 0; } 100% { opacity: 0; } }

        /* 主页面布局 */
        .dashboard-wrapper { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
        .brand-box h1 { font-size: 2.5rem; margin: 0; font-weight: 900; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .brand-box p { color: rgba(255,255,255,0.4); font-size: 14px; }

        .header-right { display: flex; gap: 15px; }
        .wallet-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px 18px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: 0.3s; }
        .wallet-btn.connected { border-color: #10B981; color: #10B981; background: rgba(16,185,129,0.1); }
        .main-add-btn { background: white; color: #020208; border: none; padding: 12px 22px; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; }

        /* 岛屿卡片 */
        .habits-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 40px; }
        .habit-card { 
          width: 260px; height: 260px; border-radius: 50% !important; border: 3px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
          backdrop-filter: blur(20px); position: relative; display: flex; flex-direction: column; 
          align-items: center; justify-content: center; padding: 30px; transition: 0.4s;
          animation: breathe 6s infinite ease-in-out; cursor: pointer;
        }
        .habit-card:hover { transform: scale(1.05) translateY(-5px); border-color: var(--accent-color); }
        @keyframes breathe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .card-delete-btn { position: absolute; top: 25px; right: 25px; background: rgba(0,0,0,0.2); border: none; color: #ff4d4d; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
        .habit-card:hover .card-delete-btn { opacity: 1; }

        .icon-sphere { width: 55px; height: 55px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .name-box { text-align: center; color: white; margin-bottom: 12px; }
        .name-box h3 { margin: 0; font-size: 1.2rem; }
        .streak-tag { font-size: 11px; opacity: 0.7; display: flex; align-items: center; justify-content: center; gap: 4px; }

        .progress-area { width: 80%; margin-bottom: 15px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; opacity: 0.8; }
        .progress-bar-bg { height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 10px; transition: 0.6s; }

        .quick-check-btn { border: none; padding: 8px 20px; border-radius: 20px; color: white; font-weight: 800; cursor: pointer; transition: 0.3s; font-size: 13px; }
        .quick-check-btn:hover { filter: brightness(1.2); transform: scale(1.05); }

        /* 横向弹窗样式 */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .nature-modal-horizontal { 
            background: white; color: #1a1a3e; width: 850px; max-width: 95vw; border-radius: 40px; 
            display: flex; padding: 45px; gap: 50px; animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-left, .modal-right { flex: 1; display: flex; flex-direction: column; gap: 20px; }

        .input-field label { display: block; font-weight: 800; font-size: 13px; margin-bottom: 10px; color: #666; }
        .input-field input[type="text"] { width: 100%; padding: 14px; border-radius: 15px; border: 1.5px solid #eee; background: #f9f9f9; outline: none; }
        .nature-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .nature-grid button { font-size: 22px; background: #f3f4f6; border: 2px solid transparent; border-radius: 15px; padding: 10px; cursor: pointer; transition: 0.2s; }
        .nature-grid button.active { border-color: #6366f1; background: #eef2ff; }

        .color-picker-wrapper { display: flex; align-items: center; gap: 15px; }
        .color-picker-wrapper input[type="color"] { width: 50px; height: 50px; border: none; cursor: pointer; background: none; }
        .target-pill { display: inline-flex; align-items: center; background: #f3f4f6; padding: 6px; border-radius: 30px; }
        .target-pill button { width: 34px; height: 34px; border-radius: 50%; border: none; background: white; font-weight: 900; cursor: pointer; }
        .target-pill input { width: 80px; text-align: center; border: none; background: none; font-weight: 800; }

        .confirm-fancy { margin-top: 20px; padding: 18px; border-radius: 18px; border: none; background: #1a1a3e; color: white; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .confirm-fancy:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .cancel-simple { background: none; border: none; color: #999; font-size: 13px; cursor: pointer; }

        /* 详情页记录 */
        .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
        .detail-card { background: #0a0a1a; width: 680px; height: 85vh; border-radius: 35px; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; overflow: hidden; position: relative; }
        .loading-mask { position: absolute; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; color: #a5b4fc; font-weight: 800; }
        
        .detail-header { padding: 40px 20px 20px; text-align: center; position: relative; }
        .back-circle { position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.05); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .detail-icon-large { font-size: 60px; display: block; margin-bottom: 10px; }
        .chain-sync-btn { background: rgba(99,102,241,0.1); border: 1px solid #6366f1; color: #a5b4fc; padding: 6px 14px; border-radius: 20px; font-size: 12px; cursor: pointer; margin-top: 10px; }

        .records-container { flex: 1; overflow-y: auto; padding: 20px 40px 40px; }
        .section-title { font-size: 1rem; color: #a5b4fc; display: flex; align-items: center; gap: 8px; margin: 30px 0 15px; opacity: 0.8; }
        
        .heatmap-container { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .heatmap-grid { display: grid; grid-template-columns: repeat(14, 1fr); gap: 6px; }
        .heatmap-cell { aspect-ratio: 1; border-radius: 3px; }
        .heatmap-legend { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px; color: #666; }
        .download-btn-small { background: none; border: 1px solid #333; color: #888; padding: 3px 8px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px; }

        .record-item { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 18px; margin-bottom: 15px; border-left: 4px solid var(--accent-color); transition: 0.3s; }
        .record-item:hover { background: rgba(255,255,255,0.06); }
        .record-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .record-time { font-size: 12px; color: #555; font-family: monospace; }
        .record-actions { display: flex; gap: 12px; }
        .onchain-btn { background: rgba(16,185,129,0.1); border: 1px solid #10B981; color: #34D399; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 3px; }
        .record-thought { margin: 0; font-size: 14px; line-height: 1.6; color: #eee; }
        .thought-editor textarea { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 10px; border-radius: 10px; min-height: 70px; resize: none; outline: none; }
        .editor-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .editor-actions button { padding: 5px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; border: none; }
        .save-btn { background: #6366f1; color: white; }

        .empty-islands-box { grid-column: 1/-1; padding: 60px; border: 2px dashed rgba(255,255,255,0.1); border-radius: 40px; text-align: center; cursor: pointer; opacity: 0.6; }
        .empty-islands-box:hover { opacity: 1; border-color: white; background: rgba(255,255,255,0.02); }
        .empty-plus { font-size: 40px; margin-bottom: 10px; }

        @media (max-width: 600px) {
          .nature-modal-horizontal { flex-direction: column; padding: 25px; height: 90vh; overflow-y: auto; }
          .habits-grid { justify-items: center; }
          .habit-card { width: 240px; height: 240px; }
        }
      `}</style>
    </div>
  );
};

export default HabitDashboard;