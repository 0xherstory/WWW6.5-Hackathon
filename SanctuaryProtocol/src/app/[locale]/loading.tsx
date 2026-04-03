export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background paper-texture">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="w-12 h-12 border border-accent/40 rotate-45 animate-pulse" />
          <div className="absolute inset-2 border border-accent/20 rotate-45 animate-pulse [animation-delay:200ms]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-accent/30 animate-pulse [animation-delay:400ms]" />
          <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:600ms]" />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-accent/30 animate-pulse [animation-delay:400ms]" />
        </div>
        <p className="text-sm text-muted tracking-widest uppercase animate-pulse [animation-delay:800ms]">
          Loading
        </p>
      </div>
    </div>
  );
}
