import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { AdminShell } from "@/components/studio/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { allAppointmentsQuery, clientsQuery, studioQuery } from "@/lib/data";
import { brl, STATUS_LABEL, WA_TEMPLATES, whatsappLink } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | Painel TR Beauty Concept" },
      { name: "description", content: "Cadastro, histórico e contato das clientes do studio." },
      { property: "og:title", content: "Clientes | Painel TR Beauty Concept" },
      { property: "og:description", content: "Base de clientes do studio." },
    ],
  }),
  component: AdminClients,
});

type ClientRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  birth_date: string | null;
  notes?: string | null;
};

function AdminClients() {
  const { data: clients } = useQuery(clientsQuery);
  const { data: appointments } = useQuery(allAppointmentsQuery);
  const { data: studio } = useQuery(studioQuery);
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<ClientRow | null>(null);

  const rows = ((clients ?? []) as unknown as ClientRow[]).filter((c) =>
    `${c.full_name} ${c.whatsapp ?? ""} ${c.email ?? ""}`.toLowerCase().includes(term.toLowerCase()),
  );

  const history = (appointments ?? []).filter((a) => a.client_id === selected?.id);
  const spent = history
    .filter((a) => a.status === "concluido")
    .reduce((sum, a) => sum + Number(a.price) - Number(a.discount), 0);

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Clientes</h1>
      <p className="mt-1 text-sm text-muted-foreground">{rows.length} cadastradas</p>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nome, WhatsApp ou e-mail"
          className="h-11 rounded-full pl-9"
        />
      </div>

      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">Nenhuma cliente encontrada.</p>
        )}
        {rows.map((c) => {
          const count = (appointments ?? []).filter(
            (a) => a.client_id === c.id && a.status === "concluido",
          ).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 text-left"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm">
                {c.full_name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{c.full_name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.whatsapp || c.phone || c.email}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{count} atend.</span>
            </button>
          );
        })}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">{selected?.full_name}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-5">
              <div className="space-y-1 rounded-2xl bg-cream p-4 text-sm">
                <p className="text-muted-foreground">{selected.email}</p>
                <p>{selected.whatsapp || selected.phone || "Sem telefone"}</p>
                {selected.instagram && <p className="text-muted-foreground">{selected.instagram}</p>}
                {selected.birth_date && (
                  <p className="text-muted-foreground">
                    Aniversário: {new Date(`${selected.birth_date}T12:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-[10px] tracking-luxe text-muted-foreground">Atendimentos</p>
                  <p className="font-display text-2xl">
                    {history.filter((a) => a.status === "concluido").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-[10px] tracking-luxe text-muted-foreground">Total gasto</p>
                  <p className="font-display text-2xl">{brl(spent)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full text-xs">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(
                      selected.whatsapp || selected.phone,
                      WA_TEMPLATES.comeback(selected.full_name, studio?.name ?? "studio"),
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chamar
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(
                      selected.whatsapp || selected.phone,
                      WA_TEMPLATES.birthday(selected.full_name, studio?.name ?? "studio"),
                    )}
                  >
                    Parabéns
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(
                      selected.whatsapp || selected.phone,
                      WA_TEMPLATES.afterCare(selected.full_name, studio?.name ?? "studio"),
                    )}
                  >
                    Pós-atendimento
                  </a>
                </Button>
              </div>

              <div>
                <h3 className="font-display text-lg">Histórico</h3>
                <div className="mt-2 divide-y divide-border rounded-2xl border border-border">
                  {history.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">Sem atendimentos.</p>
                  )}
                  {history.map((a) => (
                    <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-3 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate">{a.service_name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {new Date(a.starts_at).toLocaleDateString("pt-BR")} • {STATUS_LABEL[a.status]}
                        </span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {brl(Number(a.price) - Number(a.discount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
