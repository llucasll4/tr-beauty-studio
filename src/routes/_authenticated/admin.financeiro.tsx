import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/studio/AdminShell";
import { allAppointmentsQuery } from "@/lib/data";
import { brl } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro | Painel TR Beauty Concept" },
      { name: "description", content: "Faturamento, ticket médio e desempenho por serviço do studio." },
      { property: "og:title", content: "Financeiro | Painel TR Beauty Concept" },
      { property: "og:description", content: "Controle financeiro do studio." },
    ],
  }),
  component: AdminFinance,
});

function AdminFinance() {
  const { data: appointments } = useQuery(allAppointmentsQuery);
  const [monthOffset, setMonthOffset] = useState(0);

  const ref = new Date();
  ref.setDate(1);
  ref.setMonth(ref.getMonth() - monthOffset);
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);

  const inMonth = (appointments ?? []).filter((a) => {
    const t = new Date(a.starts_at).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
  const done = inMonth.filter((a) => a.status === "concluido");
  const revenue = done.reduce((s, a) => s + Number(a.price) - Number(a.discount), 0);
  const discounts = done.reduce((s, a) => s + Number(a.discount), 0);
  const canceled = inMonth.filter((a) => a.status === "cancelado").length;
  const noShow = inMonth.filter((a) => a.status === "nao_compareceu").length;
  const ticket = done.length ? revenue / done.length : 0;

  const byService = Object.entries(
    done.reduce<Record<string, number>>((acc, a) => {
      acc[a.service_name] = (acc[a.service_name] ?? 0) + Number(a.price) - Number(a.discount);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = byService[0]?.[1] ?? 1;

  const weeks = [0, 1, 2, 3, 4].map((w) => {
    const total = done
      .filter((a) => {
        const d = new Date(a.starts_at).getDate();
        return d > w * 7 && d <= (w + 1) * 7;
      })
      .reduce((s, a) => s + Number(a.price) - Number(a.discount), 0);
    return { label: `Sem ${w + 1}`, total };
  });
  const weekMax = Math.max(...weeks.map((w) => w.total), 1);

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Financeiro</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          return (
            <button
              key={i}
              onClick={() => setMonthOffset(i)}
              className={cn(
                "shrink-0 rounded-full border border-border px-4 py-1.5 text-xs capitalize tracking-luxe text-muted-foreground",
                monthOffset === i && "border-gold bg-cream text-foreground",
              )}
            >
              {d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Faturamento" value={brl(revenue)} hint={`${done.length} concluídos`} />
        <Card label="Ticket médio" value={brl(ticket)} hint="por atendimento" />
        <Card label="Descontos" value={brl(discounts)} hint="cupons aplicados" />
        <Card label="Perdas" value={`${canceled + noShow}`} hint={`${canceled} cancel. • ${noShow} faltas`} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl">Faturamento por semana</h2>
        <div className="mt-3 flex items-end gap-3 rounded-2xl border border-border bg-card p-5">
          {weeks.map((w) => (
            <div key={w.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className="w-full rounded-t-lg bg-gold-gradient"
                style={{ height: `${Math.max((w.total / weekMax) * 120, 4)}px` }}
              />
              <span className="truncate text-[10px] tracking-luxe text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl">Receita por serviço</h2>
        <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-5">
          {byService.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem receita registrada neste mês.</p>
          )}
          {byService.map(([name, total]) => (
            <div key={name}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                <span className="truncate">{name}</span>
                <span className="shrink-0 text-muted-foreground">{brl(total)}</span>
              </div>
              <span className="mt-1.5 block h-1.5 rounded-full bg-secondary">
                <span
                  className="block h-1.5 rounded-full bg-gold"
                  style={{ width: `${(total / max) * 100}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-[10px] tracking-luxe text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
