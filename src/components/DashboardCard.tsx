import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: "primary" | "accent" | "cyan" | "amber" | "rose";
  onClick?: () => void;
}

const accentBorderMap = {
  primary: "border-t-primary/40",
  accent: "border-t-accent/40",
  cyan: "border-t-cyan/40",
  amber: "border-t-amber/40",
  rose: "border-t-rose/40",
};

export function DashboardCard({
  title,
  icon,
  children,
  className,
  accentColor = "primary",
  onClick,
}: DashboardCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border/50 bg-card p-5 transition-all duration-300",
        "hover:border-border hover:shadow-lg hover:shadow-black/20",
        "border-t-2",
        accentBorderMap[accentColor],
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
