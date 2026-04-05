import { useNavigate } from 'react-router-dom';
import { CaseItem } from '@/data/mockData';
import { PawPrint, Flame } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import cat1 from '@/assets/cat1.jpg';
import dog1 from '@/assets/dog1.jpg';
import cat2 from '@/assets/cat2.jpg';
import dog2 from '@/assets/dog2.jpg';
import dog3 from '@/assets/dog3.jpg';

const caseImages: Record<string, string> = { '1': cat1, '2': dog1, '3': cat2, '4': dog2, '5': dog3 };
const caseNumbers: Record<string, number> = { '1': 241, '2': 242, '3': 243, '4': 244, '5': 245 };

const PawClapAnimation = ({ onDone }: { onDone: () => void }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none" onAnimationEnd={onDone}>
    <div className="animate-paw-clap flex flex-col items-center">
      <div className="flex items-center gap-1">
        <span className="text-4xl animate-paw-left">🐾</span>
        <span className="text-4xl animate-paw-right">🐾</span>
      </div>
      <span className="mt-1 text-[15px] font-bold text-primary animate-fade-in">热力 +1</span>
    </div>
  </div>
);

const CaseCard = ({ caseItem }: { caseItem: CaseItem }) => {
  const navigate = useNavigate();
  const [showPawClap, setShowPawClap] = useState(false);
  const [localHeat, setLocalHeat] = useState(caseItem.heatValue);
  const [todayBoosts, setTodayBoosts] = useState(0);
  const imgSrc = caseItem.image || caseImages[caseItem.id] || cat1;
  const extra = (caseItem as any)._extra;
  const caseNo = extra?.caseNo || caseNumbers[caseItem.id] || parseInt(caseItem.id) || 0;
  const formattedNo = String(caseNo).padStart(5, '0');

  const needTag = caseItem.needs
    .filter((n) => !n.fulfilled && n.category === 'help')
    .map((n) => n.name)[0];

  const handleBoost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todayBoosts >= 5) {
      toast('明天再来帮它顶一顶吧～', { duration: 2000 });
      return;
    }
    setTodayBoosts(prev => prev + 1);
    setLocalHeat(prev => prev + 1);
    setShowPawClap(true);
  };

  return (
    <>
      {showPawClap && <PawClapAnimation onDone={() => setShowPawClap(false)} />}
      <div className="mb-3 overflow-hidden rounded-2xl bg-card shadow-sm">
        <button
          onClick={() => navigate(`/case/${caseItem.id}`)}
          className="flex w-full text-left transition-transform active:scale-[0.99]"
        >
          {/* Cover image */}
          <div className="relative w-[32%] shrink-0 overflow-hidden">
            <img src={imgSrc} alt={caseItem.title} loading="lazy" className="h-full w-full object-cover" style={{ minHeight: '120px' }} />
          </div>

          {/* Info */}
          <div className="flex w-[68%] flex-col justify-between p-3">
            {/* Line 1: Case # + Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">#{formattedNo}</span>
              {caseItem.urgencyLevel === '紧急' && (
                <span className="rounded-md bg-urgent px-1.5 py-0.5 text-[11px] font-bold text-urgent-foreground">紧急</span>
              )}
              {caseItem.urgencyLevel === '较急' && (
                <span className="rounded-md bg-[hsl(35,80%,90%)] px-1.5 py-0.5 text-[11px] font-bold text-[hsl(30,70%,35%)]">较急</span>
              )}
              <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">{caseItem.status}</span>
            </div>

            {/* Line 2: Title */}
            <h3 className="mt-1.5 line-clamp-1 text-[15px] font-bold leading-snug text-foreground">{caseItem.title}</h3>

            {/* Line 3: One need tag or short desc */}
            {needTag ? (
              <p className="mt-1 text-[12px] font-medium text-[hsl(24,65%,42%)]">需要：{needTag}</p>
            ) : (
              <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">{caseItem.description.slice(0, 30)}</p>
            )}

            {/* Line 4: Location + time + boost */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{caseItem.city}</span>
                {caseItem.distance && (
                  <>
                    <span>·</span>
                    <span>{caseItem.distance}</span>
                  </>
                )}
                <span>·</span>
                <span>{caseItem.updatedAt}</span>
              </div>
              <button
                onClick={handleBoost}
                className="shrink-0 flex items-center gap-0.5 text-[11px] text-muted-foreground transition-transform active:scale-90"
              >
                <PawPrint className="h-5 w-5 text-[hsl(24,65%,45%)]" strokeWidth={2.5} />
                <Flame className="h-3 w-3 text-[hsl(24,80%,55%)]" />
                <span className="font-medium text-[hsl(24,60%,40%)]">{localHeat}</span>
              </button>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default CaseCard;
