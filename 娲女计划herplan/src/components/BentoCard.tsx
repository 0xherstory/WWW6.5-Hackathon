import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  hover?: boolean;
}

export const BentoCard = ({ 
  children, 
  className, 
  size = "medium",
  hover = true 
}: BentoCardProps) => {
  const sizeClasses = {
    small: "col-span-1 row-span-1 min-h-[200px]",
    medium: "col-span-1 md:col-span-2 row-span-1 min-h-[250px]",
    large: "col-span-1 md:col-span-3 row-span-1 min-h-[300px]"
  };

  return (
    <div 
      className={cn(
        "ancient-card p-6 flex flex-col justify-between",
        hover && "cursor-pointer",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
};