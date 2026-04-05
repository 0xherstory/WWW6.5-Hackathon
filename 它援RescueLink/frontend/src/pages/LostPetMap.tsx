import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { mockLostPets, mockClues, mockSpottedPets } from '@/data/mockData';
import { ArrowLeft, MapPin, Camera, Clock, CheckCircle2, XCircle, HelpCircle, List, Map as MapIcon, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  '待确认': 'bg-accent/20 text-accent-foreground',
  '已采纳': 'bg-primary/10 text-primary',
  '已排除': 'bg-muted text-muted-foreground',
  '待认领': 'bg-[hsl(24,80%,92%)] text-primary',
  '已匹配': 'bg-primary/10 text-primary',
  '已关闭': 'bg-muted text-muted-foreground',
};

const statusIcons: Record<string, React.ReactNode> = {
  '待确认': <HelpCircle className="h-3 w-3" />,
  '已采纳': <CheckCircle2 className="h-3 w-3" />,
  '已排除': <XCircle className="h-3 w-3" />,
};

type TabMode = 'spotted' | 'reward';

const LostPetMap = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [tab, setTab] = useState<TabMode>('reward');
  const [selectedPet, setSelectedPet] = useState(mockLostPets[0]);
  const [showSubmitSpotted, setShowSubmitSpotted] = useState(false);

  const petClues = mockClues.filter((c) => c.petId === selectedPet.id);

  const handleSubmitSpotted = () => {
    setShowSubmitSpotted(false);
    toast.success('信息已提交，感谢你的帮助！');
  };

  return (
    <MobileLayout hideTabBar>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">🗺️ 寻宠地图</span>
        <div className="flex gap-1 rounded-lg bg-muted p-0.5">
          <button onClick={() => setView('map')} className={`rounded-md px-2 py-1 ${view === 'map' ? 'bg-card shadow-sm' : ''}`}>
            <MapIcon className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setView('list')} className={`rounded-md px-2 py-1 ${view === 'list' ? 'bg-card shadow-sm' : ''}`}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-0 border-b border-border px-4">
        <button
          onClick={() => setTab('reward')}
          className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
            tab === 'reward' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
          }`}
        >
          <Search className="mr-1 inline h-3.5 w-3.5" />
          悬赏寻宠
        </button>
        <button
          onClick={() => setTab('spotted')}
          className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
            tab === 'spotted' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
          }`}
        >
          <Eye className="mr-1 inline h-3.5 w-3.5" />
          疑似走失上报
        </button>
      </div>

      {tab === 'reward' ? (
        /* =================== 悬赏寻宠 Tab =================== */
        <>
          {/* Pet Selector */}
          <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
            {mockLostPets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors ${
                  selectedPet.id === pet.id
                    ? 'bg-primary/15 font-semibold text-primary ring-1 ring-primary/30'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span>🐶</span>
                {pet.name}
              </button>
            ))}
          </div>

          {/* Pet Info */}
          <div className="mx-4 rounded-xl bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐶</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedPet.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedPet.features}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded bg-urgent/10 px-2 py-0.5 text-[10px] font-medium text-urgent">走失中</span>
                {selectedPet.reward && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">悬赏 {selectedPet.reward}</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedPet.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedPet.lostDate}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{selectedPet.contact}</p>
          </div>

          {view === 'map' && (
            <div className="relative mx-4 mt-3 overflow-hidden rounded-xl">
              <div className="relative h-[280px] bg-gradient-to-b from-primary/5 to-accent/10">
                <div className="absolute inset-0 opacity-20">
                  {[...Array(8)].map((_, i) => (
                    <div key={`h${i}`} className="absolute left-0 right-0 border-t border-muted-foreground/20" style={{ top: `${(i + 1) * 12.5}%` }} />
                  ))}
                  {[...Array(6)].map((_, i) => (
                    <div key={`v${i}`} className="absolute bottom-0 top-0 border-l border-muted-foreground/20" style={{ left: `${(i + 1) * 16.6}%` }} />
                  ))}
                </div>
                <div className="absolute left-[30%] top-[60%] flex flex-col items-center">
                  <div className="h-5 w-5 rounded-full border-2 border-urgent bg-urgent/30 shadow-lg" />
                  <span className="mt-0.5 rounded bg-urgent/90 px-1.5 py-0.5 text-[9px] font-bold text-white">走失地点</span>
                </div>
                {petClues.map((clue, i) => {
                  const positions = [{ left: '45%', top: '40%' }, { left: '60%', top: '30%' }, { left: '55%', top: '55%' }];
                  const pos = positions[i % positions.length];
                  return (
                    <div key={clue.id} className="absolute flex flex-col items-center" style={pos}>
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md ${clue.status === '已采纳' ? 'border-primary bg-primary/20' : 'border-accent bg-accent/20'}`}>
                        <Camera className="h-3 w-3" />
                      </div>
                      <span className="mt-0.5 max-w-[80px] truncate rounded bg-card/90 px-1 py-0.5 text-[8px] text-muted-foreground shadow">
                        {clue.time.split(' ')[1]}
                      </span>
                    </div>
                  );
                })}
                <div className="absolute bottom-2 left-2 rounded bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
                  📍 {petClues.length} 条目击线索
                </div>
              </div>
            </div>
          )}

          {/* Clue List */}
          <div className="px-4 pb-24">
            <div className="mt-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-foreground">{view === 'map' ? '最新线索' : '全部线索'}</h3>
              <span className="text-[10px] text-muted-foreground">{petClues.length} 条</span>
            </div>
            <div className="mt-2 space-y-2">
              {petClues.map((clue) => (
                <div key={clue.id} className="rounded-xl bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{clue.submitter}</p>
                        <p className="text-[10px] text-muted-foreground">{clue.time}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[clue.status]}`}>
                      {statusIcons[clue.status]}
                      {clue.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {clue.location}
                  </div>
                  {clue.note && <p className="mt-1.5 text-[11px] text-foreground">{clue.note}</p>}
                  {clue.status === '已采纳' && (
                    <p className="mt-1 text-[10px] text-primary"><p className="mt-1 text-[10px] text-primary">✨ 线索被采纳，获得 {clue.points} 助力值</p></p>
                  )}
                </div>
              ))}
            </div>
            {petClues.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-2xl">🐾</p>
                <p className="mt-2 text-sm text-muted-foreground">暂无线索，快来帮忙上传吧</p>
              </div>
            )}
          </div>

          {/* Fixed bottom: submit clue for reward pet */}
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card p-3 safe-bottom">
            <button
              onClick={() => setShowSubmitSpotted(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
              我看到了，上传线索
            </button>
          </div>
        </>
      ) : (
        /* =================== 疑似走失上报 Tab =================== */
        <>
          <div className="px-4 pb-24">
            <p className="mt-3 text-xs text-muted-foreground">
              看到疑似走失的宠物？上报信息帮助主人找到它
            </p>

            {/* Spotted pet list */}
            <div className="mt-3 space-y-2">
              {mockSpottedPets.map((sp) => (
                <div key={sp.id} className="rounded-xl bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                        {sp.animalType === '猫' ? '🐱' : '🐶'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground">{sp.submitter}</p>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[sp.status]}`}>
                            {sp.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{sp.time}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[12px] text-foreground leading-relaxed">{sp.description}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {sp.location}
                  </div>
                </div>
              ))}
            </div>

            {mockSpottedPets.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-2xl">🐾</p>
                <p className="mt-2 text-sm text-muted-foreground">暂无上报信息</p>
              </div>
            )}
          </div>

          {/* Fixed bottom: report spotted pet */}
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card p-3 safe-bottom">
            <button
              onClick={() => setShowSubmitSpotted(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:bg-primary/90"
            >
              <Camera className="h-4 w-4" />
              上报疑似走失宠物
            </button>
          </div>
        </>
      )}

      {/* Submit Overlay */}
      {showSubmitSpotted && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowSubmitSpotted(false)}>
          <div className="w-full max-w-[430px] mx-auto rounded-t-2xl bg-card p-5 safe-bottom" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground">
              {tab === 'reward' ? '📸 上传线索' : '📸 上报疑似走失宠物'}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {tab === 'reward' ? '帮忙上传你看到的疑似走失宠物信息' : '看到疑似走失的宠物？上报信息帮助主人找到它'}
            </p>

            <div className="mt-4 flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Camera className="h-6 w-6" />
                <span className="text-[11px]">点击拍照或上传</span>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              <div>
                <label className="text-[11px] font-medium text-foreground">发现时间</label>
                <input type="text" placeholder="例如：今天下午3点左右" className="mt-1 w-full rounded-lg bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-foreground">发现地点</label>
                <input type="text" placeholder="尽量描述具体位置" className="mt-1 w-full rounded-lg bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground" />
              </div>
              {tab === 'spotted' && (
                <div>
                  <label className="text-[11px] font-medium text-foreground">动物类型</label>
                  <div className="mt-1 flex gap-2">
                    {['狗', '猫', '其他'].map(t => (
                      <button key={t} className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                        {t === '狗' ? '🐶' : t === '猫' ? '🐱' : '🐾'} {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="text-[11px] font-medium text-foreground">补充说明（可选）</label>
                <textarea placeholder="动物特征、移动方向等" className="mt-1 w-full rounded-lg bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground" rows={2} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-foreground">联系方式（可选）</label>
                <input type="text" placeholder="方便反馈确认" className="mt-1 w-full rounded-lg bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            <button
              onClick={handleSubmitSpotted}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:bg-primary/90"
            >
              提交
            </button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground"><p className="mt-2 text-center text-[10px] text-muted-foreground">提交有效线索可获得助力值奖励</p></p>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default LostPetMap;
