import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "企业榜单",
};

export default function CompaniesListPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">企业榜单</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        企业维度排序与筛选开发中；首页 Top10 可跳转企业详情。
      </p>
      <Button asChild className="mt-8">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
