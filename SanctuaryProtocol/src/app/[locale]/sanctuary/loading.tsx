export default function SanctuaryLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
          </div>
          <div className="h-10 w-56 mx-auto mb-4 bg-secondary/20 rounded animate-pulse" />
          <div className="h-5 w-72 mx-auto bg-secondary/10 rounded animate-pulse [animation-delay:200ms]" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 border border-secondary/20 rounded-sm p-6 animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="h-5 w-32 mb-3 bg-secondary/15 rounded" />
              <div className="h-4 w-full bg-secondary/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
