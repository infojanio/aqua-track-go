import { Link, useLocation, useNavigate, Navigate } from "@tanstack/react-router";
import { Droplets, LayoutDashboard, List, Map, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  const isAdmin = user.role === "admin";

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Droplets className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">AquaLoss</h1>
            <p className="text-[11px] leading-tight text-muted-foreground">Gestão de perdas</p>
          </div>
        </div>
        <nav className="hidden items-center gap-1 sm:flex">
          <NavBtn to="/" icon={<Map className="size-4" />} label="Mapa" active={pathname === "/"} />
          <NavBtn to="/lista" icon={<List className="size-4" />} label="Lista" active={pathname === "/lista"} />
          <NavBtn to="/dashboard" icon={<LayoutDashboard className="size-4" />} label="Dashboard" active={pathname === "/dashboard"} />
          {isAdmin && (
            <NavBtn to="/admin" icon={<Shield className="size-4" />} label="Admin" active={pathname === "/admin"} />
          )}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline" title={user.email}>
            {user.email} {isAdmin && <span className="ml-1 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">Admin</span>}
          </span>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            title="Sair"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">{children}</main>

      {/* Mobile bottom nav */}
      <nav className={cn("grid border-t bg-card sm:hidden", isAdmin ? "grid-cols-4" : "grid-cols-3")}>
        <BottomBtn to="/" icon={<Map className="size-5" />} label="Mapa" active={pathname === "/"} />
        <BottomBtn to="/lista" icon={<List className="size-5" />} label="Lista" active={pathname === "/lista"} />
        <BottomBtn to="/dashboard" icon={<LayoutDashboard className="size-5" />} label="Dashboard" active={pathname === "/dashboard"} />
        {isAdmin && (
          <BottomBtn to="/admin" icon={<Shield className="size-5" />} label="Admin" active={pathname === "/admin"} />
        )}
      </nav>
    </div>
  );
}

function NavBtn({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
      )}
    >
      {icon}{label}
    </Link>
  );
}

function BottomBtn({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {icon}{label}
    </Link>
  );
}
