import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

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

export default function CardGallery() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const cardBackgrounds = [cardBg1, cardBg2, cardBg3];
  const stampPatterns = [stamp1, stamp2, stamp3];

  // ==============================
  // 🔌 只改这里：从接口拉取卡片
  // ==============================
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch("https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/cards");
        const data = await res.json();
        setCards(data.data || []);
      } catch (e) {
        // 接口挂了用本地兜底，不影响UI
        const cardsData = localStorage.getItem('refinedCards');
        if (cardsData) setCards(JSON.parse(cardsData));
      }
    };
    fetchCards();
  }, []);

  // Toggle card selection（完全不动）
  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  // Handle awaken button click（完全不动）
  const handleAwaken = () => {
    if (selectedCards.length === 0) {
      alert('Please select at least one card to awaken');
      return;
    }
    
    const selectedCardData = cards.filter(card => selectedCards.includes(card.id));
    localStorage.setItem('awakenCards', JSON.stringify(selectedCardData));
    
    navigate('/awaken?showAnimation=true');
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
        fontFamily: "'Cormorant Garamond', serif"
      }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(251, 191, 36, 0.3) 100%)',
          filter: 'blur(10px)',
          backdropFilter: 'blur(20px)'
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col p-12">
        <div className="flex items-center justify-between mb-8">
          <h1 
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#3d2817',
              textShadow: '0 2px 6px rgba(255, 255, 255, 0.8)',
              letterSpacing: '2px'
            }}
          >
            MILESTONE CARDS
          </h1>

          <button
            onClick={() => navigate('/awaken')}
            className="hover:scale-110 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.95) 0%, rgba(232, 213, 183, 0.95) 100%)',
              border: '3px solid #8b6914',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <X size={32} color="#3d2817" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cards.length === 0 ? (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.5rem',
                color: '#8b6914',
                textShadow: '0 2px 4px rgba(255, 255, 255, 0.8)'
              }}
            >
              No milestone cards yet. Refine some ores to create cards!
            </div>
          ) : (
            <div 
              className="grid gap-8 pb-8"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
              }}
            >
              {cards.map((card) => (
                <div 
                  key={card.id}
                  className="relative flex flex-col items-center transition-transform cursor-pointer"
                  onClick={() => toggleCardSelection(card.id)}
                  style={{
                    transform: selectedCards.includes(card.id) ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {selectedCards.includes(card.id) && (
                    <div 
                      className="absolute -top-1 -right-1 z-20"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        border: '2px solid #8b6914',
                        boxShadow: '0 3px 8px rgba(255, 215, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ color: '#3d2817', fontSize: '1rem', fontWeight: 900 }}>✓</div>
                    </div>
                  )}

                  <div 
                    className="relative"
                    style={{
                      width: '240px',
                      height: 'auto',
                      border: selectedCards.includes(card.id) ? '3px solid #ffd700' : '3px solid transparent',
                      borderRadius: '14px',
                      boxShadow: selectedCards.includes(card.id) ? '0 0 20px rgba(255, 215, 0, 0.8)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img 
                      src={cardBackgrounds[card.cardBgIndex]}
                      alt="Card"
                      className="w-full h-auto drop-shadow-2xl"
                    />

                    <div 
                      className="absolute"
                      style={{
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '62px',
                        height: '62px'
                      }}
                    >
                      <img 
                        src={stampPatterns[card.stampIndex]}
                        alt="Stamp"
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'drop-shadow(0 1.5px 6px rgba(0, 0, 0, 0.3))'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 w-full max-w-xs">
                    {card.text && (
                      <div 
                        className="px-4 py-2 rounded-lg"
                        style={{
                          background: 'rgba(255, 250, 235, 0.95)',
                          border: '1.5px solid #8b6914',
                          fontFamily: "'Cinzel', serif",
                          fontSize: '0.65rem',
                          color: '#3d2817',
                          textAlign: 'center',
                          boxShadow: '0 1.5px 6px rgba(0, 0, 0, 0.2)',
                          fontWeight: 600
                        }}
                      >
                        {card.text}
                      </div>
                    )}

                    <div 
                      className="text-center"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.55rem',
                        color: '#8b6914',
                        fontWeight: 600
                      }}
                    >
                      Created: {new Date(card.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>

                    {card.ores && card.ores.length > 0 && (
                      <div 
                        className="px-3 py-2 rounded-lg"
                        style={{
                          background: 'rgba(232, 213, 183, 0.9)',
                          border: '1.5px solid #8b6914',
                          boxShadow: '0 1.5px 4px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        <div 
                          className="mb-1.5"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '0.58rem',
                            color: '#8b6914',
                            fontWeight: 700,
                            letterSpacing: '0.3px',
                            textAlign: 'center'
                          }}
                        >
                          Refined from {card.ores.length} ore{card.ores.length > 1 ? 's' : ''}:
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {card.ores.map((ore, index) => (
                            <div 
                              key={index}
                              className="px-2 py-1.5 rounded"
                              style={{
                                background: 'rgba(255, 250, 235, 0.8)',
                                border: '1px solid #d4af37'
                              }}
                            >
                              <div 
                                style={{
                                  fontFamily: "'Cinzel', serif",
                                  fontSize: '0.48rem',
                                  color: '#8b6914',
                                  fontWeight: 600,
                                  marginBottom: '1px'
                                }}
                              >
                                {ore.date}
                              </div>

                              <div 
                                style={{
                                  fontFamily: "'Cinzel', serif",
                                  fontSize: '0.52rem',
                                  color: '#3d2817',
                                  lineHeight: '1.3'
                                }}
                              >
                                {ore.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cards.length > 0 && (
          <div className="flex justify-center mt-8 pb-8">
            <button
              onClick={handleAwaken}
              className="hover:scale-110 transition-all"
              style={{
                background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)',
                border: '4px solid #8b6914',
                borderRadius: '16px',
                padding: '20px 40px',
                boxShadow: '0 8px 24px rgba(218, 165, 32, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.4)'
              }}
            >
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#3d2817',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
                }}
              >
                AWAKEN ({selectedCards.length}/{cards.length})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
