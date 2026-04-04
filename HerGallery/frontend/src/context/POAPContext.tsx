import { createContext, useCallback, useContext, useState } from 'react';

export type POAPType = 'firstSubmission' | 'firstExhibition' | 'milestone';

export interface POAPPayload {
  type: POAPType;
  submissionTitle?: string;
  recommendCount?: number;
}

interface POAPContextValue {
  triggerFirstSubmission: () => void;
  triggerFirstExhibition: () => void;
  triggerMilestone: (submissionTitle: string, recommendCount: number) => void;
}

const POAPContext = createContext<POAPContextValue | null>(null);

export function usePOAP() {
  const ctx = useContext(POAPContext);
  if (!ctx) throw new Error('usePOAP must be used inside POAPProvider');
  return ctx;
}

interface Props {
  children: React.ReactNode;
}

export function POAPProvider({ children }: Props) {
  const [queue, setQueue] = useState<POAPPayload[]>([]);

  const enqueue = useCallback((payload: POAPPayload) => {
    setQueue((q) => [...q, payload]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  const current = queue[0] ?? null;

  const triggerFirstSubmission = useCallback(() => {
    enqueue({ type: 'firstSubmission' });
  }, [enqueue]);

  const triggerFirstExhibition = useCallback(() => {
    enqueue({ type: 'firstExhibition' });
  }, [enqueue]);

  const triggerMilestone = useCallback((submissionTitle: string, recommendCount: number) => {
    enqueue({ type: 'milestone', submissionTitle, recommendCount });
  }, [enqueue]);

  return (
    <POAPContext.Provider value={{ triggerFirstSubmission, triggerFirstExhibition, triggerMilestone }}>
      {children}
      {current && <POAPModal payload={current} onClose={dismiss} />}
    </POAPContext.Provider>
  );
}

// ── inline modal (avoids a circular import) ──────────────────────────────────

import { motion, AnimatePresence } from 'framer-motion';

const BADGE_CONFIG: Record<POAPType, { icon: string; title: string; color: string; bg: string; ring: string }> = {
  firstSubmission: {
    icon: '🌸',
    title: '首投徽章解锁！',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    ring: 'ring-violet-300/60',
  },
  firstExhibition: {
    icon: '🏛️',
    title: '首个展厅诞生！',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    ring: 'ring-rose-300/60',
  },
  milestone: {
    icon: '✦',
    title: '推荐里程碑达成！',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
    ring: 'ring-purple-300/60',
  },
};

function POAPModal({ payload, onClose }: { payload: POAPPayload; onClose: () => void }) {
  const cfg = BADGE_CONFIG[payload.type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-sm rounded-3xl bg-card border border-border p-8 shadow-2xl text-center"
        >
          {/* Sparkle ring */}
          <div className="relative mb-6 inline-flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className={`flex h-24 w-24 items-center justify-center rounded-full border-2 ring-4 ${cfg.ring} ${cfg.bg} text-5xl`}
            >
              {cfg.icon}
            </motion.div>
            {/* ring pulse */}
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className={`absolute h-24 w-24 rounded-full border-2 ring-4 ${cfg.ring} ${cfg.bg}`}
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            POAP 徽章
          </p>
          <h2 className={`text-2xl font-bold mb-3 ${cfg.color}`}>{cfg.title}</h2>

          {payload.type === 'firstSubmission' && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              你完成了第一次投稿！这份记录已永久上链，无法删除。
            </p>
          )}
          {payload.type === 'firstExhibition' && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              你创建了第一个展厅！这是属于你的记录空间，永久留存于链上。
            </p>
          )}
          {payload.type === 'milestone' && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              「{payload.submissionTitle}」已获得 {payload.recommendCount} 次推荐，里程碑徽章已解锁。
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
          >
            收下徽章 ✦
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
