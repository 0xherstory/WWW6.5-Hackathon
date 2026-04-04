"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthContent } from "./_components/AuthContent";

function AuthPageContent() {
  return <AuthContent />;
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
