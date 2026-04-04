// 游戏状态管理
const state = {
  stars: 0,
  planets: {}, // id -> { done: bool, stars: int }
  currentDifficulty: 'easy', // 'easy' | 'hard' | 'hell'
  achievements: {}, // 成就系统
};

// 所有关卡数据（将由各个关卡文件填充）
const PLANETS = [];

// quiz 答题状态（跨文件共享，切换关卡/难度时重置）
let quizAnswered = {};

// 保存状态到 localStorage
function saveState() {
  try {
    localStorage.setItem('agentOdysseyState', JSON.stringify(state));
  } catch (e) {
    console.warn('无法保存状态到 localStorage:', e);
  }
}

// 从 localStorage 加载状态
function loadState() {
  try {
    const saved = localStorage.getItem('agentOdysseyState');
    if (saved) {
      const loaded = JSON.parse(saved);
      Object.assign(state, loaded);
      console.log('已加载保存的进度');
    }
  } catch (e) {
    console.warn('无法加载状态:', e);
  }
}

// 页面加载时自动加载状态
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', loadState);
}
