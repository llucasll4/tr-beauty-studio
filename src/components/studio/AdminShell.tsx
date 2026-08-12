import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  Clock,
  Images,
  LogOut,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/servicos", label: "Serviços", icon: Sparkles },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/portfolio", label: "Portfólio", icon: Images },
  { to: "/admin/horarios", label: "Horários", icon: Clock },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/meus-horarios", replace: true });
  }, [loading, isAdmin, navigate]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-xs tracking-luxe text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-cream px-4 py-6 md:block">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient font-display text-sm text-espresso">
            TR
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base leading-none">TR Beauty</span>
            <span className="block text-[10px] tracking-luxe text-muted-foreground">Admin</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
                  active && "bg-card text-foreground shadow-soft",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-gold")} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleSignOut}
          className="mt-8 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md md:hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-none">Painel admin</span>
              <span className="block text-[10px] tracking-luxe text-muted-foreground">
                TR Beauty Concept
              </span>
            </span>
            <button
              onClick={handleSignOut}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className="flex min-w-max">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex w-[4.7rem] flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground",
                    active && "text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-gold")} />
                  <span className="truncate px-1">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
