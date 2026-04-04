import { useState } from 'react';
import { useAccount } from 'wagmi';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToIPFS, uploadToIPFS } from '@/services/ipfs';

const CONTENT_TYPES = [
  { value: 'evidence', label: '存证', icon: '🧾' },
  { value: 'creation', label: '二创', icon: '🎨' },
] as const;

interface Props {
  exhibitionId: number;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: { contentType: string; contentHash: string; title: string; description: string }) => void;
  isLoading: boolean;
}

const SubmitModal = ({ exhibitionId, onClose, onSubmit, isLoading }: Props) => {
  const { isConnected } = useAccount();
  const [contentType, setContentType] = useState<'evidence' | 'creation'>('evidence');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!description.trim()) {
      toast.error('请输入说明');
      return;
    }
    if (!textContent.trim() && !imageFile && !link.trim()) {
      toast.error('请至少填写文字、上传图片或提供链接中的一项');
      return;
    }

    setIsUploading(true);
    toast.info('正在上传到 IPFS...');

    try {
      const imageHash = imageFile ? await uploadFileToIPFS(imageFile) : '';
      const payload = {
        type: contentType,
        text: textContent.trim() || undefined,
        imageHash: imageHash || undefined,
        link: link.trim() || undefined,
      };

      const finalContentHash = await uploadToIPFS(payload);

      toast.success('上传成功！');
      onSubmit({
        contentType,
        contentHash: finalContentHash,
        title: title.trim(),
        description: description.trim(),
      });
    } catch (uploadErr: any) {
      toast.error('上传失败: ' + uploadErr.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-foreground mb-6">分享你的作品</h2>

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setContentType(type.value)}
                className={`flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-medium transition-all ${
                  contentType === type.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              标题 <span className="text-xs text-muted-foreground">({title.length}/50)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="给你的作品起个名字"
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {contentType === 'evidence' ? '存证内容' : '创作内容'}
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder={contentType === 'evidence' ? '描述你要存证的内容...' : '写下你的创作文字或说明...'}
              rows={4}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">参考链接（选填）</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">上传图片（选填）</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/50 hover:bg-foreground/70 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById(`file-input-${exhibitionId}`)?.click()}
                className="h-48 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all border-border bg-muted/30 hover:border-primary/30"
              >
                <input
                  id={`file-input-${exhibitionId}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">点击上传图片</span>
                  <p className="text-xs mt-1 opacity-70">支持 PNG、JPG、GIF、WebP</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              说明 <span className="text-xs text-muted-foreground">({description.length}/200)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="简单描述一下你的作品..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isUploading || !isConnected}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {!isConnected ? '请先连接钱包' : isLoading || isUploading ? <><Loader2 className="w-4 h-4 animate-spin" />{isUploading ? '上传中...' : '提交中...'}</> : '提交投稿'}
          </button>
        </div>
      </div>
  );
};

export default SubmitModal;
