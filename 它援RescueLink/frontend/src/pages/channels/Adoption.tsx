import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockAdoptions } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';

const Adoption = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">💛 领养专区</span>
      </div>
      <div className="px-4 pb-6">
        {mockAdoptions.map((a) => (
          <div key={a.id} className="mb-3 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{a.type === '猫' ? '🐱' : '🐶'}</span>
              <span className="text-base font-semibold text-foreground">{a.name}</span>
              <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{a.status}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{a.age}</span><span>·</span><span>{a.gender}</span><span>·</span><span>{a.location}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{a.features}</p>
            <p className="mt-1 text-xs text-foreground">性格：{a.character}</p>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default Adoption;
