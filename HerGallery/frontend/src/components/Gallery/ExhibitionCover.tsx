import { useState, useEffect } from 'react';
import { Exhibition } from '@/config/contract';
import { getAllIPFSUrls } from '@/services/ipfs';

interface Props {
  exhibition: Exhibition;
}

const ExhibitionCover = ({ exhibition }: Props) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [currentGateway, setCurrentGateway] = useState(0);

  useEffect(() => {
    if (exhibition.coverHash) {
      const urls = getAllIPFSUrls(exhibition.coverHash);
      setCoverUrl(urls[0] || null);
    }
  }, [exhibition.coverHash]);

  const handleImageError = () => {
    if (exhibition.coverHash) {
      const urls = getAllIPFSUrls(exhibition.coverHash);
      if (currentGateway < urls.length - 1) {
        setCurrentGateway(prev => prev + 1);
        setCoverUrl(urls[currentGateway + 1]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto bg-gradient-to-b from-secondary/50 to-background">
      {coverUrl ? (
        <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl mb-6">
          <img
            src={coverUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{exhibition.title}</h2>
            <p className="text-sm opacity-80">从侧边栏选择作品开始参观</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mb-6 mx-auto">
            <span className="text-5xl opacity-30">✿</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{exhibition.title}</h2>
          <p className="text-muted-foreground text-sm">从侧边栏选择作品开始参观</p>
        </div>
      )}
    </div>
  );
};

export default ExhibitionCover;
