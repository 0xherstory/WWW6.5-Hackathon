import { useNavigate, useSearchParams } from 'react-router';
import backgroundImage from 'figma:asset/f41bd8526e24975938d871d048f307c6b265a04c.png';
import characterImage from 'figma:asset/f1d6e95b671451fab24fb44b50161720f6f89ad3.png';
import collectButton from 'figma:asset/f103e578864ca4d98d1d93e72ca377df8077381a.png';
import refineButton from 'figma:asset/bcc24e622f7079ba9837ab4380e8eb2c99b889d1.png';
import awakenButton from 'figma:asset/5042fea45ce6ca07d2d6371987ccbdb342fe1d29.png';
import profileButton from 'figma:asset/dd0fae2b566b4d9b18684364e779990d3e3e7890.png';
import owlImage from 'figma:asset/5dfb73f2e2092eb765b24ba8c1a852ce5f3731e9.png';
import alchemeLogo from 'figma:asset/a82dc1e92d5a60168dfc16bfe3402cf3da775301.png';
import parchmentScroll from 'figma:asset/6e9c0278614ee59e3fa39d8a0594cbf4800e013a.png';
import awakenDoor from 'figma:asset/dacf8af5f4cb3701c8f630102721791cf2d07102.png';
import medalImage from 'figma:asset/99b83df7ca82c99f905eaf13a84586014ff41499.png';
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

interface Card { id: string; cardBgIndex: number; stampIndex: number; text: string; date: string; }
interface Medal { id: string; text: string; date: string; cards: Card[]; }

export default function Awaken() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [totalCards, setTotalCards] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [evolveMedal, setEvolveMedal] = useState<Medal | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [medalText, setMedalText] = useState('');
  const [showMedalInput, setShowMedalInput] = useState(false);

  const cardBackgrounds = [cardBg1, cardBg2, cardBg3];
  const stampPatterns = [stamp1, stamp2, stamp3];

  useEffect(() => {
    const loadData = () => {
      const cardsData = localStorage.getItem('refinedCards');
      setTotalCards(cardsData ? JSON.parse(cardsData).length : 0);
      const medalsData = localStorage.getItem('awakenedMedals');
      setTotalBadges(medalsData ? JSON.parse(medalsData).length : 0);
    };
    loadData();
    window.addEventListener('cardsUpdated', loadData);
    window.addEventListener('medalsUpdated', loadData);
    return () => {
      window.removeEventListener('cardsUpdated', loadData);
      window.removeEventListener('medalsUpdated', loadData);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('showAnimation') === 'true') {
      const awakenCardsData = localStorage.getItem('awakenCards');
      const evolveMedalData = localStorage.getItem('evolveMedal');
      if (awakenCardsData) {
        setSelectedCards(JSON.parse(awakenCardsData));
        if (evolveMedalData) {
          const medal = JSON.parse(evolveMedalData);
          setEvolveMedal(medal);
          setMedalText(medal.text);
        }
        setShowAnimation(true);
        setTimeout(() => setAnimationPhase(1), 500);
        setTimeout(() => setAnimationPhase(2), 3000);
        setTimeout(() => setShowMedalInput(true), 4500);
      }
    }
  }, [searchParams]);

  const handleConfirmMedal = () => {
    const cardsData = localStorage.getItem('refinedCards');
    const allCards = cardsData ? JSON.parse(cardsData) : [];
    const selectedCardIds = selectedCards.map(card => card.id);
    const remainingCards = allCards.filter((card: Card) => !selectedCardIds.includes(card.id));
    localStorage.setItem('refinedCards', JSON.stringify(remainingCards));
    const medalsData = localStorage.getItem('awakenedMedals');
    const medals = medalsData ? JSON.parse(medalsData) : [];
    if (evolveMedal) {
      const idx = medals.findIndex((m: Medal) => m.id === evolveMedal.id);
      if (idx !== -1) {
        medals[idx] = { ...evolveMedal, text: medalText, date: new Date().toISOString(), cards: [...evolveMedal.cards, ...selectedCards] };
      }
    } else {
      medals.push({ id: `medal-${Date.now()}`, text: medalText, date: new Date().toISOString(), cards: selectedCards });
    }
    localStorage.setItem('awakenedMedals', JSON.stringify(medals));
    window.dispatchEvent(new Event('cardsUpdated'));
    window.dispatchEvent(new Event('medalsUpdated'));
    setShowAnimation(false);
    navigate('/awaken');
  };

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

      {/* 主容器 */}
      <div className="relative w-full max-w-7xl bg-gradient-to-br from-purple-100/40 via-pink-50/30 to-cyan-100/40 rounded-3xl shadow-2xl pt-6 px-8 pb-0 z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-2 z-40 relative">
          <img src={alchemeLogo} alt="Alcheme" style={{ height: '175px', width: 'auto' }} />
          <div className="flex gap-4">
            {[
              { id: 'collect', img: collectButton, path: '/' },
              { id: 'refine', img: refineButton, path: '/refine' },
              { id: 'awaken', img: awakenButton, path: '/awaken', active: true },
              { id: 'profile', img: profileButton, path: '/profile' }
            ].map((btn) => (
              <button key={btn.id} onClick={() => navigate(btn.path)} className="hover:scale-110 transition-transform active:scale-95">
                <img src={btn.img} className="w-24 h-24 object-contain" style={{ filter: btn.active ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.8))' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="grid grid-cols-12 gap-0 items-end relative flex-1 min-h-[500px]">
          
          {/* 左侧角色 */}
          <div className="col-span-4 relative h-full flex items-end pb-0">
            <img 
              src={characterImage} 
              alt="Alchemist Character" 
              className="w-auto h-auto drop-shadow-2xl translate-x-4"
              style={{ maxHeight: '520px', objectFit: 'contain', display: 'block', marginBottom: '-1px' }}
            />
          </div>

          {/* 中间核心 - 门容器 */}
          <div className="col-span-4 flex flex-col items-center justify-center relative z-20 h-full">
            <button 
              onClick={() => navigate('/card-gallery')}
              className="relative hover:scale-102 transition-transform duration-600 cursor-pointer translate-x-[75px] translate-y-[180px]"
              style={{ transform: 'scale(2.6)', transformOrigin: 'bottom center' }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-purple-400/20 via-transparent to-transparent blur-3xl scale-150 pointer-events-none" />
              <img 
                src={awakenDoor} 
                className="w-full h-auto drop-shadow-2xl"
                style={{ maxWidth: '300px', filter: 'drop-shadow(0 15px 40px rgba(139, 92, 246, 0.5))', animation: 'doorFloat 4s ease-in-out infinite' }}
              />
            </button>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 translate-x-[-60px] whitespace-nowrap z-30">
              <span className="text-sm font-['Cinzel'] text-[#8b6914] font-bold tracking-widest animate-pulse uppercase">
                Click to Visit Honor Gallery
              </span>
            </div>
          </div>

          {/* 右侧区域 - 彻底分离猫头鹰和牛皮纸 */}
          <div className="col-span-4 relative h-full overflow-visible">
            
            {/* 1. 猫头鹰 - 独立定位 */}
            <div 
              className="absolute z-20"
              style={{ 
                top: '-10%',           // 调整猫头鹰上下位置
                right: '80px',        // 调整猫头鹰左右位置
              }}
            >
              <img 
                src={owlImage} 
                className="w-48 h-48 object-contain drop-shadow-2xl"
                style={{ animation: 'owlFloat 3.5s ease-in-out infinite' }}
              />
            </div>

            {/* 2. 单张拉长牛皮纸 - 独立定位（现已设为向右上方移动） */}
            <div 
              className="absolute z-10"
              style={{ 
                top: '11%',           // 减小此值向上移 (例如 '20%')
                right: '18px',       // 减小此值向右移 (例如 '-50px')
                transform: 'scale(0.55)', 
                transformOrigin: 'top center' 
              }}
            >
              <div className="relative" style={{ width: '300px' }}>
                <img 
                  src={parchmentScroll} 
                  className="w-full drop-shadow-xl" 
                  style={{ transform: 'scaleY(1.6)', transformOrigin: 'top center' }} 
                />
                
                {/* 内容上下叠加容器 */}
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-40 gap-12">
                  <div className="flex flex-col items-center">
                    <div className="font-['Cinzel'] text-[#8b6914] text-xl font-bold tracking-tight mb-1">TOTAL CARDS</div>
                    <div className="font-['Cinzel'] text-[#3d2817] text-6xl font-black">{totalCards}</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="font-['Cinzel'] text-[#8b6914] text-xl font-bold tracking-tight mb-1">TOTAL BADGES</div>
                    <div className="font-['Cinzel'] text-[#3d2817] text-6xl font-black">{totalBadges}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 仪式动画弹窗 */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          {animationPhase < 2 ? (
            <div className="relative w-96 h-96">
              {selectedCards.map((card, idx) => {
                const angle = (idx * 360) / selectedCards.length;
                return (
                  <div key={card.id} className="absolute" style={{ left: '50%', top: '50%', transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-200px) ${animationPhase === 1 ? 'rotate(-' + angle + 'deg)' : ''}`, animation: animationPhase === 1 ? 'cardRotate 4s linear infinite' : `cardFlyIn 0.8s ease-out ${idx * 0.1}s forwards`, width: '120px', height: '160px' }}>
                    <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden">
                      <img src={cardBackgrounds[card.cardBgIndex]} className="w-full h-full object-cover" />
                      <img src={stampPatterns[card.stampIndex]} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 object-contain" />
                    </div>
                  </div>
                );
              })}
              {evolveMedal && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 animate-pulse">
                  <img src={medalImage} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
              <div className="relative w-96 h-96">
                <img src={medalImage} className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]" />
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" style={{ transform: `rotate(${i * 30}deg)` }} />
                ))}
              </div>
              {showMedalInput && (
                <div className="flex flex-col items-center gap-6">
                  <textarea value={medalText} onChange={(e) => setMedalText(e.target.value)} placeholder="Name your achievement..." className="w-96 h-24 px-4 py-3 rounded-xl bg-orange-50/90 border-2 border-[#8b6914] font-['Cinzel'] text-[#3d2817] shadow-inner focus:outline-none" />
                  <button onClick={handleConfirmMedal} className="px-10 py-4 bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-[#8b6914] rounded-xl font-['Cinzel'] font-bold text-[#3d2817] hover:scale-105 transition-transform shadow-lg">CONFIRM AWAKENING</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes doorFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes owlFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes cardFlyIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes cardRotate { from { transform: translate(-50%, -50%) rotate(0deg) translateY(-200px); } to { transform: translate(-50%, -50%) rotate(360deg) translateY(-200px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </div>
  );
}