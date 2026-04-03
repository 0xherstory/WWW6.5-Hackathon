import { HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[var(--line)] bg-[rgba(17,17,32,0.86)] shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
