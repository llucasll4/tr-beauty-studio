import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Sparkles, TrendingUp, Users } from "lucide-react";
import { AdminShell } from "@/components/studio/AdminShell";
import { allAppointmentsQuery, clientsQuery } from "@/lib/data";
import { brl, STATUS_LABEL, STATUS_TONE } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Painel TR Beauty Concept" },
      { name: "description", content: "Visão geral de agendamentos, faturamento e clientes do studio." },
      { property: "og:title", content: "Dashboard | Painel TR Beauty Concept" },
      { property: "og:description", content: "Indicadores do studio em tempo real." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: appointments } = useQuery(allAppointmentsQuery);
  const { data: clients } = useQuery(clientsQuery);

  const all = appointments ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const todayKey = now.toDateString();

  const today = all
    .filter((a) => new Date(a.starts_at).toDateString() === todayKey && a.status !== "cancelado")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const monthDone = all.filter(
    (a) => a.status === "concluido" && new Date(a.starts_at).getTime() >= monthStart,
  );
  const revenue = monthDone.reduce((sum, a) => sum + Number(a.price) - Number(a.discount), 0);
  const ticket = monthDone.length ? revenue / monthDone.length : 0;
  const upcoming = all
    .filter((a) => new Date(a.starts_at) > now && a.status !== "cancelado")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5);

  const topServices = Object.entries(
    monthDone.reduce<Record<string, number>>((acc, a) => {
      acc[a.service_name] = (acc[a.service_name] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Hoje" value={String(today.length)} hint="atendimentos" icon={CalendarDays} />
        <Stat label="Faturamento do mês" value={brl(revenue)} hint={`${monthDone.length} concluídos`} icon={TrendingUp} />
        <Stat label="Ticket médio" value={brl(ticket)} hint="no mês" icon={Sparkles} />
        <Stat label="Clientes" value={String((clients ?? []).length)} hint="cadastradas" icon={Users} />
      </div>

      <section className="mt-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <h2 className="font-display text-xl">Agenda de hoje</h2>
          <Link to="/admin/agenda" className="shrink-0 text-xs tracking-luxe text-gold">
            Ver agenda
          </Link>
        </div>
        {today.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum atendimento para hoje.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {today.map((a) => (
              <div key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
                <span className="shrink-0 font-display text-lg">
                  {new Date(a.starts_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{a.client_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{a.service_name}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] tracking-luxe",
                    STATUS_TONE[a.status],
                  )}
                >
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl">Próximos horários</h2>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {upcoming.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Sem horários futuros.</p>
            )}
            {upcoming.map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{a.client_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {new Date(a.starts_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {a.service_name}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-gold">{brl(a.price)}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl">Serviços mais procurados</h2>
          <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4">
            {topServices.length === 0 && (
              <p className="text-sm text-muted-foreground">Ainda sem dados no mês.</p>
            )}
            {topServices.map(([name, count]) => {
              const max = topServices[0]?.[1] ?? 1;
              return (
                <div key={name}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                    <span className="truncate">{name}</span>
                    <span className="shrink-0 text-muted-foreground">{count}</span>
                  </div>
                  <span className="mt-1.5 block h-1.5 rounded-full bg-secondary">
                    <span
                      className="block h-1.5 rounded-full bg-gold"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <p className="min-w-0 text-[10px] tracking-luxe text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-gold" />
      </div>
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
