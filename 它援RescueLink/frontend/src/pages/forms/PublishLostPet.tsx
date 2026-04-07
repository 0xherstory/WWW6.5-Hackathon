import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, CheckCircle2, Upload, Wallet, Network, Loader2 } from 'lucide-react';
import { useBlockchain } from '@/hooks/use-blockchain';

const PublishLostPet = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ type: '猫', name: '', location: '', lostDate: '', features: '', contact: '' });
  const { account, isCorrectNetwork, connect, switchNetwork, isConnecting } = useBlockchain();

  if (submitted) {
    return (
      <MobileLayout hideTabBar>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">发布成功！</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">寻宠信息已发布，希望 {form.name} 早日回家</p>
          <div className="mt-6 w-full rounded-xl bg-card p-4 shadow-sm text-sm">
            <p><span className="text-muted-foreground">宠物名：</span>{form.name}</p>
            <p className="mt-1"><span className="text-muted-foreground">类型：</span>{form.type}</p>
            <p className="mt-1"><span className="text-muted-foreground">走失地点：</span>{form.location}</p>
            <p className="mt-1"><span className="text-muted-foreground">走失时间：</span>{form.lostDate}</p>
            <p className="mt-1"><span className="text-muted-foreground">特征：</span>{form.features}</p>
          </div>
          <button onClick={() => navigate('/publish')} className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground">返回</button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <span className="text-sm font-semibold">发布寻宠信息</span>
      </div>
      <div className="px-4 pb-10">
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">宠物类型</label>
            <div className="flex gap-2">
              {['猫', '狗', '其他'].map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })}
                  className={`rounded-lg px-4 py-2 text-sm ${form.type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >{t}</button>
              ))}
            </div>
          </div>
          <InputField label="宠物名" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="如：橘子" />
          <InputField label="走失地点" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="城市 + 具体位置" />
          <InputField label="走失时间" value={form.lostDate} onChange={(v) => setForm({ ...form, lostDate: v })} placeholder="如：2026-04-01" />
          <InputField label="特征描述" value={form.features} onChange={(v) => setForm({ ...form, features: v })} placeholder="毛色、体型、项圈等" />
          <InputField label="联系方式" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="微信号或手机号" />
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">上传照片</label>
            <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-xs">点击上传照片</span>
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
          <button onClick={() => { if (form.name && form.location) setSubmitted(true); }}
            className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground"
          >发布寻宠信息</button>
        )}
      </div>
    </MobileLayout>
  );
};

const InputField = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
);

export default PublishLostPet;
