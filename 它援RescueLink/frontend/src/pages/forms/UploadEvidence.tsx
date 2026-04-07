import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, CheckCircle2, Upload, Shield, Wallet, Network, Loader2 } from 'lucide-react';
import { useBlockchain } from '@/hooks/use-blockchain';

const UploadEvidence = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [recordType, setRecordType] = useState('收到物资照片');
  const [note, setNote] = useState('');
  const { account, isCorrectNetwork, connect, switchNetwork, isConnecting } = useBlockchain();

  if (submitted) {
    return (
      <MobileLayout hideTabBar>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">上传成功！</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground"><p className="mt-2 text-center text-sm text-muted-foreground">凭证已提交，将在确认后获得助力值记录</p></p>
          {/* Chain placeholder */}
          <div className="mt-4 w-full rounded-xl border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">存证状态</span>
            </div>
            <div className="mt-2 space-y-1.5 text-[10px] text-muted-foreground">
              <p>存证编号：待生成</p>
              <p>存证时间：处理中</p>
              <p>Hash：待生成</p>
            </div>
          </div>
          <button onClick={() => navigate('/publish')} className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground">
            返回
          </button>
        </div>
      </MobileLayout>
    );
  }

  const types = ['收到物资照片', '医院单据', '服务完成记录', '阶段更新照片', '其他记录'];

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">更新记录 / 上传凭证</span>
      </div>
      <div className="px-4 pb-10">
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-foreground">记录类型</label>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setRecordType(t)}
                className={`rounded-lg px-3 py-2 text-xs ${recordType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-foreground">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="补充说明..."
            className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            rows={3}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-foreground">上传图片 / 文件</label>
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <span className="text-xs">点击或拖拽上传</span>
            </div>
          </div>
        </div>

        {/* Chain placeholder */}
        <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground">上传完成后，关键凭证将通过分布式存证技术进行记录</span>
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
            提交凭证
          </button>
        )}
      </div>
    </MobileLayout>
  );
};

export default UploadEvidence;
