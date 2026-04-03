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
