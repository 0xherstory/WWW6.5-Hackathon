import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "声誉看板",
};

export default function ReputationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">声誉看板</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        聚合链上指标与趋势图表将在此展示；当前为占位页。
      </p>
      <Button asChild className="mt-8">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
