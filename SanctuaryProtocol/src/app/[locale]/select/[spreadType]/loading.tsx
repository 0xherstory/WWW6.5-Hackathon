export default function SelectLoading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-8 h-px bg-accent/30 animate-pulse" />
          </div>
          <div className="h-9 w-52 mx-auto mb-2 bg-secondary/20 rounded animate-pulse [animation-delay:200ms]" />
          <div className="h-5 w-64 mx-auto bg-secondary/10 rounded animate-pulse [animation-delay:300ms]" />
        </div>

        <div className="flex justify-center gap-6 mb-8">
          {["", ""].map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 border border-secondary/30 rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] max-w-[120px] border border-secondary/20 rounded-sm animate-pulse mx-auto"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        <div className="border-t border-secondary/20 pt-8">
          <div className="h-6 w-36 mb-4 bg-secondary/15 rounded animate-pulse" />
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-28 border border-secondary/20 rounded-sm animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
