import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// --- 资源导入 ---
import cardBg1 from 'figma:asset/36f068e9e853e013a326ddfeb3134365b8967d6f.png';
import cardBg2 from 'figma:asset/0beaaa20696396b0997d391dc1ed91d00f9eb7d8.png';
import cardBg3 from 'figma:asset/b24f257b05ef0a618e241f85ac4368499ebda3c0.png';
import stamp1 from 'figma:asset/09ac11079bc3070142d0c981f2a1e6f042ae75a2.png';
import stamp2 from 'figma:asset/d1ca70bd3631afc028f85c903ce19dacbbe493b9.png';
import stamp3 from 'figma:asset/981b85fbc4b9bb9aba7723567677e46e9d1a3fb8.png';
import medalImage from 'figma:asset/99b83df7ca82c99f905eaf13a84586014ff41499.png';

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

export default function CardGallery() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [medals, setMedals] = useState<Medal[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedMedal, setSelectedMedal] = useState<string | null>(null);

  const cardBackgrounds = [cardBg1, cardBg2, cardBg3];
  const stampPatterns = [stamp1, stamp2, stamp3];

  useEffect(() => {
    const cardsData = localStorage.getItem('refinedCards');
    if (cardsData) setCards(JSON.parse(cardsData));
    const medalsData = localStorage.getItem('awakenedMedals');
    if (medalsData) setMedals(JSON.parse(medalsData));
  }, []);

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
  };

  const toggleMedalSelection = (medalId: string) => {
    setSelectedMedal(prev => prev === medalId ? null : medalId);
  };

  const handleAwaken = () => {
    if (selectedCards.length === 0) {
      alert('Please select at least one card to awaken');
      return;
    }
    const selectedCardData = cards.filter(card => selectedCards.includes(card.id));
    localStorage.setItem('awakenCards', JSON.stringify(selectedCardData));
    if (selectedMedal) {
      const selectedMedalData = medals.find(m => m.id === selectedMedal);
      localStorage.setItem('evolveMedal', JSON.stringify(selectedMedalData));
    } else {
      localStorage.removeItem('evolveMedal');
    }
    navigate('/awaken?showAnimation=true');
  };

  const getButtonText = () => {
    if (selectedMedal && selectedCards.length > 0) return `EVOLVE (1 Medal + ${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''})`;
    else if (selectedCards.length > 0) return `AWAKEN (${selectedCards.length} Card${selectedCards.length > 1 ? 's' : ''})`;
    return 'SELECT CARDS';
  };

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex items-center justify-center bg-cover bg-center"
      style={{ width: '1920px', height: '1080px', margin: '0 auto', backgroundImage: 'url("figma:asset/f41bd8526e24975938d871d048f307c6b265a04c.png")' }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(251, 191, 36, 0.3) 100%)', backdropFilter: 'blur(20px)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-12">
        <div className="flex items-center justify-between mb-8">
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#8b6914', textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)', fontWeight: 600, maxWidth: '600px', lineHeight: '1.5' }}>
            {selectedMedal ? (
              <span>🔮 Evolution Mode: Select cards to evolve your medal</span>
            ) : (
              <span>✨ Creation Mode: Select cards to forge a new medal</span>
            )}
          </div>
          <button onClick={() => navigate('/awaken')} className="hover:scale-110 transition-all" style={{ background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.95) 0%, rgba(232, 213, 183, 0.95) 100%)', border: '3px solid #8b6914', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
            <X size={32} color="#3d2817" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-main pr-4">
          
          {/* 勋章列表区 */}
          {medals.length > 0 && (
            <div className="mb-12">
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 700, color: '#8b6914', textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)', letterSpacing: '1.5px', marginBottom: '10px' }}>EMBLEM BADGES</h2>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#8b6914', marginBottom: '20px', fontWeight: 600 }}>Select one medal to evolve it with new cards</p>
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {medals.map((medal, idx) => (
                  <div key={medal.id} className="relative group flex justify-center">
                    <div onClick={() => toggleMedalSelection(medal.id)} className="relative cursor-pointer transition-transform group-hover:scale-110" style={{ transform: selectedMedal === medal.id ? 'scale(1.15)' : 'scale(1)' }}>
                      {selectedMedal === medal.id && (
                        <div className="absolute -top-2 -right-2 z-20" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', border: '3px solid #8b6914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ color: '#3d2817', fontSize: '1.1rem', fontWeight: 900 }}>✓</div>
                        </div>
                      )}
                      <img src={medalImage} className="w-64 h-64 object-contain drop-shadow-xl" />
                    </div>

                    {/* 勋章浮窗 - 严格还原原本格式 */}
                    <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50 ${ (idx + 1) % 5 === 0 ? 'right-full pr-5' : 'left-full pl-5' }`}>
                      <div className="absolute top-0 w-8 h-full bg-transparent" style={{ left: (idx + 1) % 5 === 0 ? 'auto' : '-20px', right: (idx + 1) % 5 === 0 ? '-20px' : 'auto' }} />
                      
                      <div className="w-[500px] bg-[rgba(255,250,235,0.98)] border-[3px] border-[#8b6914] rounded-xl p-5 shadow-2xl">
                        <div className="mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', color: '#3d2817', fontWeight: 700, borderBottom: '2px solid #8b6914', paddingBottom: '10px' }}>
                          {medal.text}
                        </div>
                        <div className="mb-4" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.75rem', color: '#8b6914', fontWeight: 600 }}>
                          Awakened: {new Date(medal.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        
                        <div className="mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#8b6914', fontWeight: 700 }}>
                          Forged from {medal.cards.length} card{medal.cards.length > 1 ? 's' : ''}:
                        </div>

                        {/* 滚动区域 */}
                        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar-tooltip pr-1" style={{ maxHeight: '450px' }}>
                          {medal.cards.map((card, cardIndex) => (
                            <div key={cardIndex} className="px-3 py-2 rounded" style={{ background: 'rgba(232, 213, 183, 0.6)', border: '2px solid #d4af37' }}>
                              {card.text && (
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: '#3d2817', fontWeight: 600, marginBottom: '6px' }}>{card.text}</div>
                              )}
                              {card.ores && card.ores.length > 0 && (
                                <div className="mt-2 pl-2 border-l-2 border-amber-600">
                                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: '#8b6914', fontWeight: 600, marginBottom: '4px' }}>From {card.ores.length} ore{card.ores.length > 1 ? 's' : ''}:</div>
                                  {card.ores.map((ore, oreIndex) => (
                                    <div key={oreIndex} className="mb-1" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.65rem', color: '#3d2817', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                      <span style={{ fontWeight: 600, color: '#8b6914' }}>{ore.date}:</span> {ore.content}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 卡片列表区 */}
          {cards.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 700, color: '#8b6914', textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)', letterSpacing: '1.5px', marginBottom: '10px' }}>MILESTONE CARDS</h2>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '0.85rem', color: '#8b6914', marginBottom: '20px', fontWeight: 600 }}>Select cards to forge a new medal</p>
              <div className="grid gap-6 pb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {cards.map((card, idx) => (
                  <div key={card.id} className="relative group flex flex-col items-center">
                    <div onClick={() => toggleCardSelection(card.id)} className="relative cursor-pointer transition-transform group-hover:scale-105" style={{ transform: selectedCards.includes(card.id) ? 'scale(1.05)' : 'scale(1)' }}>
                      {selectedCards.includes(card.id) && (
                        <div className="absolute -top-1 -right-1 z-20" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', border: '2px solid #8b6914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ color: '#3d2817', fontSize: '0.85rem', fontWeight: 900 }}>✓</div>
                        </div>
                      )}
                      <div className="relative" style={{ width: '140px', border: selectedCards.includes(card.id) ? '3px solid #ffd700' : '3px solid transparent', borderRadius: '10px', boxShadow: selectedCards.includes(card.id) ? '0 0 15px rgba(255, 215, 0, 0.8)' : 'none' }}>
                        <img src={cardBackgrounds[card.cardBgIndex]} className="w-full h-auto drop-shadow-xl" />
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9">
                          <img src={stampPatterns[card.stampIndex]} className="w-full h-full object-contain" style={{ filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.3))' }} />
                        </div>
                      </div>
                    </div>

                    {/* 卡片浮窗 - 严格还原原本格式 */}
                    <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50 ${ (idx + 1) % 6 === 0 ? 'right-full pr-5' : 'left-full pl-5' }`}>
                      <div className="absolute top-0 w-8 h-full bg-transparent" style={{ left: (idx + 1) % 6 === 0 ? 'auto' : '-20px', right: (idx + 1) % 6 === 0 ? '-20px' : 'auto' }} />
                      
                      <div className="w-[400px] bg-[rgba(255,250,235,0.98)] border-[3px] border-[#8b6914] rounded-xl p-5 shadow-2xl">
                        {card.text && (
                          <div className="mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', color: '#3d2817', fontWeight: 600, borderBottom: '2px solid #8b6914', paddingBottom: '8px' }}>
                            {card.text}
                          </div>
                        )}
                        <div className="mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.75rem', color: '#8b6914', fontWeight: 600 }}>
                          Created: {new Date(card.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        {card.ores && card.ores.length > 0 && (
                          <div>
                            <div className="mb-2" style={{ fontFamily: "'Cinzel', serif", fontSize: '0.8rem', color: '#8b6914', fontWeight: 700 }}>
                              Refined from {card.ores.length} ore{card.ores.length > 1 ? 's' : ''}:
                            </div>
                            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar-tooltip pr-1" style={{ maxHeight: '350px' }}>
                              {card.ores.map((ore, index) => (
                                <div key={index} className="px-3 py-2 rounded" style={{ background: 'rgba(232, 213, 183, 0.6)', border: '1px solid #d4af37' }}>
                                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.7rem', color: '#8b6914', fontWeight: 600, marginBottom: '4px' }}>{ore.date}</div>
                                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: '0.75rem', color: '#3d2817', lineHeight: '1.4', wordBreak: 'break-word' }}>{ore.content}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部确认按钮 */}
        <div className="flex justify-center mt-6 pb-6">
          <button onClick={handleAwaken} disabled={selectedCards.length === 0} className="hover:scale-110 transition-all shadow-xl" style={{ background: selectedCards.length === 0 ? '#ccc' : 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)', border: '4px solid #8b6914', borderRadius: '16px', padding: '16px 32px', cursor: selectedCards.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedCards.length === 0 ? 0.5 : 1 }}>
            <span style={{ fontFamily: "'Cinzel', serif", color: '#3d2817', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '2px' }}>{getButtonText()}</span>
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar-main::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-main::-webkit-scrollbar-thumb { background: rgba(139, 105, 20, 0.1); border-radius: 10px; }
        .custom-scrollbar-tooltip::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar-tooltip::-webkit-scrollbar-thumb { background: rgba(139, 105, 20, 0.2); border-radius: 10px; }
        .custom-scrollbar-tooltip::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}