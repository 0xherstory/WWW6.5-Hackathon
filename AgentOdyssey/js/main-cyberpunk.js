// 主逻辑和初始化 - 赛博朋克版本

/* ============================================================
   MATRIX RAIN CANVAS - 矩阵雨效果
   ============================================================ */
(function(){
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');

  // 矩阵字符集（包含日文片假名、数字、符号）
  const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charArray = chars.split('');

  let columns = [];
  let fontSize = 14;
  let drops = [];

  function resize() {
    c.width = innerWidth;
    c.height = innerHeight;

    // 计算列数
    columns = Math.floor(c.width / fontSize);

    // 初始化每列的下落位置
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // 随机起始位置
    }
  }

  function draw() {
    // 半透明黑色背景，产生拖尾效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, c.width, c.height);

    // 设置文字样式
    ctx.font = fontSize + 'px monospace';

    // 绘制每一列
    for (let i = 0; i < drops.length; i++) {
      // 随机选择一个字符
      const char = charArray[Math.floor(Math.random() * charArray.length)];

      // 计算颜色（头部更亮）
      const y = drops[i] * fontSize;
      const alpha = Math.min(1, (c.height - y) / c.height + 0.3);

      // 霓虹绿色
      ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;

      // 绘制字符
      ctx.fillText(char, i * fontSize, y);

      // 随机重置某些列（产生不均匀效果）
      if (y > c.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // 下落
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ============================================================
   GLITCH EFFECT - 故障效果
   ============================================================ */
(function(){
  // 随机触发屏幕故障效果
  function triggerGlitch() {
    const screens = document.querySelectorAll('.screen.active');
    screens.forEach(screen => {
      screen.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      setTimeout(() => {
        screen.style.transform = 'translate(0, 0)';
      }, 50);
    });
  }

  // 每隔 5-15 秒随机触发一次故障
  function scheduleGlitch() {
    const delay = 5000 + Math.random() * 10000;
    setTimeout(() => {
      if (Math.random() > 0.5) { // 50% 概率触发
        triggerGlitch();
      }
      scheduleGlitch();
    }, delay);
  }

  scheduleGlitch();
})();

/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goMap() {
  renderMap();
  showScreen('map');
}

/* ============================================================
   TYPING EFFECT - 打字机效果（可选）
   ============================================================ */
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

/* ============================================================
   INITIALIZATION
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  console.log('%c🚀 AGENT ODYSSEY - CYBERPUNK MODE', 'color: #00ff41; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px #00ff41;');
  console.log('%c关卡数量:', 'color: #00ffff', PLANETS.length);
  console.log('%c系统状态:', 'color: #00ffff', 'ONLINE');
  console.log('%c访问级别:', 'color: #ff006e', 'UNRESTRICTED');
});
