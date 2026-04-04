// 游戏状态管理
const state = {
  stars: 0,
  planets: {}, // id -> { done: bool, stars: int }
  currentDifficulty: 'easy', // 'easy' | 'hard' | 'hell'
};

// 所有关卡数据（将由各个关卡文件填充）
const PLANETS = [];

// quiz 答题状态（跨文件共享，切换关卡/难度时重置）
let quizAnswered = {};
