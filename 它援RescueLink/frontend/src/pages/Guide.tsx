import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockGuides } from '@/data/mockData';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const Guide = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">📖 救助指南</span>
      </div>
      <div className="px-4 pb-6">
        <p className="mt-3 text-xs text-muted-foreground"><p className="mt-3 text-xs text-muted-foreground">学习救助知识，获得助力值</p></p>
        <div className="mt-4 space-y-3">
          {mockGuides.map((g) => (
            <button
              key={g.id}
              onClick={() => toast.success(`阅读完成，获得 ${g.points} 助力值！`)}
              className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{g.title}</p>
                <p className="text-xs text-muted-foreground">{g.summary}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground">{g.readTime}</span>
                  <span className="rounded-full bg-points/15 px-1.5 py-0.5 font-medium text-points">+{g.points}积分</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Guide;
