import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export function GlitchText({ children, className, as: Tag = "h1" }: GlitchTextProps) {
  return (
    <Tag
      className={cn("relative inline-block", className)}
      data-text={children}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 text-primary opacity-0 hover:opacity-70 transition-opacity duration-200"
        style={{
          animation: "glitch 2s ease-in-out infinite",
          clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
          transform: "translate(-2px, -1px)",
        }}
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-accent opacity-0 hover:opacity-70 transition-opacity duration-200"
        style={{
          animation: "glitch 2s ease-in-out infinite 0.1s",
          clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
          transform: "translate(2px, 1px)",
        }}
        aria-hidden
      >
        {children}
      </span>
    </Tag>
  );
}