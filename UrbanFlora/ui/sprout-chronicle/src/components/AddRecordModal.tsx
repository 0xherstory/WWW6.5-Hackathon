import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { createRecord, uploadImage, RecordDTO } from '@/services/api';

interface AddRecordModalProps {
  isOpen: boolean;
  plantId: number;
  onClose: () => void;
  onAdd: (record: RecordDTO) => void;
}

const STAGES = ['发芽', '生长', '开花', '结果', '枯萎', '其他'];

const AddRecordModal = ({ isOpen, plantId, onClose, onAdd }: AddRecordModalProps) => {
  const { address } = useWallet();
  const [stage, setStage] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !address) return;

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(address, imageFile);
      }

      await createRecord(address, {
        plantId: plantId.toString(),
        stage,
        description,
        ...(imageUrl ? { imageUrl } : {}),
      } as any);

      onAdd({
        id: Date.now(),
        plantId,
        stage: stage || null,
        description,
        imageUrl,
        createdAt: new Date().toISOString(),
      });

      setStage('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (err) {
      console.error('添加记录失败:', err);
      alert('添加失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 w-full max-w-md"
            style={{ boxShadow: 'var(--shadow-hover)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">添加观察记录</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-2">生长阶段</label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStage(stage === s ? '' : s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
                        stage === s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1">观察描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="记录你观察到的变化..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1">拍照记录（可选）</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="预览" className="w-full h-32 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-foreground/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-background" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground font-body">点击上传照片</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting || !description}
                className="w-full py-3 rounded-xl text-primary-foreground font-body font-semibold text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient-leaf)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '📝 添加记录'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddRecordModal;
