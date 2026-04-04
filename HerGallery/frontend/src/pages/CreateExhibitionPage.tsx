import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Upload, X, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { toast } from 'sonner';
import { useCreateExhibition, useCreationFee, useHasCreatedExhibition } from '@/hooks/useContract';
import { uploadFileToIPFS } from '@/services/ipfs';
import { usePOAP } from '@/context/POAPContext';
import ReactMarkdown from 'react-markdown';

const CreateExhibitionPage = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { data: fee } = useCreationFee();
  const { triggerFirstExhibition } = usePOAP();
  const { data: hasCreatedExhibitionBefore } = useHasCreatedExhibition(address || '');
  const { createExhibition } = useCreateExhibition(() => {
    toast.success('展厅创建成功！');
    if (!hasCreatedExhibitionBefore) {
      triggerFirstExhibition();
    }
    navigate('/gallery');
  });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const AVAILABLE_TAGS = [
    '网络帖子',
    '维权',
    '消费',
    '公共安全',
    '12315',
    '母婴',
    '健康',
    '觉醒',
    '诗歌',
    '艺术',
    '天空',
    '景色',
    '历史',
    '母系',
    '自然',
    '女性联结',
    '云吃吃',
  ];

  const creationFee = fee ? Number(fee) / 1e18 : 0.001;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (!title.trim()) {
      toast.error('请输入展厅标题');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入主题介绍');
      return;
    }
    if (content.length > 5000) {
      toast.error('主题介绍不能超过 5000 字');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = selectedTags.slice(0, 3);
      let coverHash = '';

      setIsUploading(true);

      if (coverFile) {
        toast.info('正在上传封面到 IPFS...');
        try {
          coverHash = await uploadFileToIPFS(coverFile);
          toast.success('封面上传成功！');
        } catch (uploadErr: any) {
          toast.error('封面上传失败: ' + uploadErr.message);
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      await createExhibition({
        title: title.trim(),
        content: content.trim(),
        coverHash,
        tags,
      });
      toast.success('交易已发送，请等待确认...');
    } catch (err: any) {
      toast.error(err.message || '创建失败，请重试');
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="gallery-container max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            创建新展厅
          </h1>
          <div className="h-0.5 w-16 rounded-full bg-primary mb-8" />

          {/* Title */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              展厅标题 <span className="text-xs text-muted-foreground">({title.length}/50)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="给展厅起一个吸引人的名字"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Cover Upload */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">封面图片</label>
            {coverPreview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  onClick={removeCover}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/50 hover:bg-foreground/70 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('cover-input')?.click()}
                className="aspect-video rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all border-border bg-muted/30 hover:border-primary/30"
              >
                <input
                  id="cover-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-center text-muted-foreground">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">点击上传封面图片</span>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              标签 <span className="text-xs text-muted-foreground">最多 3 个</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isDisabled = !isSelected && selectedTags.length >= 3;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else if (selectedTags.length < 3) {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    disabled={isDisabled}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                主题介绍
                <span className={`ml-2 text-xs font-normal ${content.length > 5000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {content.length} / 5000 字
                </span>
              </label>
              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 transition-colors ${
                    !previewMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  编辑
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 transition-colors ${
                    previewMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  预览
                </button>
              </div>
            </div>

            {!previewMode ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="使用 Markdown 格式编写展厅主题介绍..."
                rows={10}
                className={`w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 transition-all resize-none font-mono ${
                  content.length > 5000
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    : 'border-input focus:border-primary focus:ring-primary/20'
                }`}
              />
            ) : (
              <div className="min-h-[240px] rounded-xl border border-border bg-card p-4 text-sm text-foreground leading-relaxed">
                {content ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="text-muted-foreground">暂无内容</span>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4 mb-6">
            <div>
              <p className="text-sm font-medium text-foreground">质押金额</p>
              <p className="text-xs text-muted-foreground">创建展厅需要质押 AVAX</p>
            </div>
            <span className="text-lg font-bold text-primary">{creationFee} AVAX</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isConnected}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            {!isConnected ? '请先连接钱包' : isSubmitting ? '确认中...' : `创建展厅 · 质押 ${creationFee} AVAX`}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateExhibitionPage;
