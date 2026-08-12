import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClientShell } from "@/components/studio/ClientShell";
import { Button } from "@/components/ui/button";
import { servicesQuery } from "@/lib/data";
import { brl, minutesToLabel } from "@/lib/studio";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços e preços | TR Beauty Concept" },
      {
        name: "description",
        content:
          "Alongamento, manutenção, banho de gel, esmaltação em gel, blindagem e nail art. Preços e duração de cada serviço.",
      },
      { property: "og:title", content: "Serviços | TR Beauty Concept" },
      { property: "og:description", content: "Confira os serviços, preços e duração do studio." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useQuery(servicesQuery());
  const categories = [...new Set((services ?? []).map((s) => s.category))];

  return (
    <ClientShell>
      <header className="mb-6 text-center">
        <p className="text-[10px] tracking-luxe text-gold">Serviços</p>
        <h1 className="font-display text-3xl">Preços e duração</h1>
      </header>

      <div className="space-y-8">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-3 text-[11px] tracking-luxe text-muted-foreground">{cat}</h2>
            <div className="space-y-2.5">
              {(services ?? [])
                .filter((s) => s.category === cat)
                .map((s) => (
                  <article
                    key={s.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg">{s.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                        <p className="mt-2 text-[11px] tracking-luxe text-muted-foreground">
                          {minutesToLabel(s.duration_min)}
                        </p>
                      </div>
                      <span className="shrink-0 font-display text-xl text-gold">{brl(s.price)}</span>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg" className="h-12 rounded-full px-10 text-xs tracking-luxe">
          <Link to="/agendar">Agendar horário</Link>
        </Button>
      </div>
    </ClientShell>
  );
}
