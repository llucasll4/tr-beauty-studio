import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/components/studio/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { servicesQuery, type Service } from "@/lib/data";
import { brl, minutesToLabel, STUDIO_ID } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços | Painel TR Beauty Concept" },
      { name: "description", content: "Cadastre e edite serviços, preços e durações do catálogo." },
      { property: "og:title", content: "Serviços | Painel TR Beauty Concept" },
      { property: "og:description", content: "Catálogo de serviços do studio." },
    ],
  }),
  component: AdminServices,
});

const empty = {
  id: "",
  name: "",
  description: "",
  category: "Alongamento",
  price: "0",
  duration_min: "90",
  active: true,
  sort_order: "0",
};

function AdminServices() {
  const qc = useQueryClient();
  const { data: services } = useQuery(servicesQuery(true));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  function edit(s: Service) {
    setForm({
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      category: s.category ?? "",
      price: String(s.price),
      duration_min: String(s.duration_min),
      active: s.active,
      sort_order: String(s.sort_order ?? 0),
    });
    setOpen(true);
  }

  async function save() {
    const parsed = z
      .object({
        name: z.string().trim().min(2, "Informe o nome").max(120),
        description: z.string().trim().max(400),
        category: z.string().trim().max(60),
        price: z.coerce.number().min(0).max(100000),
        duration_min: z.coerce.number().int().min(15).max(600),
        sort_order: z.coerce.number().int().min(0).max(999),
      })
      .safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    const payload = { ...parsed.data, active: form.active, studio_id: STUDIO_ID };
    const { error } = form.id
      ? await supabase.from("services").update(payload).eq("id", form.id)
      : await supabase.from("services").insert(payload);
    if (error) {
      toast.error("Não foi possível salvar o serviço.");
      return;
    }
    toast.success("Serviço salvo.");
    setOpen(false);
    setForm(empty);
    void qc.invalidateQueries({ queryKey: ["services"] });
  }

  async function toggle(s: Service) {
    await supabase.from("services").update({ active: !s.active }).eq("id", s.id);
    void qc.invalidateQueries({ queryKey: ["services"] });
  }

  return (
    <AdminShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl">Serviços</h1>
          <p className="mt-1 text-sm text-muted-foreground">{(services ?? []).length} no catálogo</p>
        </div>
        <Button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
          className="shrink-0 rounded-full text-xs tracking-luxe"
        >
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {(services ?? []).map((s) => (
          <article
            key={s.id}
            className={cn(
              "rounded-2xl border border-border bg-card p-4 shadow-soft",
              !s.active && "opacity-60",
            )}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg">{s.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-2 text-[11px] tracking-luxe text-muted-foreground">
                  {s.category} • {minutesToLabel(s.duration_min)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-display text-lg text-gold">{brl(s.price)}</span>
                <div className="flex items-center gap-2">
                  <Switch checked={s.active} onCheckedChange={() => toggle(s)} />
                  <button
                    onClick={() => edit(s)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-border"
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {form.id ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Nome</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-desc">Descrição</Label>
              <Textarea
                id="s-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="s-price">Preço (R$)</Label>
                <Input
                  id="s-price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-dur">Duração (min)</Label>
                <Input
                  id="s-dur"
                  inputMode="numeric"
                  value={form.duration_min}
                  onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-cat">Categoria</Label>
                <Input
                  id="s-cat"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-order">Ordem</Label>
                <Input
                  id="s-order"
                  inputMode="numeric"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <Label htmlFor="s-active">Serviço ativo</Label>
              <Switch
                id="s-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
            <Button onClick={save} className="h-12 w-full rounded-full text-xs tracking-luxe">
              Salvar serviço
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
