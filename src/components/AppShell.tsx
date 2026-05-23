import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LayoutDashboard, Wallet, Bell, User, LogOut, Menu, X, Leaf,
} from "lucide-react";
import { EcoBackground } from "./EcoBackground";
import { logout, useAppState } from "@/lib/store";
import { driver } from "@/lib/data";
import { useRentScheduler } from "@/hooks/use-rent-scheduler";

const nav = [
  { to: "/business", label: "Dashboard", icon: LayoutDashboard },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const NAV_ITEM_H = 44;

export function AppShell() {
  useRentScheduler();
  const unread = useAppState((s) => s.notifications.filter((n) => !n.read).length);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const activeIndex = useMemo(
    () => Math.max(0, nav.findIndex((n) => path === n.to || path.startsWith(`${n.to}/`))),
    [path],
  );

  const onLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const navLinks = (mobile = false) =>
    nav.map(({ to, label, icon: Icon }) => {
      const active = path === to || path.startsWith(`${to}/`);
      return (
        <Link
          key={to}
          to={to}
          onClick={mobile ? () => setOpenMobile(false) : undefined}
          className={`sidebar-nav-link flex items-center gap-3 px-3 rounded-xl h-11 ${
            active ? "sidebar-nav-link-active" : "text-white/70"
          }`}
        >
          <Icon className={`size-5 shrink-0 transition-transform duration-300 ${active ? "scale-110" : ""}`} />
          {(!collapsed || mobile) && <span className="text-sm">{label}</span>}
          {(!collapsed || mobile) && label === "Alerts" && unread > 0 && (
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-primary font-semibold">
              {unread}
            </span>
          )}
          {mobile && active && <span className="ml-auto size-1.5 rounded-full bg-white animate-pulse-glow" />}
        </Link>
      );
    });

  return (
    <div className="min-h-screen flex w-full text-foreground">
      <EcoBackground />

      <aside
        className={`sidebar-shell hidden lg:flex flex-col sticky top-0 h-screen transition-[width] duration-300 z-40 ${
          collapsed ? "w-[5.25rem]" : "w-64"
        }`}
      >
        <div className="p-5 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/15 border border-white/25 grid place-items-center shrink-0">
            <Leaf className="size-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="font-bold tracking-tight text-white">NeevCabs</div>
              <div className="text-xs sidebar-brand-sub">Driver Ops</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto text-white/70 hover:text-white transition shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="size-4" />
          </button>
        </div>

        <nav className="relative px-3 flex-1 mt-1">
          {!collapsed && (
            <div
              className="sidebar-nav-indicator absolute left-3 right-3 h-11 rounded-xl pointer-events-none"
              style={{ transform: `translateY(${activeIndex * NAV_ITEM_H}px)` }}
            />
          )}
          <div className="relative space-y-0">{navLinks()}</div>
        </nav>

        <div className="p-3 sidebar-footer-border border-t">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="size-9 rounded-full bg-white/20 border border-white/30 grid place-items-center text-sm font-semibold text-white">
                {driver.name[0]}
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-medium text-white truncate">{driver.name}</div>
                <div className="text-[11px] font-mono sidebar-brand-sub truncate">{driver.id}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm text-white/75 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass-strong border-b border-border safe-top">
          <div className="flex items-center gap-3 px-4 lg:px-6 h-12">
            <button type="button" className="lg:hidden text-foreground" onClick={() => setOpenMobile(true)}>
              <Menu className="size-6" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="size-8 rounded-xl eco-gradient grid place-items-center">
                <Leaf className="size-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tight">
                Neev<span className="text-primary">Cabs</span>
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary font-medium">B2C Mode</span>
              <span className="text-foreground/30">·</span>
              <span className="font-mono">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link to="/notifications" className="relative size-10 grid place-items-center rounded-xl hover:bg-foreground/5 transition">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-primary animate-pulse-glow" />
                )}
              </Link>
              <Link to="/profile" className="size-10 rounded-full eco-gradient grid place-items-center text-primary-foreground text-sm font-semibold">
                {driver.name[0]}
              </Link>
            </div>
          </div>
        </header>

        <main key={path} className="flex-1 px-4 lg:px-6 py-4 pb-24 lg:pb-10 animate-page-enter">
          <Outlet />
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-t border-border safe-bottom">
          <div className="grid grid-cols-4 px-2 pt-2">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = path === to || path.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center gap-1 py-1.5 text-[10px] font-medium transition-transform duration-200 active:scale-95"
                >
                  <span
                    className={`grid place-items-center size-10 rounded-2xl transition-all duration-300 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className={active ? "text-foreground font-semibold" : "text-muted-foreground"}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {openMobile && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenMobile(false)} />
          <div className="sidebar-shell absolute left-0 top-0 bottom-0 w-72 p-5 flex flex-col animate-page-enter">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/15 border border-white/25 grid place-items-center">
                <Leaf className="size-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-white">Neev Driver</div>
                <div className="text-xs sidebar-brand-sub">B2C Mode</div>
              </div>
              <button type="button" className="ml-auto text-white/80" onClick={() => setOpenMobile(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 space-y-0 flex-1">{navLinks(true)}</div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm text-white/80 hover:bg-white/10"
            >
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
