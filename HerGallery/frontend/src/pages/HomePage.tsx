import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import ExhibitionList from '@/components/Exhibition/ExhibitionList';
import { useExhibitions, parseExhibitions } from '@/hooks/useContract';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const { data: rawExhibitions, isLoading, error } = useExhibitions();

  const exhibitions = parseExhibitions(rawExhibitions);

  return (
    <Layout>
      <div className="gallery-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="text-primary">✿</span> 她的展厅
          </h1>
          <p className="mt-3 text-muted-foreground">
            记录、创作、推荐 — 链上属于她们的艺术空间
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-destructive">加载失败，请检查网络和钱包连接</p>
          </div>
        )}

        {!isLoading && !error && <ExhibitionList exhibitions={exhibitions} />}
      </div>
    </Layout>
  );
};

export default HomePage;
