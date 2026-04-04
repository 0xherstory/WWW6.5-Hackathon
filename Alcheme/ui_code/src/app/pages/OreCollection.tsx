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
  type: string;
  content: string;
  date: string;
  crystalImage: string;
}

export default function OreCollection() {
  const navigate = useNavigate();
  const [ores, setOres] = useState<OreItem[]>([]);
  const [selectedOres, setSelectedOres] = useState<Set<string>>(new Set());

  const crystalImages = [crystal1, crystal2, crystal3, crystal4, crystal5, crystal6, crystal7];

  useEffect(() => {
    const oresData = localStorage.getItem('collectedOres');
    if (oresData) {
      const loadedOres = JSON.parse(oresData);
      const oresWithImages = loadedOres.map((ore: any) => ({
        ...ore,
        crystalImage: crystalImages[Math.floor(Math.random() * crystalImages.length)]
      }));
      setOres(oresWithImages);
    }
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

  const handleRefine = () => {
    if (selectedOres.size > 0) {
      const selectedOresDetails = ores.filter(ore => selectedOres.has(ore.id));
      const remainingOres = ores.filter(ore => !selectedOres.has(ore.id));
      localStorage.setItem('collectedOres', JSON.stringify(remainingOres));
      window.dispatchEvent(new Event('oresUpdated'));
      navigate('/refine', { state: { 
        refiningCount: selectedOres.size,
        selectedOres: selectedOresDetails 
      } });
    }
  };

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        width: '1920px', height: '1080px', maxWidth: '1920px', maxHeight: '1080px',
        margin: '0 auto', fontFamily: "'Cormorant Garamond', serif"
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

      <div 
        className="relative z-10 w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl p-10 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '3px solid rgba(139, 105, 20, 0.4)',
        }}
      >
        <button
          onClick={() => navigate('/refine')}
          className="absolute top-6 right-6 hover:scale-110 transition-transform z-[60]"
          style={{
            background: 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)',
            border: '3px solid #8b6914',
            borderRadius: '50%', width: '50px', height: '50px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', cursor: 'pointer'
          }}
        >
          <X size={24} color="#3d2817" strokeWidth={3} />
        </button>

        <div className="text-center mb-6 flex-shrink-0">
          <h2 style={{ fontFamily: "'Cinzel', serif", color: '#3d2817', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '2px' }}>
            Ore Collection
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar" style={{ marginBottom: '100px' }}>
          {/* 恢复：5列布局，减小间距让布局变紧凑 */}
          <div className="grid grid-cols-5 gap-x-4 gap-y-10 py-6 justify-items-center">
            {ores.map((ore, idx) => {
              const isSelected = selectedOres.has(ore.id);
              // 关键修复：判断是否为第5列 (5, 10, 15...)
              const isLastInRow = (idx + 1) % 5 === 0;

              return (
                <div key={ore.id} className="relative group flex flex-col items-center z-10 hover:z-[100]">
                  <button
                    onClick={() => toggleOreSelection(ore.id)}
                    className="relative hover:scale-110 transition-transform cursor-pointer"
                    style={{ width: '130px', height: '130px' }}
                  >
                    <img 
                      src={ore.crystalImage} alt="Crystal" className="w-full h-full object-contain"
                      style={{ filter: isSelected ? 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))' : 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))' }}
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 rounded-full flex items-center justify-center bg-[#8b6914] w-8 h-8 shadow-md border-2 border-white">
                        <Check size={18} color="white" strokeWidth={4} />
                      </div>
                    )}
                  </button>

                  {/* 浮窗：最后一列向左，其他向右 */}
                  <div 
                    className={`absolute ${isLastInRow ? 'right-[90%]' : 'left-[90%]'} top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                    style={{ zIndex: 200, minWidth: '260px', maxWidth: '350px' }}
                  >
                    <div className="px-5 py-4 rounded-xl shadow-2xl border-2 border-[#8b6914]" style={{ background: 'linear-gradient(135deg, #fdfaf2 0%, #f5e6d3 100%)', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)' }}>
                      <div style={{ fontFamily: "'Cinzel', serif", color: '#8b6914', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px', borderBottom: '1px solid rgba(139, 105, 20, 0.1)' }}>
                        {ore.date}
                      </div>
                      <div style={{ fontFamily: "'Cinzel', serif", color: '#3d2817', fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {ore.content}
                      </div>
                    </div>
                  </div>

                  {/* 标签文字：恢复紧凑布局 */}
                  <div className="text-center" style={{ maxWidth: '130px', marginTop: '-15px' }}>
                    <div style={{ fontFamily: "'Cinzel', serif", color: '#8b6914', fontSize: '0.7rem', fontWeight: 600 }}>{ore.date}</div>
                    <div className="w-full truncate" style={{ fontFamily: "'Cinzel', serif", color: '#3d2817', fontSize: '0.8rem', fontWeight: 500 }}>
                      {ore.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleRefine}
            disabled={selectedOres.size === 0}
            className="px-14 py-4 rounded-xl hover:scale-105 transition-all shadow-xl font-['Cinzel'] font-bold text-xl tracking-[3px]"
            style={{
              background: selectedOres.size > 0 ? 'linear-gradient(135deg, #f4d03f 0%, #daa520 100%)' : '#ccc',
              border: '3px solid #8b6914', color: '#3d2817', opacity: selectedOres.size > 0 ? 1 : 0.6
            }}
          >
            REFINE ({selectedOres.size}/{ores.length})
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 105, 20, 0.4); border-radius: 10px; }
      `}</style>
    </div>
  );
}