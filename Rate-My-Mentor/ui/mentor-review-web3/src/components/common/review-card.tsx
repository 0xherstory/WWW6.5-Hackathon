import { ExternalLink, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReviewItem } from "@/data/detail-mock";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: ReviewItem;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{review.author}</span>
            <span className="text-xs text-muted-foreground">{review.authorAddress}</span>
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

      <p className="mt-3 text-sm leading-relaxed text-foreground">{review.comment}</p>

      {review.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}