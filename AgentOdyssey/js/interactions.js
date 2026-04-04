// 交互逻辑

/* ============================================================
   QUIZ INTERACTIONS
   ============================================================ */

function answerQuiz(chosen, correct, feedbackOk, feedbackErr, idx) {
  if(quizAnswered[idx]) return;
  quizAnswered[idx] = true;

  document.querySelectorAll('.quiz-opt').forEach((el, i) => {
    el.onclick = null;
    if(i === correct) el.classList.add('correct');
    else if(i === chosen) el.classList.add('wrong');
  });

  const fb = document.getElementById('quiz-feedback-' + idx);
  if(chosen === correct) {
    fb.className = 'quiz-feedback show ok';
    fb.textContent = feedbackOk;
    // Add next button
    const nav = document.querySelector('.level-nav');
    if(nav) {
      nav.innerHTML = `
        <button class="btn btn-ghost" onclick="prevSection()">← 上一步</button>
        <button class="btn btn-cyan" onclick="nextSection()">继续 →</button>
      `;
    }
  } else {
    fb.className = 'quiz-feedback show err';
    fb.textContent = feedbackErr;
    setTimeout(() => {
      document.querySelectorAll('.quiz-opt').forEach(el => {
        el.classList.remove('wrong');
      });
      quizAnswered[idx] = false;
      document.querySelectorAll('.quiz-opt').forEach((el, i) => {
        el.onclick = () => answerQuiz(i, correct, feedbackOk, feedbackErr, idx);
      });
      fb.className = 'quiz-feedback';
    }, 2500);
  }
}

/* ============================================================
   PIPE ANIMATION
   ============================================================ */
function animatePipe(count) {
  let i = 0;
  // Reset all
  for(let j=0;j<count;j++){
    const n = document.getElementById('pipe-node-'+j);
    if(n){ n.classList.remove('active','done'); }
  }
  const interval = setInterval(() => {
    if(i > 0){
      const prev = document.getElementById('pipe-node-'+(i-1));
      if(prev){ prev.classList.remove('active'); prev.classList.add('done'); }
    }
    const cur = document.getElementById('pipe-node-'+i);
    if(cur){ cur.classList.add('active'); }
    i++;
    if(i >= count){ clearInterval(interval); }
  }, 600);
}

/* ============================================================
   INTERACTIVE SECTION INTERACTIONS
   ============================================================ */

// Challenge: 运行代码挑战
function runChallenge(challengeId) {
  const codeEl = document.getElementById(`${challengeId}-code`);
  const outputEl = document.getElementById(`${challengeId}-output`);
  const resultEl = document.getElementById(`${challengeId}-result`);
  const feedbackEl = document.getElementById(`${challengeId}-feedback`);

  const code = codeEl.value;

  // 显示输出区域
  outputEl.style.display = 'block';
  resultEl.textContent = '运行中...';

  // 模拟代码执行（实际项目中需要后端支持或使用 Web Worker）
  setTimeout(() => {
    try {
      // 简单的代码验证示例
      if (code.includes('chunk_text') && code.includes('return')) {
        resultEl.textContent = '✅ 代码运行成功！\n\n输出：\n["chunk1", "chunk2", "chunk3"]';
        feedbackEl.className = 'challenge-feedback success';
        feedbackEl.textContent = '🎉 太棒了！你成功实现了文本分块功能！';

        // 解锁下一步按钮
        const nav = document.querySelector('.level-nav');
        if (nav && !nav.querySelector('.btn-cyan')) {
          nav.innerHTML += `<button class="btn btn-cyan" onclick="nextSection()">继续 →</button>`;
        }
      } else {
        resultEl.textContent = '❌ 代码有问题，请检查：\n- 是否定义了 chunk_text 函数？\n- 是否有 return 语句？';
        feedbackEl.className = 'challenge-feedback error';
        feedbackEl.textContent = '再试试看！检查一下函数定义和返回值。';
      }
    } catch (e) {
      resultEl.textContent = `❌ 运行错误：\n${e.message}`;
      feedbackEl.className = 'challenge-feedback error';
      feedbackEl.textContent = '代码有语法错误，请仔细检查！';
    }
  }, 500);
}

// Debug: 检查调试结果
function checkDebug(debugId) {
  const codeEl = document.getElementById(`${debugId}-code`);
  const feedbackEl = document.getElementById(`${debugId}-feedback`);

  const code = codeEl.value;

  // 简单的 bug 检查示例
  const fixes = [];
  if (code.includes('await generateProfile()')) fixes.push('✅ 修复了 await 缺失');
  if (code.includes('if (profile)') || code.includes('if (!profile)')) fixes.push('✅ 添加了 null 检查');

  if (fixes.length >= 2) {
    feedbackEl.className = 'debug-feedback success';
    feedbackEl.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px">🎉 所有 bug 都修复了！</div>
      ${fixes.map(f => `<div>${f}</div>`).join('')}
    `;

    // 解锁下一步
    const nav = document.querySelector('.level-nav');
    if (nav && !nav.querySelector('.btn-cyan')) {
      nav.innerHTML += `<button class="btn btn-cyan" onclick="nextSection()">继续 →</button>`;
    }
  } else {
    feedbackEl.className = 'debug-feedback error';
    feedbackEl.textContent = `还有 ${2 - fixes.length} 个 bug 没有修复。提示：检查 async/await 和 null 检查。`;
  }
}

// Sandbox: 更新参数
function updateSandboxParam(sandboxId, paramIndex, value) {
  const valueEl = document.getElementById(`${sandboxId}-value-${paramIndex}`);
  valueEl.textContent = parseFloat(value).toFixed(2);
}

// Sandbox: 运行模拟
function runSandbox(sandboxId) {
  const vizEl = document.getElementById(`${sandboxId}-viz`);
  const resultEl = document.getElementById(`${sandboxId}-result`);

  // 获取所有参数值
  const params = [];
  let i = 0;
  while (true) {
    const paramEl = document.getElementById(`${sandboxId}-param-${i}`);
    if (!paramEl) break;
    params.push(parseFloat(paramEl.value));
    i++;
  }

  // 显示加载状态
  vizEl.innerHTML = '<div class="viz-placeholder">🔄 模拟运行中...</div>';

  // 模拟运行（实际项目中需要调用后端 API）
  setTimeout(() => {
    // 简单的可视化示例
    const [activityLevel, sentimentBias, postsPerHour] = params;

    vizEl.innerHTML = `
      <div style="width:100%;text-align:left">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:16px;color:var(--cyan)">
          📊 模拟结果（10 个 Agent，运行 10 轮）
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.9rem">
          <div style="background:rgba(0,229,255,.08);padding:12px;border-radius:8px">
            <div style="color:var(--muted);margin-bottom:4px">总发帖数</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--cyan)">
              ${Math.round(postsPerHour * activityLevel * 10 * 10)}
            </div>
          </div>
          <div style="background:rgba(168,85,247,.08);padding:12px;border-radius:8px">
            <div style="color:var(--muted);margin-bottom:4px">平均情感</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--purple)">
              ${sentimentBias > 0 ? '😊' : sentimentBias < 0 ? '😞' : '😐'} ${sentimentBias.toFixed(2)}
            </div>
          </div>
          <div style="background:rgba(34,197,94,.08);padding:12px;border-radius:8px">
            <div style="color:var(--muted);margin-bottom:4px">活跃 Agent 数</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--green)">
              ${Math.round(activityLevel * 10)} / 10
            </div>
          </div>
          <div style="background:rgba(251,191,36,.08);padding:12px;border-radius:8px">
            <div style="color:var(--muted);margin-bottom:4px">互动次数</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--yellow)">
              ${Math.round(postsPerHour * activityLevel * 10 * 5)}
            </div>
          </div>
        </div>
      </div>
    `;

    // 检查是否达成目标
    const totalPosts = Math.round(postsPerHour * activityLevel * 10 * 10);
    if (totalPosts >= 100) {
      resultEl.className = 'sandbox-result show';
      resultEl.innerHTML = `
        <div style="font-weight:700;margin-bottom:8px">🎯 目标达成！</div>
        <div>总发帖数达到 ${totalPosts}，超过目标值 100！</div>
      `;

      // 解锁下一步
      const nav = document.querySelector('.level-nav');
      if (nav && !nav.querySelector('.btn-cyan')) {
        nav.innerHTML += `<button class="btn btn-cyan" onclick="nextSection()">继续 →</button>`;
      }
    } else {
      resultEl.className = 'sandbox-result show';
      resultEl.style.background = 'rgba(239,68,68,.08)';
      resultEl.style.borderColor = 'var(--red)';
      resultEl.innerHTML = `
        <div style="font-weight:700;margin-bottom:8px">还差一点！</div>
        <div>总发帖数 ${totalPosts}，目标是 100。试试调高 activity_level 或 posts_per_hour？</div>
      `;
    }
  }, 1000);
}

// Sandbox: 重置
function resetSandbox(sandboxId) {
  const vizEl = document.getElementById(`${sandboxId}-viz`);
  const resultEl = document.getElementById(`${sandboxId}-result`);

  vizEl.innerHTML = '<div class="viz-placeholder">📊 调整参数后，这里会显示模拟结果</div>';
  resultEl.className = 'sandbox-result';
  resultEl.style.display = 'none';

  // 重置所有参数到默认值
  let i = 0;
  while (true) {
    const paramEl = document.getElementById(`${sandboxId}-param-${i}`);
    if (!paramEl) break;
    const defaultValue = paramEl.getAttribute('value');
    paramEl.value = defaultValue;
    updateSandboxParam(sandboxId, i, defaultValue);
    i++;
  }
}

// 切换提示显示
function toggleHints(id) {
  const hintsEl = document.getElementById(`${id}-hints`);
  if (hintsEl) {
    hintsEl.style.display = hintsEl.style.display === 'none' ? 'block' : 'none';
  }
}
