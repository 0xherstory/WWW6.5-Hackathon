import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

// Import crystal images
import crystal1 from 'figma:asset/6e4310e7eedb7599a8783ae85915384fa1cdb41a.png';
import crystal2 from 'figma:asset/c9271aa2b5c4b3ac4fd8114695354054ec89c320.png';
import crystal3 from 'figma:asset/422998f75fa5b2894d6c25e42f9caa86c99f9321.png';
import crystal4 from 'figma:asset/4a6ca87b1626e3188c8da1e6e3437313330918fd.png';
import crystal5 from 'figma:asset/4331dd7b68e3e3da6cc1381fab0958d10762790c.png';
import crystal6 from 'figma:asset/83aeacc4fc141482124734bd80a9fc84f4b2c521.png';
import crystal7 from 'figma:asset/631bbd517278741d8b4593c3ac1af0dc44681864.png';

interface OreItem {
  id: string;
  type: string; // 'task' or 'mine'
  content: string;
  date: string;
  crystalImage: string;
}

export default function OreCollection() {
  const navigate = useNavigate();
  const [ores, setOres] = useState<OreItem[]>([]);
  const [selectedOres, setSelectedOres] = useState<Set<string>>(new Set());

  const crystalImages = [crystal1, crystal2, crystal3, crystal4, crystal5, crystal6, crystal7];

  // ==============================
  // 🔌 只改这里：从接口拉取矿石列表
  // ==============================
  useEffect(() => {
    const fetchOres = async () => {
      try {
        const res = await fetch("https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/ores");
        const data = await res.json();
        const loadedOres = data.data || [];
        
        const oresWithImages = loadedOres.map((ore: any) => ({
          ...ore,
          crystalImage: crystalImages[Math.floor(Math.random() * crystalImages.length)]
        }));
        setOres(oresWithImages);
      } catch (e) {
        // 接口异常本地兜底
        const oresData = localStorage.getItem('collectedOres');
        if (oresData) {
          const loadedOres = JSON.parse(oresData);
          const oresWithImages = loadedOres.map((ore: any) => ({
            ...ore,
            crystalImage: crystalImages[Math.floor(Math.random() * crystalImages.length)]
          }));
          setOres(oresWithImages);
        }
      }
    };
    fetchOres();
  }, []);

  const toggleOreSelection = (oreId: string) => {
    const newSelected = new Set(selectedOres);
    if (newSelected.has(oreId)) {
      newSelected.delete(oreId);
    } else {
      newSelected.add(oreId);
    }
    setSelectedOres(newSelected);
  };

  // ==============================
  // 🔌 只改这里：精炼后删除后端已消耗的矿石
  // ==============================
  const handleRefine = async () => {
    if (selectedOres.size <= 0) return;

    const selectedOresDetails = ores.filter(ore => selectedOres.has(ore.id));
    
    try {
      // 批量删除后端已精炼的矿石
      for (const ore of selectedOresDetails) {
        await fetch(`https://22bcdad4-a6ad-4285-adac-6e7d7e867c52-00-2rkqab45ars9.janeway.replit.dev/api/ores/${ore.id}`, {
          method: "DELETE"
        });
      }
    } catch (err) {
      console.log("本地模式删除矿石");
    }

    // 更新本地列表
    const remainingOres = ores.filter(ore => !selectedOres.has(ore.id));
    setOres(remainingOres);
    setSelectedOres(new Set());
    window.dispatchEvent(new Event('oresUpdated'));

    // 跳转到精炼页
    navigate('/refine', { 
      state: { 
        refiningCount: selectedOres.size,
        selectedOres: selectedOresDetails 
      } 
    });
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
      {/* Blurred background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(251, 191, 36, 0.3) 100%)',
          filter: 'blur(10px)',
          backdropFilter: 'blur(20px)'
        }}
      />

      {/* Glass morphism container */}
      <div 
        className="relative z-10 w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '3px solid rgba(139, 105, 20, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 0 40px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Close button */}
        <button
          onClick={() => navigate('/refine')}
          className="absolute top-6 right-6 hover:scale-110 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)',
            border: '3px solid #8b6914',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4)',
            cursor: 'pointer'
          }}
        >
          <X size={28} color="#3d2817" strokeWidth={3} />
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#8b6914',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(255, 255, 255, 0.5)'
            }}
          >
            Crystal Collection
          </h2>
        </div>

        {/* Crystals grid */}
        <div 
          className="flex flex-wrap justify-center gap-8 mb-12 overflow-y-auto"
          style={{
            maxHeight: 'calc(85vh - 240px)',
            padding: '20px'
          }}
        >
          {ores.map((ore) => {
            const isSelected = selectedOres.has(ore.id);
            return (
              <div
                key={ore.id}
                className="relative group flex flex-col items-center"
              >
                {/* Crystal container - clickable */}
                <button
                  onClick={() => toggleOreSelection(ore.id)}
                  className="relative hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    width: '150px',
                    height: '150px'
                  }}
                >
                  {/* Crystal image */}
                  <img 
                    src={ore.crystalImage}
                    alt="Crystal"
                    className="w-full h-full object-contain"
                    style={{
                      filter: isSelected 
                        ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) brightness(1.2)' 
                        : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'
                    }}
                  />

                  {/* Checkmark when selected */}
                  {isSelected && (
                    <div 
                      className="absolute -top-2 -right-2 rounded-full flex items-center justify-center animate-pulse"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)',
                        border: '3px solid #8b6914',
                        boxShadow: '0 4px 12px rgba(218, 165, 32, 0.6)'
                      }}
                    >
                      <Check size={24} color="#3d2817" strokeWidth={4} />
                    </div>
                  )}

                  {/* Hover tooltip */}
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  >
                    <div 
                      className="px-4 py-3 rounded-lg shadow-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 250, 235, 0.98) 0%, rgba(245, 222, 179, 0.98) 100%)',
                        border: '3px solid #8b6914',
                        minWidth: '200px',
                        maxWidth: '280px',
                        whiteSpace: 'normal',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Cinzel', serif",
                          color: '#3d2817',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          lineHeight: '1.4'
                        }}
                      >
                        {ore.content}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Label below crystal */}
                <div 
                  className="mt-4 text-center"
                  style={{
                    maxWidth: '150px'
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: '#8b6914',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '4px'
                    }}
                  >
                    {ore.date}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: '#3d2817',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {ore.content.length > 20 ? ore.content.substring(0, 20) + '...' : ore.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* REFINE button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            onClick={handleRefine}
            disabled={selectedOres.size === 0}
            className="px-16 py-4 rounded-2xl hover:scale-105 transition-all disabled:cursor-not-allowed"
            style={{
              background: selectedOres.size > 0
                ? 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)'
                : 'linear-gradient(135deg, rgba(160, 160, 160, 0.8) 0%, rgba(120, 120, 120, 0.8) 100%)',
              border: selectedOres.size > 0 ? '4px solid #8b6914' : '4px solid #666',
              boxShadow: selectedOres.size > 0
                ? '0 6px 20px rgba(218, 165, 32, 0.6), inset 0 2px 0 rgba(255, 255, 255, 0.4)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              opacity: selectedOres.size > 0 ? 1 : 0.6
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                color: selectedOres.size > 0 ? '#3d2817' : '#666',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '3px',
                textShadow: selectedOres.size > 0 
                  ? '0 1px 2px rgba(255, 255, 255, 0.5)' 
                  : 'none'
              }}
            >
              REFINE ({selectedOres.size}/{ores.length})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
