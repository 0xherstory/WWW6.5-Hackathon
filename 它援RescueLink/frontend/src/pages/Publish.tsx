import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockCases } from '@/data/mockData';
import { ChevronRight, PlusCircle, Search } from 'lucide-react';

const caseNumbers: Record<string, number> = {
  '1': 241, '2': 242, '3': 243, '4': 244, '5': 245,
};

const Publish = () => {
  const navigate = useNavigate();

  // Simulate "my in-progress cases" — take first 2
  const myCases = mockCases.slice(0, 2);

  return (
    <MobileLayout>
      <div className="px-4 pt-10">
        <h1 className="text-lg font-bold text-foreground">救助中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">发起新的个案，或继续补充你正在处理的救助记录</p>
      </div>

      <div className="px-4 pb-6">
        {/* B. Main entry card */}
        <button
          onClick={() => navigate('/create-case')}
          className="mt-5 flex w-full items-center gap-4 rounded-2xl bg-primary/10 p-5 text-left ring-1 ring-primary/10 transition-transform active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground">发起新的救助个案</p>
            <p className="mt-0.5 text-xs text-muted-foreground">填写动物情况、当前需求和联系方式，生成可持续更新的个案页</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/40" />
        </button>

        {/* C. My in-progress cases */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">我的进行中个案</h2>
            <button className="text-xs font-medium text-primary">查看全部</button>
          </div>
          <div className="mt-2 space-y-2">
            {myCases.map((c) => {
              const caseNo = caseNumbers[c.id] || parseInt(c.id);
              const formattedNo = String(caseNo).padStart(5, '0');
              return (
                <div key={c.id} className="rounded-xl bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-muted-foreground">#{formattedNo}</span>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{c.status}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">最近更新：{c.updatedAt}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/case/${c.id}`)}
                      className="rounded-lg bg-muted px-3 py-1.5 text-[12px] font-medium text-foreground"
                    >
                      查看个案
                    </button>
                    <button
                      onClick={() => navigate('/add-record')}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary"
                    >
                      补充进展
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* D. Other publishing */}
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-foreground">其他发布</h2>
          <button
            onClick={() => navigate('/publish-lost-pet')}
            className="flex w-full items-center gap-4 rounded-xl bg-secondary p-4 text-left transition-transform active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-foreground/10">
              <Search className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">发布寻宠信息</p>
              <p className="mt-0.5 text-xs text-muted-foreground">宠物走失后，发布线索与联系方式</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Publish;
