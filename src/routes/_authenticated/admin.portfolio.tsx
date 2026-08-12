import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/studio/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { portfolioQuery } from "@/lib/data";
import { STUDIO_ID } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio | Painel TR Beauty Concept" },
      { name: "description", content: "Publique novas fotos de trabalhos e organize as categorias do portfólio." },
      { property: "og:title", content: "Portfólio | Painel TR Beauty Concept" },
      { property: "og:description", content: "Gestão do portfólio do studio." },
    ],
  }),
  component: AdminPortfolio,
});

function AdminPortfolio() {
  const qc = useQueryClient();
  const { data } = useQuery(portfolioQuery);
  const [form, setForm] = useState({ title: "", description: "", category_id: "" });
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (form.title.trim().length < 2) {
      toast.error("Informe o título antes de enviar a foto.");
      return;
    }
    setBusy(true);
    const path = `portfolio/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "")}`;
    const up = await supabase.storage.from("studio").upload(path, file, { upsert: false });
    if (up.error) {
      setBusy(false);
      toast.error("Falha no upload da imagem.");
      return;
    }
    const signed = await supabase.storage.from("studio").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = signed.data?.signedUrl;
    if (!url) {
      setBusy(false);
      toast.error("Não foi possível gerar o link da imagem.");
      return;
    }
    const { error } = await supabase.from("portfolio_items").insert({
      studio_id: STUDIO_ID,
      title: form.title.trim(),
      description: form.description.trim(),
      category_id: form.category_id || null,
      image_url: url,
      sort_order: (data?.items.length ?? 0) + 1,
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível publicar a foto.");
      return;
    }
    toast.success("Foto publicada!");
    setForm({ title: "", description: "", category_id: "" });
    void qc.invalidateQueries({ queryKey: ["portfolio"] });
  }

  async function remove(id: string) {
    await supabase.from("portfolio_items").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["portfolio"] });
  }

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Portfólio</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {(data?.items ?? []).length} trabalhos publicados
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="p-title">Título</Label>
          <Input
            id="p-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-desc">Descrição</Label>
          <Input
            id="p-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select
            value={form.category_id}
            onValueChange={(v) => setForm({ ...form, category_id: v })}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {(data?.categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-xs tracking-luxe text-primary-foreground">
          <Upload className="h-4 w-4" />
          {busy ? "Enviando…" : "Enviar foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(data?.items ?? []).map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <figcaption className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
              <span className="min-w-0 truncate text-xs">{item.title}</span>
              <button
                onClick={() => remove(item.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
                aria-label="Remover"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </AdminShell>
  );
}
