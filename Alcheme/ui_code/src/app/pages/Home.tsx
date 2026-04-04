import { useNavigate } from 'react-router';
import backgroundImage from 'figma:asset/f41bd8526e24975938d871d048f307c6b265a04c.png';
import characterImage from 'figma:asset/f1d6e95b671451fab24fb44b50161720f6f89ad3.png';
import crystalImage from 'figma:asset/3426c04b68d9b86397088a381e18adf4fa12dca2.png';
import magicOrbsImage from 'figma:asset/28caacd1fffa5b73fafec6bbbc5a0ce3c9ecd880.png';
import collectButtonImg from 'figma:asset/f103e578864ca4d98d1d93e72ca377df8077381a.png';
import refineButton from 'figma:asset/bcc24e622f7079ba9837ab4380e8eb2c99b889d1.png';
import awakenButton from 'figma:asset/5042fea45ce6ca07d2d6371987ccbdb342fe1d29.png';
import profileButton from 'figma:asset/dd0fae2b566b4d9b18684364e779990d3e3e7890.png';
import owlImage from 'figma:asset/5dfb73f2e2092eb765b24ba8c1a852ce5f3731e9.png';
import alchemeLogo from 'figma:asset/a82dc1e92d5a60168dfc16bfe3402cf3da775301.png';
import parchmentScroll from 'figma:asset/6e9c0278614ee59e3fa39d8a0594cbf4800e013a.png';
import { Sparkles } from 'lucide-react';

import crystal1 from 'figma:asset/6e4310e7eedb7599a8783ae85915384fa1cdb41a.png';
import crystal2 from 'figma:asset/c9271aa2b5c4b3ac4fd8114695354054ec89c320.png';
import crystal3 from 'figma:asset/422998f75fa5b2894d6c25e42f9caa86c99f9321.png';

export default function Home() {
  const navigate = useNavigate();
  const crystalIcons = [crystal1, crystal2, crystal3];

  const handleCollect = (taskName: string) => {
    const oresData = localStorage.getItem('collectedOres');
    const ores = oresData ? JSON.parse(oresData) : [];
    const newOre = {
      id: `ore-${Date.now()}-${Math.random()}`,
      type: 'task',
      content: taskName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'),
      color: ''
    };
    ores.push(newOre);
    localStorage.setItem('collectedOres', JSON.stringify(ores));
    window.dispatchEvent(new Event('oresUpdated'));
  };

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        width: '1920px',
        height: '1080px',
        maxWidth: '1920px',
        maxHeight: '1080px',
        margin: '0 auto',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 3}s` }}>
            <Sparkles className="text-white/30" size={Math.random() * 10 + 8} />
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-7xl bg-gradient-to-br from-purple-100/40 via-pink-50/30 to-cyan-100/40 rounded-3xl shadow-2xl pt-6 px-8 pb-0 z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-2 z-40 relative">
          <img src={alchemeLogo} alt="Alcheme" style={{ height: '175px', width: 'auto' }} />
          <div className="flex gap-4">
            {[
              { id: 'collect', img: collectButtonImg, path: '/', active: true },
              { id: 'refine', img: refineButton, path: '/refine' },
              { id: 'awaken', img: awakenButton, path: '/awaken' },
              { id: 'profile', img: profileButton, path: '/profile' }
            ].map((btn) => (
              <button key={btn.id} onClick={() => navigate(btn.path)} className="hover:scale-110 transition-transform active:scale-95">
                <img src={btn.img} className="w-24 h-24 object-contain" style={{ filter: btn.active ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="grid grid-cols-12 gap-0 items-end relative flex-1">
          
          {/* 左侧角色：紧贴边缘 */}
          <div className="col-span-4 relative h-full flex items-end pb-0">
            <img 
              src={characterImage} 
              alt="Alchemist Character" 
              className="w-auto h-auto drop-shadow-2xl translate-x-4"
              style={{
                maxHeight: '520px',
                objectFit: 'contain',
                display: 'block',
                marginBottom: '-1px' 
              }}
            />
          </div>

          {/* 中间核心：矿山（绝对定位脱离高度计算） */}
          <div className="col-span-4 flex flex-col items-center justify-center relative z-20 h-full">
            <div className="absolute bottom-10 flex flex-col items-center origin-bottom w-[420px]">
              <div className="absolute inset-0 bg-purple-300/10 blur-3xl rounded-full scale-150 pointer-events-none" />
              <button onClick={() => navigate('/mine')} className="relative z-10 hover:scale-105 transition-all duration-500 cursor-pointer">
                <img src={crystalImage} className="w-full h-auto object-contain" style={{ animation: 'float 4s ease-in-out infinite', filter: 'drop-shadow(0 15px 40px rgba(168, 85, 247, 0.4))' }} />
              </button>
              <div className="mt-4 text-center z-20">
                <span className="font-['Cinzel'] text-[#8b6914] text-xl tracking-[0.3em] uppercase font-bold animate-pulse">Click to Mine</span>
              </div>
              <img src={magicOrbsImage} className="w-64 h-auto opacity-70 mix-blend-multiply mt-2" style={{ filter: 'hue-rotate(280deg)' }} />
            </div>
          </div>

          {/* 右侧：猫头鹰与羊皮卷 */}
          <div className="col-span-4 flex flex-col items-center justify-start relative pt-2 pb-10">
            <div className="relative flex flex-col items-center w-full">
              
              {/* 修改点：猫头鹰绝对定位 */}
              {/* 1. 使用 absolute 配合 -top 向上偏移，这样它放大时不会顶开玻璃框顶部 */}
              {/* 2. 通过 left-1/2 和 -translate-x-1/2 实现水平居中 */}
              <div className="absolute -top-13 left-1/2 -translate-x-1/2 z-20"> 
                <img 
                  src={owlImage} 
                  // 这里你可以随意加大尺寸（如 w-64 h-64），不会影响容器高度
                  className="w-64 h-64 object-contain drop-shadow-2xl" 
                  style={{ animation: 'owlFloat 3.5s ease-in-out infinite' }} 
                />
              </div>

              {/* 羊皮卷：作为此列的唯一占位元素，决定这一块的基础高度 */}
              <div className="relative z-0 mt-20"> {/* mt-20 为猫头鹰留出视觉空间 */}
                <img 
                  src={parchmentScroll} 
                  className="h-auto object-fill drop-shadow-xl" 
                  style={{ 
                    width: '440px', 
                    minWidth: '440px',
                    maxHeight: '340px' 
                  }} 
                />
                
                <div className="absolute inset-0 flex flex-col justify-center px-14 pt-8 pb-10 gap-4">
                  {[
                    { text: 'Read: Walden', icon: crystalIcons[0] },
                    { text: 'Run: 5km', icon: crystalIcons[1] },
                    { text: 'Meditation', icon: crystalIcons[2] }
                  ].map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img src={task.icon} className="w-9 h-9 object-contain drop-shadow-sm" />
                        <span className="font-['Cinzel'] font-black text-[#3d2817] text-lg">
                          {task.text}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleCollect(task.text)}
                        className="relative px-4 py-1.5 rounded-lg transition-all shadow-md active:scale-95 overflow-hidden"
                        style={{
                          background: 'linear-gradient(180deg, #FFD700 0%, #D4AF37 100%)', 
                          border: '1.5px solid #8B6914',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)'
                        }}
                      >
                        <span className="relative z-10 font-['Cinzel'] font-black text-[#4A3728] text-[10px] tracking-widest">
                          COLLECT
                        </span>
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes owlFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}