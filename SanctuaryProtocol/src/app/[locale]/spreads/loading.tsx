export default function SpreadsLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
          </div>
          <div className="h-10 w-48 mx-auto mb-4 bg-secondary/20 rounded animate-pulse" />
          <div className="h-5 w-64 mx-auto bg-secondary/10 rounded animate-pulse [animation-delay:200ms]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 border border-secondary/20 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
