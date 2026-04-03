import { motion } from "framer-motion";

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent";

const PageSkeleton = () => (
  <div className="min-h-screen bg-background pt-14">
    {/* Navbar skeleton */}
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full bg-muted ${shimmer}`} />
          <div className={`w-20 h-4 rounded bg-muted hidden sm:block ${shimmer}`} />
        </div>
        <div className="flex items-center gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-10 h-3 rounded bg-muted ${shimmer}`} />
          ))}
          <div className={`w-6 h-6 rounded bg-muted ${shimmer}`} />
          <div className={`w-20 h-8 rounded-md bg-muted ${shimmer}`} />
        </div>
      </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Hero skeleton */}
      <div className="pt-8 pb-6 flex flex-col items-center gap-4">
        <div className={`w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-muted ${shimmer}`} />
        <div className={`w-72 h-4 rounded bg-muted ${shimmer}`} />
        <div className={`w-56 h-3 rounded bg-muted ${shimmer}`} />
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-16 h-px bg-muted" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        <div className="w-16 h-px bg-muted" />
      </div>

      {/* Why section skeleton */}
      <div className="py-6 space-y-4">
        <div className={`w-40 h-6 rounded bg-muted mx-auto ${shimmer}`} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-16 rounded-lg bg-muted ${shimmer}`} />
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-16 h-px bg-muted" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        <div className="w-16 h-px bg-muted" />
      </div>

      {/* Wallet skeleton */}
      <div className="py-6 flex justify-center">
        <div className={`w-full max-w-md h-40 rounded-xl bg-muted ${shimmer}`} />
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 py-4">
        <div className="w-16 h-px bg-muted" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
        <div className="w-16 h-px bg-muted" />
      </div>

      {/* Form + Query skeleton */}
      <div className="py-6 grid gap-6 md:grid-cols-2 max-w-md md:max-w-none mx-auto md:mx-0">
        <div className={`h-80 rounded-xl bg-muted ${shimmer}`} />
        <div className={`h-40 rounded-xl bg-muted ${shimmer}`} />
      </div>
    </div>
  </div>
);

const LoadingSkeleton = ({ onLoaded }: { onLoaded: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      onAnimationComplete={onLoaded}
      className="absolute inset-0 z-[100]"
    >
      <PageSkeleton />
    </motion.div>
  );
};

export default LoadingSkeleton;
