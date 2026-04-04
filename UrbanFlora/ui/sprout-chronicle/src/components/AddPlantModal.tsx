import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { BrowserProvider, Contract } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';
import { uploadImage, createPlant } from '@/services/api';
import { PLANT_NFT_ADDRESS, PLANT_NFT_ABI } from '@/contracts/PlantNFT';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const AddPlantModal = ({ isOpen, onClose, onAdd }: AddPlantModalProps) => {
  const { address } = useWallet();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !address || !imageFile) return;

    setSubmitting(true);
    try {
      // 1. 上传图片
      setStatusText('正在上传图片...');
      const imageUrl = await uploadImage(address, imageFile);

      // 2. 调用合约铸造 NFT
      setStatusText('正在铸造 NFT，请在钱包中确认...');
      const eth = (window as any).ethereum;
      if (!eth) throw new Error('请安装 MetaMask');
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const contract = new Contract(PLANT_NFT_ADDRESS, PLANT_NFT_ABI, signer);
      const tx = await contract.createPlant(name, location, imageUrl);
      const receipt = await tx.wait();

      // 从事件或返回值中获取 tokenId
      let tokenId = '0';
      if (receipt.logs && receipt.logs.length > 0) {
        // ERC721 Transfer 事件的第三个 topic 就是 tokenId
        const transferLog = receipt.logs.find(
          (log: any) => log.topics && log.topics.length >= 4
        );
        if (transferLog) {
          tokenId = BigInt(transferLog.topics[3]).toString();
        }
      }

      // 3. 调用后端创建植物
      setStatusText('正在保存植物数据...');
      await createPlant(address, { tokenId, name, location, imageUrl });

      // 4. 通知父组件刷新列表
      onAdd();

      // 重置
      setName('');
      setLocation('');
      setImageFile(null);
      setImagePreview('');
      setStatusText('');
      onClose();
    } catch (err: any) {
      console.error('创建植物失败:', err);
      alert(err?.reason || err?.message || '创建失败，请重试');
    } finally {
      setSubmitting(false);
      setStatusText('');
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
              <h2 className="font-display text-xl font-bold text-foreground">记录新植物</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1">植物名称</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：蓝花楹"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1">发现地点</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="如：成都市天府三街"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-foreground mb-1">植物照片</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="预览" className="w-full h-40 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-foreground/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-background" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground font-body">点击上传照片</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              {statusText && (
                <p className="text-xs text-muted-foreground font-body text-center">{statusText}</p>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting || !name || !location || !imageFile}
                className="w-full py-3 rounded-xl text-primary-foreground font-body font-semibold text-sm mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'var(--gradient-leaf)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {statusText || '处理中...'}
                  </>
                ) : (
                  '🌱 铸造植物 NFT'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPlantModal;
