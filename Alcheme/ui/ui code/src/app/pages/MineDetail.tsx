import { useNavigate } from 'react-router';
import mineBackground from 'figma:asset/2a898e365b213bc787cb0a2765fc5b4c40853d30.png';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

// Import crystal images
import crystal1 from 'figma:asset/6e4310e7eedb7599a8783ae85915384fa1cdb41a.png';
import crystal2 from 'figma:asset/c9271aa2b5c4b3ac4fd8114695354054ec89c320.png';
import crystal3 from 'figma:asset/422998f75fa5b2894d6c25e42f9caa6c99f9321.png';
import crystal4 from 'figma:asset/4a6ca87b1626e3188c8da1e6e3437313330918fd.png';
import crystal5 from 'figma:asset/4331dd7b68e3e3da6cc1381fab0958d10762790c.png';
import crystal6 from 'figma:asset/83aeacc4fc141482124734bd80a9fc84f4b2c521.png';
import crystal7 from 'figma:asset/631bbd517278741d8b4593c3ac1af0dc44681864.png';

interface MineEntry {
  date: string;
  content: string;
  id: number;
}

export default function MineDetail() {
  const navigate = useNavigate();
  const [journalText, setJournalText] = useState('');
  const [mineEntries, setMineEntries] = useState<MineEntry[]>([]);

  const crystalImages = [crystal1, crystal2, crystal3, crystal4, crystal5, crystal6, crystal7];

  // Get today's date
  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  // Handle mine button click
  const handleMine = () => {
    if (journalText.trim()) {
      const newEntry: MineEntry = {
        date: formattedDate,
        content: journalText,
        id: Date.now()
      };
      setMineEntries([...mineEntries, newEntry]);
      setJournalText(''); // Clear the text area
    }
  };

  // ==============================
  // 🔌 只改这里：对接采集矿石接口
  // ==============================
  const handleCollect = async () => {
    if (mineEntries.length === 0) return;

    try {
      // 批量提交到后端接口 /api/mine
      for (const entry of mineEntries) {
        await fetch("https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/mine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "手动采集",
            content: entry.content
          })
        });
      }

      // 通知其他页面更新
      window.dispatchEvent(new Event('oresUpdated'));
      alert(`Collected ${mineEntries.length} ores!`);
      setMineEntries([]);
    } catch (e) {
      // 接口异常时本地兜底
      const oresData = localStorage.getItem('collectedOres');
      const ores = oresData ? JSON.parse(oresData) : [];
      
      mineEntries.forEach(entry => {
        ores.push({
          id: `ore-${Date.now()}`,
          type: 'mine',
          content: entry.content,
          date: entry.date
        });
      });
      
      localStorage.setItem('collectedOres', JSON.stringify(ores));
      window.dispatchEvent(new Event('oresUpdated'));
      alert(`Collected ${mineEntries.length} ores!`);
      setMineEntries([]);
    }
  };

  const completedRuns = [
    { date: '2023/10/01', content: 'Reflected on the day and felt grateful for small moments.' },
    { date: '2023/10/02', content: 'Learned a new skill and felt a sense of accomplishment.' },
    { date: '2023/10/03', content: 'Had a meaningful conversation with a friend.' }
  ];

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        width: '1920px',
        height: '1080px',
        maxWidth: '1920px',
        maxHeight: '1080px',
        margin: '0 auto'
      }}
    >
      {/* Background image with crop to remove white border */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${mineBackground})`,
          backgroundSize: '110%',
          backgroundPosition: 'center',
          transform: 'scale(1.05)'
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 hover:scale-105 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)',
          border: '2px solid #8b6914',
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-2">
          <ArrowLeft size={18} style={{ color: '#3d2817' }} />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#3d2817',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            Back
          </span>
        </div>
      </button>

      {/* Magical particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 3}s infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <Sparkles 
              className="text-white/40" 
              size={Math.random() * 8 + 6}
            />
          </div>
        ))}
      </div>

      {/* Main content container */}
      <div className="relative w-full max-w-5xl flex flex-col items-center gap-8">
        
        {/* Top parchment card - Daily Mine */}
        <div 
          className="relative w-full max-w-3xl rounded-2xl shadow-2xl border-4 border-amber-900/40 p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.75) 0%, rgba(232, 213, 183, 0.7) 100%)',
            boxShadow: '0 10px 40px rgba(101, 67, 33, 0.5)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-amber-900/50 rounded-tl" />
          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-amber-900/50 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-amber-900/50 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-amber-900/50 rounded-br" />

          {/* Date display inside card */}
          <div className="mb-4">
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#8b6914',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {formattedDate}
            </span>
          </div>

          {/* Text input area - larger */}
          <textarea 
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write about your day, your thoughts, and your insights..."
            className="w-full p-6 rounded-lg border-2 border-amber-800/30 resize-none focus:outline-none focus:ring-2 focus:ring-amber-600/40 transition-all"
            rows={8}
            style={{
              background: 'rgba(209, 180, 140, 0.3)',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#3d2817'
            }}
          />

          {/* Mine button */}
          <button 
            className="w-full mt-6 hover:scale-105 transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f4d03f 0%, #c9a227 50%, #f4d03f 100%)',
              border: '3px solid #8b6914',
              borderRadius: '12px',
              padding: '12px 0',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0, 0, 0, 0.2)'
            }}
            onClick={handleMine}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#3d2817',
                fontSize: '1.5rem',
                fontWeight: 700,
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)',
                letterSpacing: '1px'
              }}
            >
              MINE
            </span>
          </button>
        </div>

        {/* Completed runs display */}
        <div className="relative w-full flex flex-col items-center gap-4">
          {/* Crystal path visualization */}
          <div className="flex items-center justify-center gap-3 flex-wrap max-w-3xl">
            {mineEntries.map((entry, idx) => (
              <div
                key={entry.id}
                className="group relative"
              >
                {/* Crystal image instead of orb */}
                <div className="w-20 h-20 hover:scale-110 transition-transform cursor-pointer">
                  <img 
                    src={crystalImages[idx % crystalImages.length]}
                    alt="crystal"
                    className="w-full h-full object-contain"
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.6))'
                    }}
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div 
                    className="rounded-lg p-3 shadow-xl"
                    style={{
                      background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%)',
                      border: '2px solid #8b6914',
                      minWidth: '200px',
                      maxWidth: '300px'
                    }}
                  >
                    <div 
                      className="text-xs mb-2"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: '#8b6914',
                        fontWeight: 600
                      }}
                    >
                      {entry.date}
                    </div>
                    <div 
                      className="text-xs"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: '#3d2817',
                        whiteSpace: 'normal',
                        lineHeight: '1.4'
                      }}
                    >
                      {entry.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collect button at bottom right - only show when there are mine entries */}
        {mineEntries.length > 0 && (
          <div className="absolute bottom-4 right-4">
            <button 
              className="relative group hover:scale-105 transition-transform animate-pulse"
              style={{
                filter: 'drop-shadow(0 8px 20px rgba(218, 165, 32, 0.7))',
                animation: 'glow 2s ease-in-out infinite'
              }}
              onClick={handleCollect}
            >
              <div 
                className="px-12 py-3 rounded-xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #ff8c00 0%, #ffd700 50%, #ff8c00 100%)',
                  border: '4px solid #b8860b',
                  boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.6)'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#2d1810',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    textShadow: '0 1px 3px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 215, 0, 0.5)',
                    letterSpacing: '3px'
                  }}
                >
                  COLLECT
                </span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 8px 20px rgba(218, 165, 32, 0.7));
          }
          50% {
            filter: drop-shadow(0 8px 30px rgba(255, 215, 0, 1));
          }
        }
      `}</style>
    </div>
  );
}
