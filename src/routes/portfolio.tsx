import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClientShell } from "@/components/studio/ClientShell";
import { PortfolioGrid } from "@/components/studio/PortfolioGrid";
import { portfolioQuery } from "@/lib/data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio | TR Beauty Concept" },
      {
        name: "description",
        content:
          "Trabalhos do studio TR Beauty Concept: unhas naturais, nail art minimalista, biossegurança e experiências.",
      },
      { property: "og:title", content: "Portfólio | TR Beauty Concept" },
      { property: "og:description", content: "Veja os trabalhos da Thalita Rebeca Nail Design." },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { data } = useQuery(portfolioQuery);
  return (
    <ClientShell>
      <header className="mb-6 text-center">
        <p className="text-[10px] tracking-luxe text-gold">Portfólio</p>
        <h1 className="font-display text-3xl">Nossos trabalhos</h1>
      </header>
      <PortfolioGrid items={data?.items ?? []} categories={data?.categories ?? []} />
    </ClientShell>
  );
}
