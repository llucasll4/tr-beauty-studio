import { Link, useRouterState } from "@tanstack/react-router";
import { Calendar, Heart, Home, Images, Sparkles, User2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Início", icon: Home },
  { to: "/portfolio", label: "Portfólio", icon: Images },
  { to: "/servicos", label: "Serviços", icon: Sparkles },
  { to: "/agendar", label: "Agendar", icon: Calendar },
  { to: "/meus-horarios", label: "Meus horários", icon: Heart },
] as const;

export function ClientShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-sm text-espresso">
              TR
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-none">
                TR Beauty Concept
              </span>
              <span className="block truncate text-[10px] tracking-luxe text-muted-foreground">
                Nail Design
              </span>
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  pathname === t.to && "bg-secondary text-foreground",
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full border border-border px-3 py-1.5 text-xs tracking-luxe text-muted-foreground"
              >
                Admin
              </Link>
            )}
            <Link
              to={user ? "/perfil" : "/auth"}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground"
              aria-label={user ? "Minha conta" : "Entrar"}
            >
              <User2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:pb-16">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] text-muted-foreground",
                  active && "text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-gold")} />
                <span className="truncate px-1">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
