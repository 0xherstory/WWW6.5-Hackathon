import { useNavigate, useLocation } from 'react-router';
import backgroundImage from 'figma:asset/f41bd8526e24975938d871d048f307c6b265a04c.png';
import characterImage from 'figma:asset/f1d6e95b671451fab24fb44b50161720f6f89ad3.png';
import cauldronImage from 'figma:asset/c7fbafc3f0498ec8d147582e644dbdc8786df330.png';
import collectButton from 'figma:asset/f103e578864ca4d98d1d93e72ca377df8077381a.png';
import refineButton from 'figma:asset/bcc24e622f7079ba9837ab4380e8eb2c99b889d1.png';
import awakenButton from 'figma:asset/5042fea45ce6ca07d2d6371987ccbdb342fe1d29.png';
import profileButton from 'figma:asset/dd0fae2b566b4d9b18684364e779990d3e3e7890.png';
import owlImage from 'figma:asset/5dfb73f2e2092eb765b24ba8c1a852ce5f3731e9.png';
import alchemeLogo from 'figma:asset/a82dc1e92d5a60168dfc16bfe3402cf3da775301.png';
import crystalCabinet from 'figma:asset/9386d55d614184d987c9810f9d4db867147dc751.png';
import parchmentScroll from 'figma:asset/6e9c0278614ee59e3fa39d8a0594cbf4800e013a.png';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

// Import card backgrounds
import cardBg1 from 'figma:asset/36f068e9e853e013a326ddfeb3134365b8967d6f.png';
import cardBg2 from 'figma:asset/0beaaa20696396b0997d391dc1ed91d00f9eb7d8.png';
import cardBg3 from 'figma:asset/b24f257b05ef0a618e241f85ac4368499ebda3c0.png';

// Import stamp patterns
import stamp1 from 'figma:asset/09ac11079bc3070142d0c981f2a1e6f042ae75a2.png';
import stamp2 from 'figma:asset/d1ca70bd3631afc028f85c903ce19dacbbe493b9.png';
import stamp3 from 'figma:asset/981b85fbc4b9bb9aba7723567677e46e9d1a3fb8.png';

export default function Refine() {
  const navigate = useNavigate();
  const location = useLocation();
  const refiningCount = location.state?.refiningCount || 0;
  const selectedOres = location.state?.selectedOres || [];
  
  const [totalCrystals, setTotalCrystals] = useState(0);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedStamp, setSelectedStamp] = useState(0);
  const [cardText, setCardText] = useState('');

  const cardBackgrounds = [cardBg1, cardBg2, cardBg3];
  const stampPatterns = [stamp1, stamp2, stamp3];

  useEffect(() => {
    const loadOresCount = () => {
      const oresData = localStorage.getItem('collectedOres');
      const ores = oresData ? JSON.parse(oresData) : [];
      setTotalCrystals(ores.length);
    };
    loadOresCount();
    window.addEventListener('oresUpdated', loadOresCount);
    return () => window.removeEventListener('oresUpdated', loadOresCount);
  }, []);

  useEffect(() => {
    if (refiningCount > 0) {
      setSelectedCard(Math.floor(Math.random() * 3));
      setSelectedStamp(Math.floor(Math.random() * 3));
      setShowSmoke(true);
      setTimeout(() => setShowCard(true), 3000);
    }
  }, [refiningCount]);

  const handleConfirmCard = () => {
    const cardsData = localStorage.getItem('refinedCards');
    const cards = cardsData ? JSON.parse(cardsData) : [];
    const newCard = {
      id: Date.now().toString(),
      cardBgIndex: selectedCard,
      stampIndex: selectedStamp,
      text: cardText.trim(),
      date: new Date().toISOString(),
      ores: selectedOres.map((ore: any) => ({ date: ore.date, content: ore.content }))
    };
    cards.push(newCard);
    localStorage.setItem('refinedCards', JSON.stringify(cards));
    window.dispatchEvent(new Event('cardsUpdated'));
    setShowCard(false);
    setShowSmoke(false);
    setCardText('');
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
      <div className="absolute inset-0 pointer-events-none">
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
              { id: 'collect', img: collectButton, path: '/' },
              { id: 'refine', img: refineButton, path: '/refine', active: true },
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
          
          {/* 左侧角色 */}
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

          {/* 中间核心 - 炼金炉 */}
          <div className="col-span-4 flex flex-col items-center justify-center relative z-20 h-full">
            <div className="absolute bottom-10 flex flex-col items-center origin-bottom w-[560px] translate-x-[-10px]">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-radial from-purple-300/30 via-transparent to-transparent blur-3xl scale-150 pointer-events-none" />
                <div className="relative z-10 flex items-center justify-center">
                  <img 
                    src={cauldronImage} 
                    alt="Magic Cauldron" 
                    className="w-full h-auto drop-shadow-2xl"
                    style={{ maxWidth: '480px', filter: 'drop-shadow(0 15px 40px rgba(168, 85, 247, 0.4))' }}
                  />
                  {showSmoke && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="absolute bottom-1/2 left-1/2 -translate-x-1/2"
                          style={{
                            animation: `smoke ${2 + Math.random() * 2}s ease-out infinite`,
                            animationDelay: `${i * 0.2}s`,
                            width: '100px', height: '100px', borderRadius: '50%',
                            background: ['radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)','radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)','radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)','radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)','radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)'][i % 5],
                            filter: 'blur(25px)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 右侧 - 还原位置后的布局 */}
          <div className="col-span-4 flex flex-col items-center justify-center relative pt-2 pb-10 h-full">
            <div className="relative w-full h-full flex items-center justify-center">
              
              {/* 1. 柜子 - 独立动画包含 scaleX(1.4) */}
              <div className="relative z-0 translate-y-[-20px] translate-x-[-30px]">
                <button
                  onClick={() => navigate('/ore-collection')}
                  className="relative hover:scale-105 transition-transform duration-300 cursor-pointer block"
                >
                  <img 
                    src={crystalCabinet} 
                    alt="Cabinet" 
                    className="drop-shadow-2xl"
                    style={{
                      height: '380px', 
                      width: 'auto',
                      filter: 'drop-shadow(0 10px 30px rgba(101, 67, 33, 0.5))',
                      animation: 'cabinetFloat 4s ease-in-out infinite' 
                    }}
                  />
                </button>
                
                <div className="mt-6 text-center">
                  <span className="font-['Cinzel'] text-[#8b6914] text-sm font-bold tracking-widest animate-pulse uppercase">
                    click to find ores
                  </span>
                </div>
              </div>

              {/* 2. 猫头鹰 */}
              <div 
                className="absolute z-20"
                style={{ 
                  top: '-20%', 
                  right: '-20px', 
                  transform: 'rotate(5deg)'
                }}
              >
                <img 
                  src={owlImage} 
                  className="w-52 h-52 object-contain drop-shadow-2xl"
                  style={{ animation: 'owlFloat 3.5s ease-in-out infinite' }} 
                />
              </div>

              {/* 3. 羊皮纸 */}
              <div 
                className="absolute z-10"
                style={{ 
                  top: '12%', 
                  right: '-60px', 
                  transform: 'scale(0.55)', 
                  transformOrigin: 'top center' 
                }}
              >
                <div className="relative" style={{ width: '240px' }}>
                  <img src={parchmentScroll} alt="Scroll" className="w-full h-auto drop-shadow-xl" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-12 py-12">
                    <div className="font-['Cinzel'] text-[#8b6914] text-xl font-bold tracking-wider">TOTAL</div>
                    <div className="font-['Cinzel'] text-[#3d2817] text-5xl font-black">{totalCrystals}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 确认卡片弹窗 */}
      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.5s ease-out' }}>
          <div className="relative flex items-center gap-8" style={{ animation: 'cardZoomIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="relative flex flex-col items-center">
              <div className="relative" style={{ width: '500px', height: 'auto' }}>
                <img src={cardBackgrounds[selectedCard]} alt="Card" className="w-full h-auto drop-shadow-2xl" />
                <div className="absolute" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '180px', height: '180px' }}>
                  <img src={stampPatterns[selectedStamp]} alt="Stamp" className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))' }} />
                </div>
              </div>
              <div className="mt-6 w-full max-w-md">
                <textarea
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  placeholder="Create your milestone card..."
                  className="w-full px-6 py-4 rounded-xl resize-none"
                  rows={4}
                  style={{ background: 'rgba(255, 250, 235, 0.9)', border: '3px solid #8b6914', fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#3d2817', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.5)' }}
                />
              </div>
            </div>
            <button onClick={handleConfirmCard} className="hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)', border: '4px solid #8b6914', borderRadius: '16px', padding: '20px 40px', boxShadow: '0 8px 24px rgba(218, 165, 32, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.4)' }}>
              <span style={{ fontFamily: "'Cinzel', serif", color: '#3d2817', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px' }}>CONFIRM</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes smoke { 0% { transform: translateY(0) translateX(-50%) scale(0.5); opacity: 0.8; } 100% { transform: translateY(-300px) translateX(-50%) scale(2); opacity: 0; } }
        @keyframes owlFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        /* 柜子专用动画：同时处理位移和缩放比例 */
        @keyframes cabinetFloat {
          0%, 100% { transform: scaleX(1.4) translateY(0px); }
          50% { transform: scaleX(1.4) translateY(-10px); }
        }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes sparkle { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cardZoomIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}