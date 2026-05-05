import { Link, useLocation } from "@tanstack/react-router";
import { Droplets, LayoutDashboard, List, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
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
        </nav>
      </header>

      <main className="relative flex-1 overflow-hidden">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="grid grid-cols-2 border-t bg-card sm:hidden">
        <BottomBtn to="/" icon={<Map className="size-5" />} label="Mapa" active={pathname === "/"} />
        <BottomBtn to="/lista" icon={<List className="size-5" />} label="Lista" active={pathname === "/lista"} />
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
