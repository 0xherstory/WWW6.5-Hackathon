import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, CheckCircle2, Upload, Shield, Link2, Wallet, Network, Loader2 } from 'lucide-react';
import { useBlockchain } from '@/hooks/use-blockchain';

const evidenceTypes = ['医院单据', '服务完成记录', '物资照片', '交接确认', '阶段照片', '其他'];
const relatedEvents = ['发现现场', '已完成基础安置', '已送至医院', '已完成首诊', '已完成交接', '其他'];

const AddRecord = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'progress' | 'evidence'>('progress');
  const [submitted, setSubmitted] = useState(false);
  const [evidenceSubmitted, setEvidenceSubmitted] = useState(false);
  const { account, isCorrectNetwork, connect, switchNetwork, isConnecting } = useBlockchain();

  // Progress form
  const [progressTitle, setProgressTitle] = useState('');
  const [progressDesc, setProgressDesc] = useState('');

  // Evidence form
  const [evidenceType, setEvidenceType] = useState('医院单据');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [relatedEvent, setRelatedEvent] = useState('');

  // Progress success
  if (submitted && activeTab === 'progress') {
    return (
      <MobileLayout hideTabBar>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">进展已发布</h2>
          <button onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground">
            返回个案页
          </button>
        </div>
      </MobileLayout>
    );
  }

  // Evidence success
  if (evidenceSubmitted && activeTab === 'evidence') {
    return (
      <MobileLayout hideTabBar>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-foreground">凭证已提交，链上存证成功</h2>
          <div className="mt-4 w-full rounded-xl bg-card p-4 shadow-sm text-sm space-y-1.5">
            <p><span className="text-muted-foreground">个案：</span>#00241</p>
            <p><span className="text-muted-foreground">凭证类型：</span>{evidenceType}</p>
            <p><span className="text-muted-foreground">对应事项：</span>{relatedEvent}</p>
            <p><span className="text-muted-foreground">提交时间：</span>15:05</p>
            <p><span className="text-muted-foreground">存证编号：</span>RC-240315-018</p>
            <p><span className="text-muted-foreground">交易哈希：</span><span className="text-primary">0x8f3a...21bc</span></p>
          </div>
          <div className="mt-6 flex w-full flex-col gap-2">
            <button onClick={() => navigate(-1)} className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground">
              查看个案记录
            </button>
            <button onClick={() => { setEvidenceSubmitted(false); setEvidenceNote(''); setRelatedEvent(''); }} className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-foreground">
              继续上传
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <span className="text-sm font-semibold">补充记录</span>
            <p className="text-[11px] text-muted-foreground">#00241 · 朝阳区受伤橘猫急需送医</p>
          </div>
        </div>
        {/* Tab switch */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === 'progress' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
          >
            进展更新
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === 'evidence' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
            }`}
          >
            关键凭证
          </button>
        </div>
      </div>

      <div className="px-4 pb-10">
        {activeTab === 'progress' ? (
          <>
            {/* Tab description */}
            <p className="mt-3 text-[12px] text-muted-foreground">用于补充近况与阶段变化，可附照片说明</p>

            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">更新标题</label>
                <input
                  value={progressTitle}
                  onChange={(e) => setProgressTitle(e.target.value)}
                  placeholder="这次更新发生了什么"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-0.5 text-[11px] text-muted-foreground">例如：已联系附近医院，准备送诊</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">更新说明</label>
                <textarea
                  value={progressDesc}
                  onChange={(e) => setProgressDesc(e.target.value)}
                  placeholder="补充说明目前进展、遇到的问题或下一步计划"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">上传图片（选填）</label>
                <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-7 w-7" />
                    <span className="text-xs">上传现场图、状态图或阶段照片</span>
                  </div>
                </div>
              </div>
            </div>
            {!account ? (
              <button onClick={connect} disabled={isConnecting}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {isConnecting ? '连接中…' : '连接钱包以发布'}
              </button>
            ) : !isCorrectNetwork ? (
              <button onClick={switchNetwork}
                className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors active:bg-orange-600 flex items-center justify-center gap-2">
                <Network className="h-4 w-4" />
                切换至 Avalanche Fuji
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
              >
                发布进展
              </button>
            )}
          </>
        ) : (
          <>
            {/* Tab description */}
            <p className="mt-3 text-[12px] text-muted-foreground">用于上传可证明关键事项的材料，提交后将生成存证记录</p>

            <div className="mt-3 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">凭证类型</label>
                <div className="flex flex-wrap gap-2">
                  {evidenceTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setEvidenceType(t)}
                      className={`rounded-lg px-3 py-2 text-xs ${evidenceType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Related event - required */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  对应事项 <span className="text-urgent">*</span>
                </label>
                <p className="mb-1.5 text-[11px] text-muted-foreground">请选择这份材料对应的进展</p>
                <div className="flex flex-wrap gap-2">
                  {relatedEvents.map((ev) => (
                    <button
                      key={ev}
                      onClick={() => setRelatedEvent(ev)}
                      className={`rounded-lg px-3 py-2 text-xs ${relatedEvent === ev ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                    >{ev}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">补充说明</label>
                <textarea
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="补充说明这份凭证对应的情况"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
                <p className="mt-0.5 text-[11px] text-muted-foreground">例如：首诊检查已完成，上传费用单据与诊断说明</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">上传图片 / 文件</label>
                <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-7 w-7" />
                    <span className="text-xs">上传单据、截图、证明照片或其他材料</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chain explanation */}
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  关键凭证提交后，将生成内容摘要并写入链上，用于记录该事实在该时间点被提交。原文件不会直接公开上链。
                </p>
              </div>
            </div>

            {!account ? (
              <button onClick={connect} disabled={isConnecting}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                {isConnecting ? '连接中…' : '连接钱包以发布'}
              </button>
            ) : !isCorrectNetwork ? (
              <button onClick={switchNetwork}
                className="mt-6 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors active:bg-orange-600 flex items-center justify-center gap-2">
                <Network className="h-4 w-4" />
                切换至 Avalanche Fuji
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!relatedEvent) {
                    return;
                  }
                  setEvidenceSubmitted(true);
                }}
                disabled={!relatedEvent}
                className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                提交并存证
              </button>
            )}
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default AddRecord;
