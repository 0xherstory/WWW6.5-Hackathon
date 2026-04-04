import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LogOut, Leaf, Loader2 } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { fetchPlants, PlantDTO } from '@/services/api';
import PlantCard from '@/components/PlantCard';
import PlantTimeline from '@/components/PlantTimeline';
import AddPlantModal from '@/components/AddPlantModal';

const Garden = () => {
  const { address, disconnect } = useWallet();
  const [plants, setPlants] = useState<PlantDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<PlantDTO | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetchPlants(address)
      .then(setPlants)
      .catch((err) => console.error('获取植物列表失败:', err))
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) return <Navigate to="/" replace />;

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleAddPlant = () => {
    handleRefresh();
  };

  const handleRefresh = () => {
    if (!address) return;
    fetchPlants(address).then(setPlants).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">植物观察</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-body bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              {shortAddress}
            </span>
            <button
              onClick={disconnect}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="断开连接"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {selectedPlant ? (
          <PlantTimeline plant={selectedPlant} onBack={() => setSelectedPlant(null)} />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">我的花园 🌿</h1>
              <p className="text-muted-foreground font-body text-sm">
                共 {plants.length} 株植物 NFT
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {plants.map((plant, i) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    index={i}
                    onClick={() => setSelectedPlant(plant)}
                  />
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: plants.length * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setShowAddModal(true)}
                  className="bg-card rounded-2xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[300px]"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-body text-sm text-muted-foreground">记录新植物</span>
                </motion.div>
              </div>
            )}
          </>
        )}
      </main>

      <AddPlantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlant}
      />
    </div>
  );
};

export default Garden;
