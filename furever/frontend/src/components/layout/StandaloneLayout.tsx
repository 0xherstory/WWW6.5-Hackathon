import type { PropsWithChildren } from "react";

export function StandaloneLayout({ children }: PropsWithChildren) {
  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      {children}
    </main>
  );
}
