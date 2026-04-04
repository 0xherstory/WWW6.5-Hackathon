import { useEffect, useState } from 'react';
import { PlantDTO, RecordDTO, fetchRecords } from '@/services/api';
import { useWallet } from '@/contexts/WalletContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2, Plus } from 'lucide-react';
import AddRecordModal from '@/components/AddRecordModal';

interface PlantTimelineProps {
  plant: PlantDTO;
  onBack: () => void;
}

const PlantTimeline = ({ plant, onBack }: PlantTimelineProps) => {
  const { address } = useWallet();
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetchRecords(address, plant.id)
      .then(setRecords)
      .catch((err) => console.error('获取记录失败:', err))
      .finally(() => setLoading(false));
  }, [address, plant.id]);

  const plantEmojis = ['🌳', '🌸', '🌹', '🌿', '🌻', '🍀'];
  const idx = plant.id - 1;
  const emoji = plantEmojis[idx % plantEmojis.length];
  const dateStr = plant.createdAt?.split('T')[0] || '';

  const handleAddRecord = (record: RecordDTO) => {
    setRecords((prev) => [...prev, record]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回我的花园
      </button>

      <div className="bg-card rounded-2xl p-6 mb-8" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start gap-4">
          {plant.imageUrl ? (
            <img src={plant.imageUrl} alt={plant.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-secondary/50 flex items-center justify-center text-4xl shrink-0">
              {emoji}
            </div>
          )}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{plant.name}</h2>
            <p className="text-muted-foreground font-body text-sm mt-1">📍 {plant.location}</p>
            <p className="text-muted-foreground font-body text-xs mt-1">创建于 {dateStr}</p>
            {plant.tokenId > 0 && (
              <p className="text-muted-foreground font-body text-xs mt-1">Token #{plant.tokenId}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-semibold text-foreground">成长时间线</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddRecord(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-primary-foreground font-body text-sm font-medium"
          style={{ background: 'var(--gradient-leaf)' }}
        >
          <Plus className="w-4 h-4" />
          添加记录
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-body text-sm mb-4">暂无观察记录</p>
          <button
            onClick={() => setShowAddRecord(true)}
            className="text-primary font-body text-sm font-medium hover:underline"
          >
            添加第一条记录 →
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {records.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="relative pl-12 pb-8 last:pb-0"
            >
              <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
              <div className="bg-card rounded-xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-body mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{entry.createdAt?.split('T')[0]}</span>
                  {entry.stage && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{entry.stage}</span>
                  )}
                </div>
                <p className="text-foreground font-body text-sm leading-relaxed">{entry.description}</p>
                {entry.imageUrl && (
                  <img src={entry.imageUrl} alt="" className="mt-3 rounded-lg max-h-48 object-cover" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddRecordModal
        isOpen={showAddRecord}
        plantId={plant.id}
        onClose={() => setShowAddRecord(false)}
        onAdd={handleAddRecord}
      />
    </motion.div>
  );
};

export default PlantTimeline;
