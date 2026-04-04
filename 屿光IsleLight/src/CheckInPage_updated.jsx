import React, { useState, useEffect } from 'react';

const CheckInPage = ({ habit, onBack, onUpdate }) => {
  const [stars, setStars] = useState([]);
  const [meteors, setMeteors] = useState([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 使用传入的 habit 数据，如果没有则使用默认值
  const [currentHabit, setCurrentHabit] = useState(habit || {
    name: '晨间冥想',
    icon: '🧘',
    target: 30,
    streak: 7
  });

  // 当 habit prop 变化时更新当前习惯
  useEffect(() => {
    if (habit) {
      setCurrentHabit(habit);
      setCheckInCount(habit.current || 0);
    }
  }, [habit]);

  // 生成星星数据
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 200; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.7 + 0.3,
          twinkleDuration: Math.random() * 3 + 2,
          delay: Math.random() * 5
        });
      }
      setStars(newStars);
    };

    const generateMeteors = () => {
      const newMeteors = [];
      for (let i = 0; i < 5; i++) {
        newMeteors.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 50,
          length: Math.random() * 100 + 50,
          angle: Math.random() * 20 + 25,
          delay: Math.random() * 15 + 5,
          duration: Math.random() * 2 + 1
        });
      }
      setMeteors(newMeteors);
    };

    generateStars();
    generateMeteors();
  }, []);

  // 打卡功能 - 纯计数逻辑
  const handleCheckIn = async () => {
    if (isCheckingIn) return;
    
    setIsCheckingIn(true);
    
    // 模拟区块链交易确认
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedCount = checkInCount + 1;
    
    setCheckInCount(updatedCount);
    
    // 更新当前习惯数据 - 纯计数逻辑
    const updatedHabit = {
      ...currentHabit,
      current: updatedCount,
      checkInCount: updatedCount,
      streak: currentHabit.streak + 1
    };
    setCurrentHabit(updatedHabit);
    
    setShowSuccess(true);
    setIsCheckingIn(false);
    
    // 通知父组件更新数据
    if (onUpdate) {
      onUpdate(updatedHabit);
    }
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // 返回按钮
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="checkin-page">
      {/* 返回按钮 */}
      <button 
        className="back-button"
        onClick={handleBack}
      >
        <span className="back-arrow">←</span>
        <span>返回</span>
      </button>

      {/* 动态星空背景 */}
      <div className="starfield">
        <div className="star-layer layer-1">
          {stars.slice(0, 60).map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animation: `twinkle ${star.twinkleDuration}s infinite ${star.delay}s`
              }}
            />
          ))}
        </div>
        
        <div className="star-layer layer-2">
          {stars.slice(60, 120).map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 1.2}px`,
                height: `${star.size * 1.2}px`,
                animation: `twinkle ${star.twinkleDuration * 1.5}s infinite ${star.delay + 1}s`
              }}
            />
          ))}
        </div>
        
        <div className="star-layer layer-3">
          {stars.slice(120).map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size * 0.8}px`,
                height: `${star.size * 0.8}px`,
                animation: `twinkle ${star.twinkleDuration * 0.8}s infinite ${star.delay + 2}s`
              }}
            />
          ))}
        </div>

        {/* 流星 */}
        {meteors.map(meteor => (
          <div
            key={meteor.id}
            className="meteor"
            style={{
              left: `${meteor.x}%`,
              top: `${meteor.y}%`,
              width: `${meteor.length}px`,
              transform: `rotate(${meteor.angle}deg)`,
              animation: `meteor ${meteor.duration}s infinite ${meteor.delay}s`
            }}
          />
        ))}
      </div>

      {/* 小岛视觉元素 */}
      <div className="island-container">
        <div className="island">
          <div className="island-base">
            <div className="island-gradient" />
            <div className="island-shadow" />
          </div>
          
          <div className="island-trees">
            {[1, 2, 3, 4].map((tree, index) => (
              <div
                key={tree}
                className="tree"
                style={{
                  left: `${20 + index * 20}%`,
                  animation: `tree-sway ${4 + index * 0.5}s infinite ${index * 0.2}s`
                }}
              >
                <div className="tree-trunk" />
                <div className="tree-leaves" />
              </div>
            ))}
          </div>

          <div className="island-glow">
            <div className="glow-ring" />
            <div className="glow-ring glow-ring-2" />
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="content-wrapper">
        <div className="checkin-card">
          {/* 习惯信息 */}
          <div className="habit-header">
            <div className="habit-icon rotating-icon">
              {currentHabit.icon}
            </div>
            <div className="habit-info">
              <h2 className="habit-name">{currentHabit.name}</h2>
              <p className="habit-streak">
                🔥 连续打卡 {currentHabit.streak} 天
              </p>
            </div>
          </div>

          {/* 进度显示 */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">本月进度</span>
              <span className="progress-count">{checkInCount}/{currentHabit.target}</span>
            </div>
            
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${(checkInCount / currentHabit.target) * 100}%` }}
              >
                <div className="progress-glow" />
              </div>
            </div>

            {/* 区块链信息 */}
            <div className="blockchain-info">
              <div className="info-item">
                <span className="info-label">区块链高度</span>
                <span className="info-value">18,457,291</span>
              </div>
              <div className="info-item">
                <span className="info-label">交易哈希</span>
                <span className="info-value hash">
                  0x7a3f...9c2d
                </span>
              </div>
            </div>
          </div>

          {/* 打卡按钮 */}
          <button
            className={`checkin-button ${isCheckingIn ? 'checking' : ''}`}
            onClick={handleCheckIn}
            disabled={isCheckingIn}
          >
            {isCheckingIn ? (
              <div className="button-loading">
                <div className="loading-spinner" />
                <span>确认中...</span>
              </div>
            ) : (
              <>
                <span className="button-icon">✨</span>
                <span>立即打卡</span>
              </>
            )}
          </button>

          {/* 成功动画 */}
          {showSuccess && (
            <div className="success-overlay">
              <div className="success-content">
                <div className="success-icon">🎉</div>
                <h3 className="success-title">打卡成功！</h3>
                <p className="success-message">
                  你的记录已永久存储在区块链上
                </p>
                <div className="success-stars">
                  {[1, 2, 3].map(star => (
                    <span key={star} className="mini-star">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 历史记录 */}
        <div className="history-section">
          <h3 className="history-title">近期记录</h3>
          <div className="history-list">
            {[1, 2, 3, 4, 5].map((day, index) => (
              <div
                key={day}
                className="history-item"
                style={{
                  animation: `fade-in 0.4s ease-out ${0.3 + index * 0.1}s both`
                }}
              >
                <div className="history-date">
                  {new Date(Date.now() - day * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="history-status completed">
                  <span className="status-icon">✓</span>
                  <span className="status-text">已完成</span>
                </div>
                <div className="history-time">
                  {new Date(Date.now() - day * 24 * 60 * 60 * 1000).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .checkin-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #2a2a5e 100%);
          overflow: hidden;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* 返回按钮 */
        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .back-arrow {
          font-size: 18px;
          font-weight: 700;
        }

        /* 星空背景 */
        .starfield {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .star-layer {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .layer-1 {
          z-index: 1;
        }

        .layer-2 {
          z-index: 2;
        }

        .layer-3 {
          z-index: 3;
        }

        .star {
          position: absolute;
          background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 70%);
          border-radius: 50%;
          box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.3);
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.8); }
        }

        .meteor {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
          box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
          transform-origin: left center;
        }

        @keyframes meteor {
          0% {
            transform: translateX(0) rotate(25deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-300px) rotate(25deg);
            opacity: 0;
          }
        }

        /* 小岛元素 */
        .island-container {
          position: fixed;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          z-index: 2;
          pointer-events: none;
        }

        .island {
          position: relative;
          width: 100%;
          height: 100%;
          animation: island-float 6s ease-in-out infinite;
        }

        @keyframes island-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        .island-base {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          background: linear-gradient(135deg, #2d5a4a 0%, #1a3a2a 50%, #0d2a1a 100%);
          border-radius: 200px 200px 100px 100px / 100px 100px 50px 50px;
          box-shadow: 0 -20px 40px rgba(45, 90, 74, 0.3);
        }

        .island-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(100, 180, 150, 0.3) 0%, transparent 50%);
          border-radius: inherit;
        }

        .island-shadow {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 450px;
          height: 60px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%);
        }

        .island-trees {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 150px;
        }

        .tree {
          position: absolute;
          bottom: 0;
        }

        @keyframes tree-sway {
          0%, 100% { transform: rotate(0deg); }
          33% { transform: rotate(3deg); }
          66% { transform: rotate(-3deg); }
        }

        .tree-trunk {
          width: 8px;
          height: 40px;
          background: linear-gradient(90deg, #3d2817 0%, #2a1a0f 100%);
          border-radius: 2px;
          margin: 0 auto;
        }

        .tree-leaves {
          width: 0;
          height: 0;
          border-left: 25px solid transparent;
          border-right: 25px solid transparent;
          border-bottom: 50px solid #1a4a3a;
          position: relative;
          top: -10px;
          filter: drop-shadow(0 -5px 10px rgba(26, 74, 58, 0.5));
        }

        .tree-leaves::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-left: 18px solid transparent;
          border-right: 18px solid transparent;
          border-bottom: 35px solid #2a5a4a;
          top: 20px;
          left: -18px;
        }

        .island-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
        }

        .glow-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(100, 180, 255, 0.1) 0%, transparent 70%);
          border: 2px solid rgba(100, 180, 255, 0.2);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .glow-ring-2 {
          animation: glow-pulse 4s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes glow-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
        }

        /* 主要内容区域 */
        .content-wrapper {
          position: relative;
          z-index: 10;
          padding: 40px 20px;
          max-width: 420px;
          margin: 0 auto;
        }

        .checkin-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: fade-in 0.8s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 习惯信息 */
        .habit-header {
          display: flex;
          align-items: center;
          margin-bottom: 28px;
        }

        .habit-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(100, 180, 255, 0.2) 0%, rgba(100, 180, 255, 0.1) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-right: 16px;
          border: 2px solid rgba(100, 180, 255, 0.3);
          box-shadow: 0 4px 20px rgba(100, 180, 255, 0.2);
        }

        .rotating-icon {
          animation: rotate-slow 20s linear infinite;
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .habit-info {
          flex: 1;
        }

        .habit-name {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .habit-streak {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        /* 进度区域 */
        .progress-section {
          margin-bottom: 28px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .progress-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        .progress-count {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #64748b 0%, #94a3b8 50%, #cbd5e1 100%);
          border-radius: 4px;
          position: relative;
          transition: width 1s ease-out;
        }

        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* 区块链信息 */
        .blockchain-info {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Courier New', monospace;
        }

        .hash {
          color: rgba(100, 180, 255, 0.8);
        }

        /* 打卡按钮 */
        .checkin-button {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(100, 116, 139, 0.3);
          position: relative;
          overflow: hidden;
        }

        .checkin-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          animation: button-shimmer 3s infinite;
        }

        @keyframes button-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .checkin-button:hover:not(:disabled) {
          box-shadow: 0 6px 30px rgba(100, 116, 139, 0.4);
          transform: scale(1.02);
        }

        .checkin-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .checkin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-loading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 成功弹窗 */
        .success-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          z-index: 100;
          animation: success-appear 0.5s ease-out;
        }

        @keyframes success-appear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .success-content {
          text-align: center;
          padding: 20px;
          animation: content-appear 0.4s ease-out 0.2s both;
        }

        @keyframes content-appear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .success-title {
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .success-message {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 20px 0;
        }

        .success-stars {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .mini-star {
          font-size: 20px;
          animation: mini-star-rotate 1.5s ease-in-out infinite;
        }

        @keyframes mini-star-rotate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        /* 历史记录 */
        .history-section {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .history-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px 0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .history-date {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          width: 80px;
        }

        .history-status {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .history-status.completed {
          color: #22c55e;
        }

        .status-icon {
          font-size: 12px;
          font-weight: 700;
        }

        .status-text {
          font-size: 13px;
          font-weight: 500;
        }

        .history-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-family: 'Courier New', monospace;
        }

        /* 响应式适配 */
        @media (max-width: 768px) {
          .back-button {
            top: 15px;
            left: 15px;
            padding: 10px 16px;
            font-size: 14px;
          }

          .island-container {
            width: 100%;
            bottom: -30px;
          }

          .island-base {
            width: 300px;
            height: 150px;
          }

          .island-trees {
            width: 200px;
            bottom: 80px;
          }

          .content-wrapper {
            padding: 30px 16px;
          }

          .checkin-card {
            padding: 24px 20px;
          }

          .habit-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .habit-name {
            font-size: 20px;
          }

          .checkin-button {
            padding: 14px 20px;
            font-size: 16px;
          }
        }

        /* 暗色模式优化 */
        @media (prefers-color-scheme: dark) {
          .checkin-page {
            background: linear-gradient(180deg, #050510 0%, #101025 50%, #1a1a3a 100%);
          }
        }

        /* 动画性能优化 */
        .star-layer,
        .meteor,
        .island,
        .tree,
        .glow-ring {
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .star,
          .meteor,
          .island,
          .tree,
          .glow-ring,
          .checkin-button::before,
          .progress-glow {
            animation: none;
          }

          .island {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckInPage;