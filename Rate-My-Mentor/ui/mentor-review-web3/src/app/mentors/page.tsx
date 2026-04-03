import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mentor 榜单",
};

export default function MentorsListPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Mentor 榜单</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        完整排序与筛选将对接索引服务；请先从首页 Top10 进入详情体验。
      </p>
      <Button asChild className="mt-8">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
