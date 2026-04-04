// 渲染逻辑

/* ============================================================
   MAP RENDER
   ============================================================ */
function renderMap() {
  document.getElementById('hud-stars').textContent = state.stars;
  const done = Object.values(state.planets).filter(p => p.done).length;
  document.getElementById('hud-planets').textContent = done + '/' + PLANETS.length;

  const grid = document.getElementById('planets-grid');
  grid.innerHTML = '';

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
