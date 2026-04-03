"use client";

import Link from "next/link";
import { Award, Clock, ExternalLink, Star, User, Wallet } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock user data
const MOCK_USER = {
  address: "0x742d35Cc6634C0532925a3b844Bc9e7595f5fE12",
  displayName: "Web3 Developer",
  createdAt: "2024-01-15",
  stats: {
    totalReviews: 12,
    mentorReviews: 8,
    companyReviews: 4,
    avgRating: 4.7,
  },
};

const MOCK_CREDENTIALS = [
  {
    tokenId: "001",
    label: "Early Reviewer",
    contract: "0x1234...abcd",
    date: "2024-02-01",
    description: "平台首批评价者",
  },
  {
    tokenId: "005",
    label: "Verified Reviewer",
    contract: "0x5678...efgh",
    date: "2024-06-15",
    description: "已验证身份的评价者",
  },
];

const MOCK_USER_REVIEWS = [
  {
    id: "ur1",
    type: "mentor" as const,
    target: "Alex Chen",
    rating: 5,
    date: "2026-03-20",
    comment: "非常专业，帮助我们解决了合约架构问题。沟通清晰，响应迅速。",
    tags: ["专业", "高效"],
    txHash: "0xabcd...1234",
  },
  {
    id: "ur2",
    type: "mentor" as const,
    target: "Jordan Wu",
    rating: 5,
    date: "2026-03-10",
    comment: "全栈能力出众，dApp 开发过程中的好帮手。",
    tags: ["技术强", "易合作"],
    txHash: "0xefgh...5678",
  },
  {
    id: "ur3",
    type: "company" as const,
    target: "NovaChain Labs",
    rating: 4,
    date: "2026-02-28",
    comment: "RPC 服务稳定，技术支持响应及时。",
    tags: ["稳定", "支持好"],
    txHash: "0xijkl...9abc",
  },
  {
    id: "ur4",
    type: "mentor" as const,
    target: "Samira Okonkwo",
    rating: 5,
    date: "2026-02-15",
    comment: "密码学讲解深入浅出，ZK 技术收获很多。",
    tags: ["讲解清晰", "专业"],
  },
];

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <Avatar className="h-20 w-20 border-2 border-accent/30 shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-accent/30 to-accent/10 text-xl font-bold text-accent">
            {initials(MOCK_USER.displayName)}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-xl font-semibold">{MOCK_USER.displayName}</h1>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground">
            {formatAddress(MOCK_USER.address)}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          加入于 {MOCK_USER.createdAt}
        </p>

        {/* Stats */}
        <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{MOCK_USER.stats.totalReviews}</p>
            <p className="mt-1 text-xs text-muted-foreground">总评价数</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{MOCK_USER.stats.mentorReviews}</p>
            <p className="mt-1 text-xs text-muted-foreground">Mentor 评价</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{MOCK_USER.stats.companyReviews}</p>
            <p className="mt-1 text-xs text-muted-foreground">企业评价</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{MOCK_USER.stats.avgRating.toFixed(1)}</p>
            <p className="mt-1 text-xs text-muted-foreground">平均评分</p>
          </div>
        </div>
      </div>

      {/* Credentials / SBT */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">凭证 (SBT)</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {MOCK_CREDENTIALS.map((cred) => (
            <Card key={cred.tokenId} className="transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
                    <Award className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{cred.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{cred.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">Token #{cred.tokenId}</Badge>
                      <span className="text-[10px] text-muted-foreground">{cred.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Reviews */}
      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">我的评价</h2>
        </div>
        <div className="space-y-3">
          {MOCK_USER_REVIEWS.map((review) => (
            <Card key={review.id} className="transition hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={review.type === "mentor" ? `/mentor/${review.target.replace(" ", "-").toLowerCase()}` : `/company/${review.target.replace(" ", "-").toLowerCase()}`}
                        className="font-medium text-foreground hover:text-accent"
                      >
                        {review.target}
                      </Link>
                      <Badge variant={review.type === "mentor" ? "secondary" : "outline"} className="text-[10px]">
                        {review.type === "mentor" ? "Mentor" : "企业"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < review.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {review.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${review.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md border border-border/60 bg-muted/50 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Write Review CTA */}
      <div className="mt-8">
        <Link href="/review">
          <Button size="lg" className="w-full">
            写新评价
          </Button>
        </Link>
      </div>
    </div>
  );
}