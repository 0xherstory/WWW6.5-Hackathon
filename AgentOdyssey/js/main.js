// 主逻辑和初始化

/* ============================================================
   STARS CANVAS
   ============================================================ */
(function(){
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize(){ c.width=innerWidth; c.height=innerHeight; }
  function init(){
    resize();
    stars = Array.from({length:180}, ()=>({
      x: Math.random()*c.width, y: Math.random()*c.height,
      r: Math.random()*1.5+.3, a: Math.random(), da: (Math.random()-.5)*.008
    }));
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(s=>{
      s.a = Math.max(.1, Math.min(1, s.a+s.da));
      if(s.a<=.1||s.a>=1) s.da*=-1;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${s.a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  init(); draw();
})();

/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goMap() {
  // 检查成就
  if (typeof checkAchievements === 'function') {
    checkAchievements();
  }
  renderMap();
  showScreen('map');
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Agent 星际冒险已加载！');
  console.log('关卡数量:', PLANETS.length);
});
