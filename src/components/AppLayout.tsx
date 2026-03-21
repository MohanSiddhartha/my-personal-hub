import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnimatedBackground, FloatingOrbs } from "@/components/AnimatedBackground";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        <AnimatedBackground />
        <FloatingOrbs />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <header className="h-12 flex items-center border-b border-border/30 px-4 shrink-0 glass-heavy">
            <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors duration-300" />
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" style={{ animation: "breathe 3s ease-in-out infinite" }} />
              <span className="text-xs font-mono text-muted-foreground">SYSTEM ACTIVE</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}