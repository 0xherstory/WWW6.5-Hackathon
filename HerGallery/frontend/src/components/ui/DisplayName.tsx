import { useUsername } from '@/hooks/useContract';
import { getDisplayName } from '@/lib/format';

interface Props {
  address: string;
  className?: string;
}

const DisplayName = ({ address, className = '' }: Props) => {
  const { data: username } = useUsername(address);

  return (
    <span className={className}>
      {getDisplayName(address, username)}
    </span>
  );
};

export default DisplayName;
