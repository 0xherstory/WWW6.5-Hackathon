import { cn } from "@/lib/utils";

type PlaceholderCardProps = {
  title: string;
  children?: React.ReactNode;
  className?: string;
};

export function PlaceholderCard({
  title,
  children,
  className,
}: PlaceholderCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">{title}</h2>
      {children ? (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {children}
        </div>
      ) : null}
    </section>
  );
}
