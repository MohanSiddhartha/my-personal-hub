import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "active" | "idle";
  label?: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === "online" && "bg-primary",
          status === "active" && "bg-amber",
          status === "idle" && "bg-muted-foreground",
        )} />
        {status !== "idle" && (
          <div className={cn(
            "absolute inset-0 w-2 h-2 rounded-full",
            status === "online" && "bg-primary",
            status === "active" && "bg-amber",
          )} style={{ animation: "pulse-ring 2s ease-out infinite" }} />
        )}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
      )}
    </div>
  );
}