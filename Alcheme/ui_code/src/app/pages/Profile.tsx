import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import backgroundImage from 'figma:asset/f41bd8526e24975938d871d048f307c6b265a04c.png';
import collectButton from 'figma:asset/f103e578864ca4d98d1d93e72ca377df8077381a.png';
import refineButton from 'figma:asset/bcc24e622f7079ba9837ab4380e8eb2c99b889d1.png';
import awakenButton from 'figma:asset/5042fea45ce6ca07d2d6371987ccbdb342fe1d29.png';
import profileButton from 'figma:asset/dd0fae2b566b4d9b18684364e779990d3e3e7890.png';
import owlImage from 'figma:asset/5dfb73f2e2092eb765b24ba8c1a852ce5f3731e9.png';
import alchemeLogo from 'figma:asset/a82dc1e92d5a60168dfc16bfe3402cf3da775301.png';
import characterImage from 'figma:asset/f1d6e95b671451fab24fb44b50161720f6f89ad3.png';
import medalImage from 'figma:asset/99b83df7ca82c99f905eaf13a84586014ff41499.png';
import medalWallBg from 'figma:asset/8560396036572275c1880d6838191df2c76b4668.png';
import hexagonCrystal from 'figma:asset/5a1d242ac40a9084376e905bcfa4b5107caa2ba5.png';

// Import card backgrounds
import cardBg1 from 'figma:asset/36f068e9e853e013a326ddfeb3134365b8967d6f.png';
import cardBg2 from 'figma:asset/0beaaa20696396b0997d391dc1ed91d00f9eb7d8.png';
import cardBg3 from 'figma:asset/b24f257b05ef0a618e241f85ac4368499ebda3c0.png';

// Import stamp patterns
import stamp1 from 'figma:asset/09ac11079bc3070142d0c981f2a1e6f042ae75a2.png';
import stamp2 from 'figma:asset/d1ca70bd3631afc028f85c903ce19dacbbe493b9.png';
import stamp3 from 'figma:asset/981b85fbc4b9bb9aba7723567677e46e9d1a3fb8.png';

interface Card {
  id: string;
  cardBgIndex: number;
  stampIndex: number;
  text: string;
  date: string;
  ores?: Array<{
    date: string;
    content: string;
  }>;
}

interface Medal {
  id: string;
  text: string;
  date: string;
  cards: Card[];
}

export default function Profile() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);

  const cardBackgrounds = [cardBg1, cardBg2, cardBg3];
  const stampPatterns = [stamp1, stamp2, stamp3];

  useEffect(() => {
    const savedNickname = localStorage.getItem('userNickname');
    if (savedNickname) {
      setNickname(savedNickname);
      setEditingNickname(savedNickname);
    }
    const loadMedals = () => {
      const medalsData = localStorage.getItem('awakenedMedals');
      if (medalsData) setMedals(JSON.parse(medalsData));
    };
    loadMedals();
    window.addEventListener('cardsUpdated', loadMedals);
    return () => window.removeEventListener('cardsUpdated', loadMedals);
  }, []);

  const handleSaveNickname = () => {
    if (editingNickname.trim()) {
      setNickname(editingNickname.trim());
      localStorage.setItem('userNickname', editingNickname.trim());
      setIsEditing(false);
    }
  };

  const handleShare = () => alert(`Share ${nickname}'s Soul Archive!`);
  const closeMedalModal = () => setSelectedMedal(null);

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        width: '1920px', height: '1080px', maxWidth: '1920px', maxHeight: '1080px',
        margin: '0 auto', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover',
        backgroundPosition: 'center', fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 3}s` }}>
            <Sparkles className="text-white/30" size={Math.random() * 10 + 8} />
          </div>
        ))}
      </div>

      {/* 主布局容器 */}
      <div className="relative w-full max-w-7xl bg-gradient-to-br from-purple-100/40 via-pink-50/30 to-cyan-100/40 rounded-3xl shadow-2xl pt-6 px-8 pb-0 z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 z-40 relative">
          <img src={alchemeLogo} alt="Alcheme" style={{ height: '175px', width: 'auto' }} />
          <div className="flex gap-4">
            {[
              { id: 'collect', img: collectButton, path: '/' },
              { id: 'refine', img: refineButton, path: '/refine' },
              { id: 'awaken', img: awakenButton, path: '/awaken' },
              { id: 'profile', img: profileButton, path: '/profile', active: true }
            ].map((btn) => (
              <button key={btn.id} onClick={() => navigate(btn.path)} className="hover:scale-110 transition-transform active:scale-95">
                <img src={btn.img} className="w-24 h-24 object-contain" style={{ filter: btn.active ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-0 items-end relative flex-1">
          {/* 左侧角色 */}
          <div className="col-span-4 relative h-full flex items-end justify-start z-50">
            <img src={characterImage} alt="Character" className="w-auto h-auto drop-shadow-2xl translate-x-4 absolute bottom-0" style={{ maxHeight: '520px', objectFit: 'contain', zIndex: 50 }} />
          </div>

          {/* 中间勋章墙 */}
          <div className="col-span-4 flex flex-col items-center justify-center relative z-20 h-full">
            <div className="relative" style={{ width: '337.92px', height: '337.92px', transformOrigin: 'center bottom', transform: 'translate(20px,-40px) scale(1.0)'}}>
              <div className="absolute" style={{ width: '675.84px', height: '675.84px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundImage: `url(${medalWallBg})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', pointerEvents: 'none' }} />
              <div className="relative absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: '371.712px', height: '371.712px', zIndex: 1 }}>
                <div className="grid grid-cols-3 gap-4 w-full h-full items-center justify-center">
                  {[...Array(9)].map((_, slotIndex) => {
                    const medal = medals[slotIndex];
                    return (
                      <div key={slotIndex} className="relative w-[116.16px] h-[116.16px] flex items-center justify-center" style={{ border: medal ? 'none' : '1px dashed rgba(139, 105, 20, 0.1)', borderRadius: '8px' }}>
                        {medal && (
                          <button onClick={() => setSelectedMedal(medal)} className="w-full h-full hover:scale-110 transition-transform relative group">
                            <img src={medalImage} alt="Medal" className="w-full h-full object-contain p-1" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6))' }} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧信息 */}
          <div className="col-span-4 flex flex-col items-center justify-start relative pt-4 pb-10">
            <div className="relative z-50 mb-4">
              <img src={owlImage} className="w-56 h-56 object-contain drop-shadow-2xl -translate-x-20 -translate-y-20" style={{ animation: 'owlFloat 3.5s ease-in-out infinite' }} />
              <img src={hexagonCrystal} className="w-48 h-auto object-contain absolute top-[15%] left-[calc(100%-90px)] -translate-y-1/2 z-[99]" style={{ pointerEvents: 'none' }} />
            </div>
            <div className="w-full max-w-[280px] mb-4">
              <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-lg" style={{ background: 'rgba(255, 250, 235, 0.8)', border: '2px solid #8b6914', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', transform: 'translate(50px, -50px)' }}>
                <span className="font-['Cinzel'] text-sm font-medium text-[#8b6914]">USER'S NICKNAME</span>
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <input value={editingNickname} onChange={(e) => setEditingNickname(e.target.value)} className="px-3 py-1 rounded-lg border-2 border-amber-600 flex-1 font-['Cinzel'] text-[#3d2817] bg-white/90" autoFocus />
                    <button onClick={handleSaveNickname} className="px-3 py-1 bg-yellow-500 rounded-lg text-white font-bold text-xs">SAVE</button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="font-['Cinzel'] text-xl font-bold text-[#3d2817] underline decoration-amber-600/30">
                    {nickname || '( please enter here )'}
                  </button>
                )}
              </div>
            </div>
            <button onClick={handleShare} className="w-full max-w-[280px] py-3 px-6 rounded-xl hover:scale-105 transition-all font-['Cinzel'] font-bold text-[#3d2817] shadow-lg border-2 border-[#8b6914]" style={{ background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)', transform: 'translate(50px, -50px)' }}>SHARE MY SOUL ARCHIVE</button>
          </div>
        </div>
      </div>

      {/* --- 魔法弹窗：左右分栏布局 (勋章再放大, 日期单行) --- */}
      {selectedMedal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black/85 backdrop-blur-xl animate-in fade-in duration-300" onClick={closeMedalModal}>
          <div className="relative w-full h-full max-w-[1800px] flex items-center px-16 animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
            
            {/* 关闭按钮 */}
            <button onClick={closeMedalModal} className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all hover:rotate-90 z-[110]">
              <X size={40} />
            </button>

            {/* 左侧：勋章荣誉区 (再次放大 1.5 倍) */}
            <div className="w-[600px] flex flex-col items-center justify-center pr-16">
              <div className="relative mb-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500/10 blur-[150px] rounded-full -z-10 animate-pulse" />
                {/* 勋章再次放大 1.5 倍, 从 w-80 改为 w-[480px] */}
                <img src={medalImage} className="w-[480px] h-[480px] object-contain filter drop-shadow-[0_0_60px_rgba(255,215,0,0.5)]" alt="medal" />
              </div>
              <h2 className="text-6xl font-['Cinzel'] font-bold text-white tracking-[0.2em] text-center drop-shadow-2xl uppercase">
                {selectedMedal.text}
              </h2>
              
              {/* --- 修改点：日期单行显示, 并去除装饰横线 --- */}
              <div className="mt-6 flex items-center justify-center">
                <p className="font-['Cinzel'] text-yellow-400/90 text-xl tracking-[0.2em] font-medium whitespace-nowrap">
                  AWAKENED ON: {new Date(selectedMedal.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* 中间分隔线 */}
            <div className="w-px h-[60vh] bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent" />

            {/* 右侧：卡牌平铺区 (卡牌放大 1.5 倍) */}
            <div className="flex-1 h-screen flex items-center pl-16 overflow-x-auto scrollbar-hide py-10">
              <div className="flex gap-16 pr-20">
                {selectedMedal.cards.map((card, idx) => (
                  <div key={idx} className="flex flex-col items-center group relative">
                    
                    {/* 卡牌主体 - 放大 1.5 倍 (w-72 h-[400px]) */}
                    <div className="w-72 h-[400px] border-[4px] border-yellow-600/30 rounded-2xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:-translate-y-6 group-hover:shadow-yellow-500/20">
                      <img src={cardBackgrounds[card.cardBgIndex]} className="w-full h-full object-cover brightness-90 group-hover:brightness-105" />
                      <img src={stampPatterns[card.stampIndex]} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 opacity-80" />
                      
                      {/* ORES 黑色浮窗 - 字体加大且可交互 */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none group-hover:pointer-events-auto">
                        <div className="w-full h-full bg-black/90 flex flex-col p-8 backdrop-blur-md">
                          <p className="text-2xl font-['Cinzel'] text-yellow-500 font-black mb-6 border-b-2 border-yellow-500/40 pb-3 tracking-widest uppercase">ORES</p>
                          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-600/50">
                            {card.ores?.length ? card.ores.map((ore, oidx) => (
                              <div key={oidx} className="mb-6 text-base leading-relaxed text-white border-l-4 border-yellow-500/60 pl-4 py-1">
                                 <div className="text-xl text-yellow-300 font-bold mb-1 tracking-wider">{ore.date}</div>
                                 <div className="italic text-lg text-white/90">"{ore.content}"</div>
                              </div>
                            )) : <p className="text-lg text-white/40 italic uppercase tracking-widest">Pure essence refinement</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 卡牌下方信息 - 显著放大 */}
                    <div className="mt-10 text-center">
                      <div className="font-['Cinzel'] text-4xl font-black text-white group-hover:text-yellow-400 transition-colors uppercase tracking-widest drop-shadow-lg">
                        {card.text}
                      </div>
                      <div className="font-['Cinzel'] text-xl font-bold text-yellow-200/50 mt-3 tracking-widest uppercase border-t border-yellow-500/20 pt-2">
                        REFINED ON: {new Date(card.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes owlFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(202, 138, 4, 0.6); border-radius: 10px; }
      `}</style>
    </div>
  );
}