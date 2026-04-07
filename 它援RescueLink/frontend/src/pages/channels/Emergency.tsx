import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockCases } from '@/data/mockData';
import CaseCard from '@/components/CaseCard';
import { ArrowLeft } from 'lucide-react';

const Emergency = () => {
  const navigate = useNavigate();
  const urgent = mockCases.filter((c) => c.isUrgent);

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">🚨 紧急救助</span>
      </div>
      <div className="px-4 pb-6">
        {urgent.length ? urgent.map((c) => <CaseCard key={c.id} caseItem={c} />) : (
          <p className="mt-10 text-center text-sm text-muted-foreground">暂无紧急个案</p>
        )}
      </div>
    </MobileLayout>
  );
};

export default Emergency;
