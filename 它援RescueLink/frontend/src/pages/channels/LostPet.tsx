import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockLostPets } from '@/data/mockData';
import { ArrowLeft, MapPin } from 'lucide-react';

const LostPet = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">🔍 寻宠信息</span>
      </div>
      <div className="px-4 pb-6">
        {mockLostPets.map((p) => (
          <div key={p.id} className="mb-3 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.type === '猫' ? '🐱' : '🐶'}</span>
              <span className="text-base font-semibold text-foreground">{p.name}</span>
              <span className="ml-auto rounded bg-urgent/10 px-2 py-0.5 text-xs text-urgent">已发布寻宠</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />{p.location}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">走失时间：{p.lostDate}</p>
            <p className="mt-1 text-xs text-foreground">特征：{p.features}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.contact}</p>
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

export default LostPet;
