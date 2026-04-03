export default function LaunchLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 border border-accent/10 rotate-45 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-40 h-40 border border-accent/10 -rotate-12 animate-pulse [animation-delay:300ms]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-accent/30 animate-pulse" />
            <div className="w-2 h-2 border border-accent/40 rotate-45 animate-pulse [animation-delay:150ms]" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-accent/30 animate-pulse" />
          </div>
          <div className="h-14 w-80 bg-secondary/15 rounded animate-pulse [animation-delay:200ms]" />
          <div className="h-6 w-96 max-w-full bg-secondary/10 rounded animate-pulse [animation-delay:350ms]" />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] max-w-[120px] border border-secondary/20 rounded-sm animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
