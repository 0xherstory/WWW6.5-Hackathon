export default function ClaimLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
          </div>
          <div className="h-9 w-44 mx-auto mb-3 bg-secondary/20 rounded animate-pulse [animation-delay:200ms]" />
          <div className="h-5 w-56 mx-auto bg-secondary/10 rounded animate-pulse [animation-delay:300ms]" />
        </div>
        <div className="space-y-4 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 h-12 px-4 border border-secondary/20 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-5 h-5 rounded-full bg-secondary/15" />
              <div className="h-4 flex-1 bg-secondary/10 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-24 border border-secondary/20 rounded-sm p-4 animate-pulse [animation-delay:100ms]">
            <div className="h-4 w-28 mb-2 bg-secondary/15 rounded" />
            <div className="h-8 w-32 bg-secondary/10 rounded" />
          </div>
          <div className="h-14 bg-primary/20 rounded animate-pulse [animation-delay:250ms]" />
        </div>
      </div>
    </main>
  );
}
