import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  variant?: "default" | "secondary" | "outline";
}

export function Chip({ text, children, className, variant = "default", ...props }: ChipProps) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-background text-foreground",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )} 
      {...props}
    >
      {text || children}
    </div>
  );
}

export default Chip;
