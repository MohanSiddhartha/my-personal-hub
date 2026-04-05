import {
  LayoutDashboard,
  StickyNote,
  Code2,
  Briefcase,
  Brain,
  Bot,
  FolderLock,
  Terminal,
  Hexagon,
  LogOut,
  Newspaper,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Search,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, color: "text-primary" },
  { title: "Notes", url: "/notes", icon: StickyNote, color: "text-primary" },
  { title: "Snippets", url: "/snippets", icon: Code2, color: "text-cyan" },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase, color: "text-accent" },
  { title: "Quiz", url: "/quiz", icon: Brain, color: "text-amber" },
  { title: "AI Helper", url: "/ai", icon: Bot, color: "text-electric" },
  { title: "File Locker", url: "/files", icon: FolderLock, color: "text-rose" },
  { title: "Articles", url: "/articles", icon: Newspaper, color: "text-emerald-400" },
  { title: "Markets", url: "/markets", icon: TrendingUp, color: "text-orange-400" },
  { title: "Facts", url: "/facts", icon: Lightbulb, color: "text-rose" },
  { title: "Interview Prep", url: "/interview", icon: GraduationCap, color: "text-violet-400" },
  { title: "Jobs", url: "/jobs", icon: Search, color: "text-sky-400" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile, signOut } = useAuth();

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
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold tracking-wider text-gradient-primary">
                SIRA
              </span>
              <span className="text-[8px] font-mono text-muted-foreground/50 tracking-[0.15em] uppercase leading-tight">
                Sid's Intelligent Resource Assistant
              </span>
            </div>
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
              {mainItems.map((item) => (
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
                          isActive(item.url) ? item.color : "text-muted-foreground"
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
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && profile && (
          <div className="rounded-lg border border-border/30 bg-card/40 p-3 mb-2">
            <p className="text-sm font-medium text-foreground truncate">{profile.display_name || "Developer"}</p>
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">SIRA v1.0.0</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign Out" onClick={signOut}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
              {!collapsed && <span className="text-muted-foreground">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}