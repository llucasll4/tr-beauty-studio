import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, MapPin, MessageCircle, ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
import { ClientShell } from "@/components/studio/ClientShell";
import { PortfolioGrid } from "@/components/studio/PortfolioGrid";
import { Button } from "@/components/ui/button";
import { portfolioQuery, servicesQuery, studioQuery } from "@/lib/data";
import { brl, instagramLink, minutesToLabel, WA_TEMPLATES, whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TR Beauty Concept | Nail Design em Diadema/SP" },
      {
        name: "description",
        content:
          "Especialista em unhas naturais e elegantes. Acabamento fino e alta durabilidade. Agende seu horário online no studio da Thalita Rebeca em Diadema/SP.",
      },
      { property: "og:title", content: "TR Beauty Concept | Nail Design" },
      {
        property: "og:description",
        content: "Unhas naturais e elegantes em Diadema/SP. Agendamento online.",
      },
    ],
  }),
  component: Home,
});

const reasons = [
  { icon: Sparkles, title: "Acabamento fino", text: "Cada detalhe pensado para um resultado natural." },
  { icon: Timer, title: "Alta durabilidade", text: "Técnica e produtos premium que duram." },
  { icon: Star, title: "Atendimento personalizado", text: "Um horário exclusivo para você." },
  { icon: ShieldCheck, title: "Biossegurança", text: "Instrumentais esterilizados e descartáveis." },
];

function Home() {
  const { data: studio } = useQuery(studioQuery);
  const { data: services } = useQuery(servicesQuery());
  const { data: portfolio } = useQuery(portfolioQuery);

  const wa = whatsappLink(studio?.whatsapp, WA_TEMPLATES.newBooking(studio?.name ?? "TR Beauty Concept"));

  return (
    <ClientShell>
      <section className="overflow-hidden rounded-3xl bg-cream px-6 py-10 text-center shadow-soft">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold-gradient font-display text-2xl text-espresso shadow-soft">
          TR
        </span>
        <h1 className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
          {studio?.name ?? "TR Beauty Concept"}
        </h1>
        <p className="mt-2 text-xs tracking-luxe text-muted-foreground">
          {studio?.professional_name ?? "Thalita Rebeca | Nail Design"}
        </p>
        <p className="mx-auto mt-5 max-w-md font-display text-lg italic text-secondary-foreground">
          “{studio?.tagline ?? "Especialista em unhas naturais e elegantes"}”
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{studio?.subtitle}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-gold" /> {studio?.city ?? "Diadema/SP"}
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:mx-auto sm:max-w-sm">
          <Button asChild size="lg" className="h-12 rounded-full text-xs tracking-luxe">
            <Link to="/agendar">Agendar horário</Link>
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button asChild variant="outline" size="lg" className="h-11 rounded-full bg-card text-xs">
              <a href={wa} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-full bg-card text-xs">
              <a href="https://www.instagram.com/__thalitanaildesign?igsh=c3A4emlocGRxOXEx">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <header className="mb-4 text-center">
          <p className="text-[10px] tracking-luxe text-gold">Portfólio</p>
          <h2 className="font-display text-2xl">Conheça nosso trabalho</h2>
        </header>
        <PortfolioGrid
          items={(portfolio?.items ?? []).slice(0, 6)}
          categories={[]}
          showFilter={false}
        />
        <div className="mt-4 text-center">
          <Button asChild variant="ghost" className="rounded-full text-xs tracking-luxe">
            <Link to="/portfolio">Ver portfólio completo</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <header className="mb-4 text-center">
          <p className="text-[10px] tracking-luxe text-gold">Serviços</p>
          <h2 className="font-display text-2xl">Feitos para você</h2>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          {(services ?? []).slice(0, 4).map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg">{s.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
                </div>
                <span className="shrink-0 font-display text-lg text-gold">{brl(s.price)}</span>
              </div>
              <p className="mt-3 text-[11px] tracking-luxe text-muted-foreground">
                {minutesToLabel(s.duration_min)} • {s.category}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="ghost" className="rounded-full text-xs tracking-luxe">
            <Link to="/servicos">Ver todos os serviços</Link>
          </Button>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-center font-display text-2xl">
          Por que escolher o {studio?.name ?? "TR Beauty Concept"}?
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {reasons.map((r) => (
            <div key={r.title} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary">
                <r.icon className="h-4 w-4 text-gold" />
              </span>
              <div className="min-w-0">
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Especialização em unhas naturais, do preparo ao acabamento.
        </p>
      </section>

      <section className="mt-12 rounded-3xl bg-cream px-6 py-10 text-center shadow-soft">
        <p className="text-[10px] tracking-luxe text-gold">Vamos começar</p>
        <h2 className="mt-2 font-display text-2xl">Agende seu horário</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Escolha o serviço, o dia e o horário disponível. Simples e rápido.
        </p>
        <Button asChild size="lg" className="mt-6 h-12 rounded-full px-10 text-xs tracking-luxe">
          <Link to="/agendar">Agendar</Link>
        </Button>
        <p className="mt-6 text-xs text-muted-foreground">{studio?.cancellation_policy}</p>
      </section>
    </ClientShell>
  );
}
