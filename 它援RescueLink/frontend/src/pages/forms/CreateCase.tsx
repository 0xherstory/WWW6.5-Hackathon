import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/MobileLayout';
import { ArrowLeft, CheckCircle2, Upload, X, Loader2 } from 'lucide-react';
import { publishCase, type PublishCaseInput } from '@/lib/publishCase';
import { toast } from 'sonner';
import { useBlockchain } from '@/hooks/use-blockchain';
import { Wallet, Network } from 'lucide-react';

const needTags = ['送医', '检查', '治疗', '药品', '临时寄养', '运输', '物资', '寻找领养', '其他'];

const CreateCase = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ caseId: string; caseNo: number; txHash: string } | null>(null);
  const { account, isCorrectNetwork, connect, switchNetwork, isConnecting } = useBlockchain();

  const [form, setForm] = useState({
    title: '',
    animalType: '猫' as '猫' | '狗' | '其他',
    urgency: '一般' as '一般' | '较急' | '紧急',
    location: '',
    city: '',
    situation: '',
    needTags: [] as string[],
    needNote: '',
    contact: '',
    contactVisibility: '公开显示',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const toggleNeedTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      needTags: prev.needTags.includes(tag)
        ? prev.needTags.filter((t) => t !== tag)
        : [...prev.needTags, tag],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = async () => {
    if (!form.title || !form.location) {
      toast.error('请填写标题和地点');
      return;
    }
    if (imageFiles.length === 0) {
      toast.error('请至少上传一张图片');
      return;
    }

    setPublishing(true);
    try {
      const input: PublishCaseInput = {
        ...form,
        imageFiles,
      };
      const res = await publishCase(input);
      setResult({
        caseId: res.caseItem.id,
        caseNo: res.caseNo,
        txHash: res.txHash,
      });
      toast.success('个案已发布并上链存证');
    } catch (err: any) {
      console.error('[publish]', err);
      toast.error(err.message || '发布失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  // ─── Success screen ───
  if (result) {
    const formattedNo = String(result.caseNo).padStart(5, '0');
    const shortTx = result.txHash.slice(0, 10) + '…' + result.txHash.slice(-6);
    return (
      <MobileLayout hideTabBar>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h2 className="mt-4 text-lg font-bold text-foreground">个案已发布</h2>
          <div className="mt-4 w-full rounded-xl bg-card p-4 shadow-sm text-sm space-y-1.5">
            <p><span className="text-muted-foreground">案号：</span>#{formattedNo}</p>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">链上存证：</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">已上链</span>
            </div>
            <p className="text-[11px] text-muted-foreground break-all">TxHash: {shortTx}</p>
            <p className="text-muted-foreground text-xs mt-1">你现在可以继续补充进展或上传第一份关键凭证</p>
          </div>
          <div className="mt-6 flex w-full flex-col gap-2">
            <button onClick={() => navigate(`/case/${result.caseId}`)} className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground">
              查看个案页
            </button>
            <button onClick={() => navigate('/add-record')} className="w-full rounded-xl bg-muted py-3 text-sm font-medium text-foreground">
              补充第一条进展
            </button>
            <button onClick={() => navigate('/')} className="w-full rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground">
              返回首页
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // ─── Form ───
  return (
    <MobileLayout hideTabBar>
      <div className="sticky top-0 z-40 flex items-center gap-3 bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <span className="text-sm font-semibold">发起救助</span>
          <p className="text-[11px] text-muted-foreground">先发布关键信息，后续可以继续补充进展和凭证</p>
        </div>
      </div>
      <div className="px-4 pb-10">
        {/* Module 1: Basic info */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">个案标题</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="用一句话说明当前救助情况"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <p className="mt-0.5 text-[11px] text-muted-foreground">例如：朝阳区受伤橘猫急需送医</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">动物类型</label>
            <div className="flex gap-2">
              {(['猫', '狗', '其他'] as const).map((t) => (
                <button key={t} onClick={() => setForm({ ...form, animalType: t })}
                  className={`rounded-lg px-4 py-2 text-sm ${form.animalType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">紧急程度</label>
            <div className="flex gap-2">
              {(['一般', '较急', '紧急'] as const).map((u) => (
                <button key={u} onClick={() => setForm({ ...form, urgency: u })}
                  className={`rounded-lg px-4 py-2 text-sm ${form.urgency === u ? (u === '紧急' ? 'bg-urgent text-urgent-foreground' : 'bg-primary text-primary-foreground') : 'bg-muted text-muted-foreground'}`}
                >{u}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Module 2: Location & situation */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">城市</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="例如：上海"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">发现地点</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="区域 + 更具体的位置"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">当前情况</label>
            <textarea value={form.situation} onChange={(e) => setForm({ ...form, situation: e.target.value })}
              placeholder="描述动物目前的状态、是否已临时安置、是否受伤、是否已送医等"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={5} />
          </div>
        </div>

        {/* Module 3: Needs */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">当前需要</label>
            <div className="flex flex-wrap gap-2">
              {needTags.map((tag) => (
                <button key={tag} onClick={() => toggleNeedTag(tag)}
                  className={`rounded-lg px-3 py-2 text-xs ${form.needTags.includes(tag) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >{tag}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">补充说明</label>
            <textarea value={form.needNote} onChange={(e) => setForm({ ...form, needNote: e.target.value })}
              placeholder="补充说明目前最缺什么、希望别人如何帮助你"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3} />
          </div>
        </div>

        {/* Module 4: Contact */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">联系方式</label>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="微信号或手机号"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">联系方式展示方式</label>
            <div className="flex gap-2">
              {['公开显示', '仅对已助力用户显示'].map((v) => (
                <button key={v} onClick={() => setForm({ ...form, contactVisibility: v })}
                  className={`rounded-lg px-3 py-2 text-xs ${form.contactVisibility === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >{v}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Module 5: Upload images */}
        <div className="mt-6">
          <label className="mb-1 block text-xs font-medium text-foreground">上传图片（1-3张）</label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={handleImageSelect} />
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 mb-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5">
                    <X className="h-3 w-3 text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5 text-[9px] text-white">封面</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {imageFiles.length < 3 && (
            <button onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-xs">点击上传图片，第一张将作为封面</span>
              </div>
            </button>
          )}
        </div>

        {/* Submit */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          发布后将生成可持续更新的个案页，并在 Avalanche Fuji 测试网上链存证
        </p>

        {!account ? (
          <button onClick={connect} disabled={isConnecting}
            className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {isConnecting ? '连接中…' : '连接钱包以发布'}
          </button>
        ) : !isCorrectNetwork ? (
          <button onClick={switchNetwork}
            className="mt-2 w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors active:bg-orange-600 flex items-center justify-center gap-2">
            <Network className="h-4 w-4" />
            切换至 Avalanche Fuji
          </button>
        ) : (
          <button onClick={handlePublish} disabled={publishing}
            className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
            {publishing && <Loader2 className="h-4 w-4 animate-spin" />}
            {publishing ? '发布中…' : '发布个案'}
          </button>
        )}
      </div>
    </MobileLayout>
  );
};

export default CreateCase;
