export default function JournalLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
          </div>
          <div className="h-9 w-48 mx-auto mb-2 bg-secondary/20 rounded animate-pulse [animation-delay:200ms]" />
          <div className="h-5 w-60 mx-auto bg-secondary/10 rounded animate-pulse [animation-delay:300ms]" />
        </div>

        <div className="space-y-6">
          <div className="min-h-[200px] border border-secondary/20 rounded-sm p-6 animate-pulse [animation-delay:100ms]">
            <div className="h-4 w-20 mb-3 bg-secondary/15 rounded" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-secondary/10 rounded" />
              <div className="h-4 w-4/5 bg-secondary/10 rounded" />
              <div className="h-4 w-3/5 bg-secondary/10 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-4 border-t border-secondary/15">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] max-w-[100px] border border-secondary/20 rounded-sm animate-pulse mx-auto"
                style={{ animationDelay: `${i * 80 + 200}ms` }}
              />
            ))}
          </div>

          <div className="space-y-3 pt-4">
            <div className="h-12 w-full bg-secondary/15 rounded animate-pulse [animation-delay:350ms]" />
            <div className="h-12 w-full bg-primary/20 rounded animate-pulse [animation-delay:450ms]" />
          </div>
        </div>
      </div>
    </main>
  );
}
