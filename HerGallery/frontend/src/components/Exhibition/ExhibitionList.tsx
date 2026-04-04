import { Exhibition } from '@/config/contract';
import ExhibitionCard from './ExhibitionCard';
import { Link } from 'react-router-dom';

interface Props {
  exhibitions: Exhibition[];
}

const ExhibitionList = ({ exhibitions }: Props) => {
  const visibleExhibitions = exhibitions.filter((exhibition) => !exhibition.flagged);

  if (visibleExhibitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">✿</span>
        <h2 className="text-xl font-semibold text-foreground mb-2">暂无展厅</h2>
        <p className="text-muted-foreground mb-6">成为第一个策展人，开启你的展览之旅</p>
        <Link
          to="/create"
          className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          创建展厅
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visibleExhibitions.map((exhibition, index) => (
        <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} />
      ))}
    </div>
  );
};

export default ExhibitionList;
