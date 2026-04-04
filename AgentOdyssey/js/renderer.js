// 渲染逻辑

/* ============================================================
   MAP RENDER
   ============================================================ */
function renderMap() {
  document.getElementById('hud-stars').textContent = state.stars;
  const done = Object.values(state.planets).filter(p => p.done).length;
  document.getElementById('hud-planets').textContent = done + '/' + PLANETS.length;

  const grid = document.getElementById('planets-grid');
  const gridParent = grid.parentElement;

  // 清空 grid
  grid.innerHTML = '';

  // 移除旧的成就面板（如果存在）
  const oldPanel = gridParent.querySelector('.achievements-panel');
  if (oldPanel) {
    oldPanel.remove();
  }

  // 添加成就面板（安全检查）
  if (typeof ACHIEVEMENTS !== 'undefined' && typeof getAchievementProgress === 'function') {
    try {
      const progress = getAchievementProgress();
      const unlockedAchievements = getUnlockedAchievements();

      const achievementsPanel = document.createElement('div');
      achievementsPanel.className = 'achievements-panel';
      achievementsPanel.innerHTML = `
        <div class="achievements-header">
          <div class="achievements-title">🏆 成就系统</div>
          <div class="achievements-progress">${progress.unlocked}/${progress.total} (${progress.percentage}%)</div>
        </div>
        <div class="achievements-grid">
          ${ACHIEVEMENTS.map(a => {
            const unlocked = state.achievements && state.achievements[a.id]?.unlocked;
            return `
              <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-card-icon">${a.icon}</div>
                <div class="achievement-card-name">${a.name}</div>
                <div class="achievement-card-desc">${a.description}</div>
                ${!unlocked ? '<div class="achievement-card-locked">🔒 未解锁</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
      // 插入到 grid 之前
      gridParent.insertBefore(achievementsPanel, grid);
    } catch (e) {
      console.error('Error rendering achievements:', e);
    }
  }

  PLANETS.forEach((p, i) => {
    const unlocked = true; // 所有关卡都可以直接进入
    const done = state.planets[p.id]?.done;
    const statusText = done ? '已完成' : unlocked ? '可探索' : '未解锁';
    const statusClass = done ? 'status-done' : unlocked ? 'status-open' : 'status-locked';
    const cardClass = done ? 'done' : unlocked ? '' : 'locked';

    const card = document.createElement('div');
    card.className = 'planet-card ' + cardClass;
    card.innerHTML = `
      <span class="planet-status ${statusClass}">${statusText}</span>
      <span class="planet-icon">${p.icon}</span>
      <div class="planet-num">${p.num}</div>
      <div class="planet-name">${p.name}</div>
      <div class="planet-desc">${p.desc}</div>
    `;
    if (unlocked) card.onclick = () => openLevel(p.id);
    grid.appendChild(card);
  });
}

/* ============================================================
   LEVEL RENDER
   ============================================================ */
let currentPlanetId = null;
let currentSectionIdx = 0;

function openLevel(planetId) {
  currentPlanetId = planetId;
  currentSectionIdx = 0;
  quizAnswered = {};
  renderLevel();
  showScreen('level');
}

function renderLevel() {
  const planet = PLANETS.find(p => p.id === currentPlanetId);
  const difficulty = state.currentDifficulty;
  const sections = planet.difficulties[difficulty].sections;
  const totalSections = sections.length;
  const progress = Math.round((currentSectionIdx / totalSections) * 100);

  let html = `
    <div class="level-header">
      <span class="back-btn" onclick="goMap()">← 地图</span>
      <span class="planet-emoji">${planet.icon}</span>
      <h2>${planet.name}</h2>
    </div>

    <!-- 难度切换器 -->
    <div class="difficulty-switcher">
      <div class="diff-btn easy ${difficulty === 'easy' ? 'active' : ''}" onclick="switchDifficulty('easy')">
        🟢 简单
      </div>
      <div class="diff-btn hard ${difficulty === 'hard' ? 'active' : ''}" onclick="switchDifficulty('hard')">
        🟡 困难
      </div>
      <div class="diff-btn hell ${difficulty === 'hell' ? 'active' : ''}${planet.difficulties.hell ? '' : ' locked'}" onclick="switchDifficulty('hell')">
        🔴 地狱${planet.difficulties.hell ? '' : ' 🔒'}
      </div>
    </div>

    <div class="progress-wrap">
      <div class="progress-label"><span>进度</span><span>${currentSectionIdx}/${totalSections}</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    </div>
  `;

  if (currentSectionIdx >= totalSections) {
    html += renderCompletion(planet);
  } else {
    const section = sections[currentSectionIdx];
    html += renderSection(section, currentSectionIdx);
    html += `<div class="level-nav">`;
    if (currentSectionIdx > 0) {
      html += `<button class="btn btn-ghost" onclick="prevSection()">← 上一步</button>`;
    }
    if (section.type !== 'quiz') {
      html += `<button class="btn btn-cyan" onclick="nextSection()">继续 →</button>`;
    }
    html += `</div>`;
  }

  document.getElementById('level-inner').innerHTML = html;
}

function renderSection(section, idx) {
  switch(section.type) {
    case 'story':     return renderStory(section);
    case 'concept':   return renderConcept(section);
    case 'code':      return renderCode(section);
    case 'pitfalls':  return renderPitfalls(section);
    case 'pipe':      return renderPipe(section);
    case 'quiz':      return renderQuiz(section, idx);
    case 'challenge': return renderChallenge(section, idx);
    case 'debug':     return renderDebug(section, idx);
    case 'sandbox':   return renderSandbox(section, idx);
    case 'milestone': return renderMilestone(section);
    default: return '';
  }
}

function renderStory(s) {
  return `<div class="story-box">${s.html}</div>`;
}

function renderConcept(s) {
  return `
    <div class="concept-box">
      <div class="concept-title">${s.title}</div>
      ${s.html}
    </div>
  `;
}

function renderCode(s) {
  return `
    <div class="code-example">
      <div class="code-title">${s.title}</div>
      <pre>${escapeHtml(s.code)}</pre>
      <div class="code-explain">${s.explanation}</div>
    </div>
  `;
}

function renderPitfalls(s) {
  const items = s.items.map(item => `<li>${item}</li>`).join('');
  return `
    <div class="pitfalls-box">
      <div class="pitfall-title">${s.title}</div>
      <ul>${items}</ul>
    </div>
  `;
}

function renderPipe(s) {
  const nodes = s.nodes.map((n,i) => `
    <div class="pipe-node" id="pipe-node-${i}">
      <span class="node-icon">${n.icon}</span>
      <span class="node-label">${n.label}</span>
    </div>
    ${i < s.nodes.length-1 ? '<span class="pipe-arrow">→</span>' : ''}
  `).join('');
  return `
    <div class="concept-box">
      <div class="concept-title">${s.title}</div>
      <div class="pipe-demo">${nodes}</div>
      <div style="text-align:center;margin-top:8px">
        <button class="btn btn-purple" onclick="animatePipe(${s.nodes.length})">▶ 播放动画</button>
      </div>
    </div>
  `;
}

function renderQuiz(s, idx) {
  const opts = s.opts.map((o, i) => {
    const letter = ['A','B','C','D'][i];
    return `
      <div class="quiz-opt" id="quiz-opt-${i}" onclick="answerQuiz(${i}, ${s.ans}, '${escapeAttr(s.feedback_ok)}', '${escapeAttr(s.feedback_err)}', ${idx})">
        <span class="opt-letter">${letter}</span>
        <span>${o}</span>
      </div>
    `;
  }).join('');
  return `
    <div class="quiz-box">
      <h3>🎯 闯关测试</h3>
      <div class="quiz-question">${s.q}</div>
      <div class="quiz-options">${opts}</div>
      <div class="quiz-feedback" id="quiz-feedback-${idx}"></div>
    </div>
  `;
}

function renderCompletion(planet) {
  const earned = state.planets[planet.id]?.stars || 3;
  const stars = '⭐'.repeat(earned);
  return `
    <div class="card" style="text-align:center;margin-top:20px">
      <div style="font-size:4rem;margin-bottom:12px">${planet.icon}</div>
      <div style="font-size:1.6rem;font-weight:900;color:var(--yellow);margin-bottom:8px">
        ${planet.name} 已征服！
      </div>
      <div style="font-size:2rem;margin-bottom:16px">${stars}</div>
      <p style="color:var(--muted);margin-bottom:24px;line-height:1.7">
        太棒了！你学会了这颗星球的所有知识！<br>继续探索下一颗星球吧！
      </p>
      <button class="btn btn-cyan" style="width:100%" onclick="goMap()">返回银河地图 →</button>
    </div>
  `;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function nextSection() {
  const planet = PLANETS.find(p => p.id === currentPlanetId);
  const difficulty = state.currentDifficulty;
  currentSectionIdx++;
  if(currentSectionIdx >= planet.difficulties[difficulty].sections.length) {
    // Complete planet
    if(!state.planets[currentPlanetId]) state.planets[currentPlanetId] = {};
    state.planets[currentPlanetId].done = true;
    state.planets[currentPlanetId].stars = 3;
    state.stars += 3;

    // Check if all done
    const allDone = PLANETS.every(p => state.planets[p.id]?.done);
    if(allDone) {
      document.getElementById('win-stars').textContent = '⭐'.repeat(Math.min(state.stars, 15));
      showScreen('win');
      return;
    }
  }
  renderLevel();
  document.getElementById('screen-level').scrollTop = 0;
}

function prevSection() {
  if(currentSectionIdx > 0) {
    currentSectionIdx--;
    renderLevel();
    document.getElementById('screen-level').scrollTop = 0;
  }
}

function switchDifficulty(diff) {
  const planet = PLANETS.find(p => p.id === currentPlanetId);
  if (diff === 'hell' && !planet.difficulties.hell) return;
  state.currentDifficulty = diff;
  currentSectionIdx = 0;
  quizAnswered = {};
  renderLevel();
}

/* ============================================================
   HELPERS
   ============================================================ */
function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr(s) {
  return s.replace(/'/g,"\\'").replace(/"/g,'&quot;');
}

/* ============================================================
   NEW INTERACTIVE SECTION TYPES
   ============================================================ */

// Challenge: 代码挑战
function renderChallenge(s, idx) {
  const challengeId = `challenge-${idx}`;
  return `
    <div class="challenge-box">
      <div class="challenge-header">
        <span class="challenge-icon">🎯</span>
        <h3>${s.title}</h3>
      </div>
      <div class="challenge-task">${s.task}</div>

      <div class="code-editor-wrapper">
        <div class="editor-toolbar">
          <span style="color:var(--muted);font-size:.85rem">💻 代码编辑器</span>
          <button class="btn-small btn-purple" onclick="runChallenge('${challengeId}')">▶ 运行</button>
        </div>
        <textarea
          id="${challengeId}-code"
          class="code-editor"
          spellcheck="false"
        >${s.starter_code || ''}</textarea>
      </div>

      <div id="${challengeId}-output" class="challenge-output" style="display:none">
        <div class="output-label">📤 输出结果：</div>
        <pre id="${challengeId}-result"></pre>
      </div>

      ${s.hints ? `
        <div class="challenge-hints">
          <button class="btn-small btn-ghost" onclick="toggleHints('${challengeId}')">
            💡 查看提示 (${s.hints.length})
          </button>
          <div id="${challengeId}-hints" class="hints-content" style="display:none">
            ${s.hints.map((h, i) => `<div class="hint-item">提示 ${i+1}: ${h}</div>`).join('')}
          </div>
        </div>
      ` : ''}

      <div id="${challengeId}-feedback" class="challenge-feedback"></div>
    </div>
  `;
}

// Debug: 调试挑战
function renderDebug(s, idx) {
  const debugId = `debug-${idx}`;
  return `
    <div class="debug-box">
      <div class="debug-header">
        <span class="debug-icon">🐛</span>
        <h3>${s.title}</h3>
      </div>
      <div class="debug-scenario">${s.scenario || ''}</div>

      <div class="code-editor-wrapper">
        <div class="editor-toolbar">
          <span style="color:var(--red);font-size:.85rem">⚠️ 有 Bug 的代码</span>
          <span style="color:var(--muted);font-size:.8rem">找出 ${s.bug_count || s.bugs?.length || '所有'} 个 bug</span>
        </div>
        <textarea
          id="${debugId}-code"
          class="code-editor buggy-code"
          spellcheck="false"
        >${s.buggy_code || ''}</textarea>
      </div>

      ${s.error_log ? `
        <div class="error-log">
          <div class="error-label">❌ 错误日志：</div>
          <pre>${escapeHtml(s.error_log)}</pre>
        </div>
      ` : ''}

      <div class="debug-actions">
        <button class="btn btn-purple" onclick="checkDebug('${debugId}')">🔍 检查修复</button>
        ${s.hints ? `
          <button class="btn btn-ghost" onclick="toggleHints('${debugId}')">💡 提示</button>
        ` : ''}
      </div>

      ${s.hints ? `
        <div id="${debugId}-hints" class="hints-content" style="display:none">
          ${s.hints.map((h, i) => `<div class="hint-item">提示 ${i+1}: ${h}</div>`).join('')}
        </div>
      ` : ''}

      <div id="${debugId}-feedback" class="debug-feedback"></div>
    </div>
  `;
}

// Sandbox: 沙盒实验
function renderSandbox(s, idx) {
  const sandboxId = `sandbox-${idx}`;
  return `
    <div class="sandbox-box">
      <div class="sandbox-header">
        <span class="sandbox-icon">🧪</span>
        <h3>${s.title}</h3>
      </div>
      <div class="sandbox-description">${s.description}</div>

      <div class="sandbox-controls">
        ${s.params ? s.params.map((p, i) => `
          <div class="param-control">
            <label for="${sandboxId}-param-${i}">
              <span class="param-name">${p.name}</span>
              <span class="param-value" id="${sandboxId}-value-${i}">${p.default}</span>
            </label>
            <input
              type="range"
              id="${sandboxId}-param-${i}"
              min="${p.min}"
              max="${p.max}"
              step="${p.step || 0.1}"
              value="${p.default}"
              oninput="updateSandboxParam('${sandboxId}', ${i}, this.value)"
            />
            <div class="param-range">
              <span>${p.min}</span>
              <span>${p.max}</span>
            </div>
          </div>
        `).join('') : ''}
      </div>

      <div class="sandbox-visualization" id="${sandboxId}-viz">
        <div class="viz-placeholder">
          📊 调整参数后，这里会显示模拟结果
        </div>
      </div>

      ${s.goal ? `
        <div class="sandbox-goal">
          🎯 <strong>目标：</strong>${s.goal}
        </div>
      ` : ''}

      <div class="sandbox-actions">
        <button class="btn btn-cyan" onclick="runSandbox('${sandboxId}')">🚀 运行模拟</button>
        <button class="btn btn-ghost" onclick="resetSandbox('${sandboxId}')">🔄 重置</button>
      </div>

      <div id="${sandboxId}-result" class="sandbox-result"></div>
    </div>
  `;
}


// Milestone: 里程碑总结
function renderMilestone(s) {
  const achievementsHtml = s.achievements ? s.achievements.map(a => `
    <div class="achievement-item">
      <span class="achievement-icon">${a.icon}</span>
      <div class="achievement-content">
        <div class="achievement-title">${a.title}</div>
        <div class="achievement-desc">${a.description}</div>
      </div>
    </div>
  `).join("") : "";

  const skillsHtml = s.skills ? s.skills.map(skill => `
    <div class="skill-badge">${skill}</div>
  `).join("") : "";

  const nextStepsHtml = s.next_steps ? s.next_steps.map((step, i) => `
    <div class="next-step-item">
      <span class="step-number">${i + 1}</span>
      <div class="step-content">${step}</div>
    </div>
  `).join("") : "";

  return `
    <div class="milestone-box">
      <div class="milestone-header">
        <div class="milestone-icon">${s.icon || "🏆"}</div>
        <h2 class="milestone-title">${s.title}</h2>
        <p class="milestone-subtitle">${s.subtitle || ""}</p>
      </div>

      ${s.message ? `
        <div class="milestone-message">
          ${s.message}
        </div>
      ` : ""}

      ${achievementsHtml ? `
        <div class="milestone-section">
          <h3 class="section-title">🎯 你已解锁的能力</h3>
          <div class="achievements-grid">
            ${achievementsHtml}
          </div>
        </div>
      ` : ""}

      ${skillsHtml ? `
        <div class="milestone-section">
          <h3 class="section-title">💪 你现在掌握的技能</h3>
          <div class="skills-container">
            ${skillsHtml}
          </div>
        </div>
      ` : ""}

      ${s.project ? `
        <div class="milestone-section milestone-project">
          <h3 class="section-title">🚀 里程碑项目</h3>
          <div class="project-card">
            <div class="project-header">
              <span class="project-icon">${s.project.icon || "📦"}</span>
              <div class="project-title">${s.project.title}</div>
            </div>
            <div class="project-desc">${s.project.description}</div>
            ${s.project.requirements ? `
              <div class="project-requirements">
                <strong>要求：</strong>
                <ul>
                  ${s.project.requirements.map(r => `<li>${r}</li>`).join("")}
                </ul>
              </div>
            ` : ""}
            ${s.project.hints ? `
              <div class="project-hints">
                <strong>💡 提示：</strong>
                <ul>
                  ${s.project.hints.map(h => `<li>${h}</li>`).join("")}
                </ul>
              </div>
            ` : ""}
          </div>
        </div>
      ` : ""}

      ${nextStepsHtml ? `
        <div class="milestone-section">
          <h3 class="section-title">🗺️ 下一步建议</h3>
          <div class="next-steps-list">
            ${nextStepsHtml}
          </div>
        </div>
      ` : ""}

      <div class="milestone-footer">
        <button class="btn btn-cyan" onclick="nextSection()">继续冒险 →</button>
      </div>
    </div>
  `;
}
