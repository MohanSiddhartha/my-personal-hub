import {
  LayoutDashboard,
  StickyNote,
  Code2,
  Briefcase,
  Brain,
  Terminal,
  Hexagon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, color: "text-primary" },
  { title: "Notes", url: "/notes", icon: StickyNote, color: "text-primary" },
  { title: "Snippets", url: "/snippets", icon: Code2, color: "text-cyan" },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase, color: "text-accent" },
  { title: "Quiz", url: "/quiz", icon: Brain, color: "text-amber" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Hexagon className="h-7 w-7 text-primary" style={{ animation: "float 6s ease-in-out infinite" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Terminal className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          {!collapsed && (
            <span className="text-lg font-display font-bold tracking-wider text-gradient-primary">
              DEVVAULT
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item, i) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="group/link transition-all duration-300 relative"
                      activeClassName="text-primary font-medium"
                    >
                      <item.icon
                        className={`h-4 w-4 transition-all duration-300 ${
                          isActive(item.url) ? item.color : "text-muted-foreground group-hover/link:" + item.color
                        }`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-full" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Version tag */}
        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="rounded-lg border border-border/30 bg-card/40 p-3">
              <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
                DevVault v0.1.0
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: "breathe 2s ease-in-out infinite" }} />
                <span className="text-[10px] font-mono text-primary/70">All systems go</span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}