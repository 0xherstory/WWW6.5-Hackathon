// 成就系统

/* ============================================================
   ACHIEVEMENTS SYSTEM
   ============================================================ */

// 定义所有成就
const ACHIEVEMENTS = [
  {
    id: 'first_challenge',
    icon: '🏆',
    name: '代码新手',
    description: '完成第一个代码挑战',
    condition: (state) => {
      // 检查是否完成过任何 challenge
      return Object.values(state.planets).some(p => p.challenges_completed > 0);
    }
  },
  {
    id: 'first_debug',
    icon: '🐛',
    name: '调试高手',
    description: '通过第一个调试任务',
    condition: (state) => {
      return Object.values(state.planets).some(p => p.debugs_completed > 0);
    }
  },
  {
    id: 'first_hell',
    icon: '🔥',
    name: '硬核玩家',
    description: '完成第一个地狱模式',
    condition: (state) => {
      return Object.values(state.planets).some(p => p.hell_completed);
    }
  },
  {
    id: 'basic_master',
    icon: '🎓',
    name: '基础大师',
    description: '完成所有基础篇（P1-P8）',
    condition: (state) => {
      const basicPlanets = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
      return basicPlanets.every(id => state.planets[id]?.done);
    }
  },
  {
    id: 'deep_explorer',
    icon: '🚀',
    name: '深度探索者',
    description: '完成所有深度篇（P9-P16）',
    condition: (state) => {
      const deepPlanets = ['p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16'];
      return deepPlanets.every(id => state.planets[id]?.done);
    }
  },
  {
    id: 'empire_builder',
    icon: '🏛️',
    name: '帝国建造者',
    description: '完成帝国篇（P17-P21）',
    condition: (state) => {
      const empirePlanets = ['p17', 'p18', 'p19', 'p20', 'p21'];
      return empirePlanets.every(id => state.planets[id]?.done);
    }
  },
  {
    id: 'swarm_intelligence',
    icon: '🐟',
    name: '群体智能专家',
    description: '完成 MiroFish 篇（P23-P25）',
    condition: (state) => {
      const mirofishPlanets = ['p23', 'p24', 'p25'];
      return mirofishPlanets.every(id => state.planets[id]?.done);
    }
  },
  {
    id: 'agent_master',
    icon: '🌟',
    name: 'Agent 大师',
    description: '完成所有关卡',
    condition: (state) => {
      return PLANETS.every(p => state.planets[p.id]?.done);
    }
  },
  {
    id: 'speed_runner',
    icon: '⚡',
    name: '速通玩家',
    description: '在 1 小时内完成 5 个关卡',
    condition: (state) => {
      // 这个需要记录时间戳，暂时简化
      return false;
    }
  },
  {
    id: 'perfectionist',
    icon: '💎',
    name: '完美主义者',
    description: '所有关卡都获得 3 星',
    condition: (state) => {
      return PLANETS.every(p => state.planets[p.id]?.stars === 3);
    }
  }
];

// 检查并解锁新成就
function checkAchievements() {
  if (!state.achievements) {
    state.achievements = {};
  }

  let newAchievements = [];

  ACHIEVEMENTS.forEach(achievement => {
    // 如果已经解锁，跳过
    if (state.achievements[achievement.id]) {
      return;
    }

    // 检查条件
    if (achievement.condition(state)) {
      state.achievements[achievement.id] = {
        unlocked: true,
        unlockedAt: Date.now()
      };
      newAchievements.push(achievement);
    }
  });

  // 如果有新成就，显示通知
  if (newAchievements.length > 0) {
    showAchievementNotification(newAchievements);
  }

  saveState();
}

// 显示成就解锁通知
function showAchievementNotification(achievements) {
  achievements.forEach((achievement, index) => {
    setTimeout(() => {
      const notification = document.createElement('div');
      notification.className = 'achievement-notification';
      notification.innerHTML = `
        <div class="achievement-notification-content">
          <div class="achievement-notification-icon">${achievement.icon}</div>
          <div class="achievement-notification-text">
            <div class="achievement-notification-title">成就解锁！</div>
            <div class="achievement-notification-name">${achievement.name}</div>
            <div class="achievement-notification-desc">${achievement.description}</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      // 动画显示
      setTimeout(() => notification.classList.add('show'), 100);

      // 3 秒后移除
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }, index * 500); // 多个成就依次显示
  });
}

// 获取已解锁的成就列表
function getUnlockedAchievements() {
  if (!state.achievements) {
    return [];
  }

  return ACHIEVEMENTS.filter(a => state.achievements[a.id]?.unlocked);
}

// 获取成就进度
function getAchievementProgress() {
  const unlocked = getUnlockedAchievements().length;
  const total = ACHIEVEMENTS.length;
  return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
}
