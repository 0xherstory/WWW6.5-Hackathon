import { PlantDTO } from '@/services/api';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';

interface PlantCardProps {
  plant: PlantDTO;
  index: number;
  onClick: () => void;
}

const PlantCard = ({ plant, index, onClick }: PlantCardProps) => {
  const plantEmojis = ['🌳', '🌸', '🌹', '🌿', '🌻', '🍀', '🌴', '🌺'];
  const emoji = plantEmojis[index % plantEmojis.length];
  const dateStr = plant.createdAt?.split('T')[0] || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300"
      style={{ boxShadow: 'var(--shadow-card)' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
    >
      {plant.imageUrl ? (
        <div className="aspect-square overflow-hidden">
          <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-square bg-secondary/50 flex items-center justify-center text-6xl">
          {emoji}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-lg">{plant.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs font-body mb-1 mt-1">
          <MapPin className="w-3 h-3" />
          <span>{plant.location}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs font-body">
          <Calendar className="w-3 h-3" />
          <span>铸造于 {dateStr}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {plant.mine && (
            <span className="text-xs font-body bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              我的
            </span>
          )}
          {plant.tokenId > 0 && (
            <span className="text-xs font-body bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Token #{plant.tokenId}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PlantCard;
