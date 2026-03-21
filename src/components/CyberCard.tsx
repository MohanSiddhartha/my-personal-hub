import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "accent" | "cyan" | "amber" | "rose";
  onClick?: () => void;
  animated?: boolean;
}

const glowMap = {
  primary: {
    border: "hover:border-primary/40",
    shadow: "hover:shadow-[0_0_30px_hsl(155_100%_45%/0.15)]",
    line: "bg-primary",
  },
  accent: {
    border: "hover:border-accent/40",
    shadow: "hover:shadow-[0_0_30px_hsl(280_85%_60%/0.15)]",
    line: "bg-accent",
  },
  cyan: {
    border: "hover:border-cyan/40",
    shadow: "hover:shadow-[0_0_30px_hsl(185_85%_50%/0.15)]",
    line: "bg-cyan",
  },
  amber: {
    border: "hover:border-amber/40",
    shadow: "hover:shadow-[0_0_30px_hsl(38_95%_55%/0.15)]",
    line: "bg-amber",
  },
  rose: {
    border: "hover:border-rose/40",
    shadow: "hover:shadow-[0_0_30px_hsl(350_85%_58%/0.15)]",
    line: "bg-rose",
  },
};

export function CyberCard({
  children,
  className,
  glowColor = "primary",
  onClick,
  animated = true,
}: CyberCardProps) {
  const glow = glowMap[glowColor];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border border-border/30 bg-card/60 backdrop-blur-sm p-5",
        "transition-all duration-500 ease-out",
        glow.border,
        glow.shadow,
        onClick && "cursor-pointer active:scale-[0.97]",
        animated && "card-hover",
        className
      )}
    >
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-4 right-4 h-[1px] opacity-40 group-hover:opacity-100 transition-opacity duration-500",
        glow.line
      )} />
      
      {/* Corner accents */}
      <div className={cn(
        "absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-xl opacity-0 group-hover:opacity-60 transition-all duration-500",
        glow.border.replace("hover:", "")
      )} />
      <div className={cn(
        "absolute bottom-0 right-0 w-3 h-3 border-b border-r rounded-br-xl opacity-0 group-hover:opacity-60 transition-all duration-500",
        glow.border.replace("hover:", "")
      )} />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(105deg, transparent 40%, hsla(155, 100%, 45%, 0.03) 45%, hsla(155, 100%, 45%, 0.05) 50%, hsla(155, 100%, 45%, 0.03) 55%, transparent 60%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s infinite",
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}