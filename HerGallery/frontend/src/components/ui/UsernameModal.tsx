import { useState } from 'react';
import { useSetUsername } from '@/hooks/useContract';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUsernameSet?: () => void;
}

const UsernameModal = ({ isOpen, onClose, onUsernameSet }: Props) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUsername: setUsernameFn } = useSetUsername(() => {
    toast.success('昵称设置成功！');
    setUsername('');
    setIsSubmitting(false);
    onUsernameSet?.();
    onClose();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim();
    if (!trimmed) {
      toast.error('昵称不能为空');
      return;
    }
    if (trimmed.length > 20) {
      toast.error('昵称最多20个字符');
      return;
    }

    setIsSubmitting(true);

    try {
      await setUsernameFn(trimmed);
    } catch (err: any) {
      toast.error(err.message || '设置失败，请重试');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl"
      >
        <h2 className="text-xl font-bold text-foreground mb-2">设置昵称</h2>
        <p className="text-sm text-muted-foreground mb-4">
          设置一个1-20字符的昵称，替代钱包地址显示
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.slice(0, 20))}
            placeholder="输入昵称..."
            maxLength={20}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="mt-1 text-xs text-muted-foreground text-right">
            {username.length}/20
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '设置中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
