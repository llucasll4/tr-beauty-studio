import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Upload, ImagePlus } from "lucide-react";
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

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/_authenticated/admin/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio | Painel TR Beauty Concept" },
      {
        name: "description",
        content:
          "Publique novas fotos de trabalhos e organize as categorias do portfólio.",
      },
      {
        property: "og:title",
        content: "Portfólio | Painel TR Beauty Concept",
      },
      {
        property: "og:description",
        content: "Gestão do portfólio do studio.",
      },
    ],
  }),
  component: AdminPortfolio,
});

function sanitizeFileName(name: string) {
  const extension = name.includes(".")
    ? `.${name.split(".").pop()!.toLowerCase()}`
    : "";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "imagem"}${extension}`;
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/studio/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(url.slice(index + marker.length));
}

function AdminPortfolio() {
  const qc = useQueryClient();
  const { data } = useQuery(portfolioQuery);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFile(null);
  }

  function selectFile(file: File | undefined) {
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Formato não permitido. Use JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("A imagem deve ter no máximo 10 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function upload() {
    if (!selectedFile) {
      toast.error("Selecione uma foto antes de enviar.");
      return;
    }

    if (form.title.trim().length < 2) {
      toast.error("Informe o título antes de enviar a foto.");
      return;
    }

    setBusy(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        console.error(
          "Erro de autenticação no upload do portfólio:",
          authError,
        );

        toast.error("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const safeName = sanitizeFileName(selectedFile.name);
      const path = `portfolio/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("studio")
        .upload(path, selectedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedFile.type,
        });

      if (uploadError) {
        console.error(
          "Erro no upload do portfólio:",
          uploadError,
        );

        console.error("Detalhes do arquivo:", {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          path,
        });

        if (/bucket/i.test(uploadError.message)) {
          toast.error(
            "O armazenamento de imagens do Studio não está configurado.",
          );
        } else if (
          /row-level security|policy|permission|not authorized/i.test(
            uploadError.message,
          )
        ) {
          toast.error(
            "Sua conta não tem permissão para enviar fotos.",
          );
        } else {
          toast.error(
            `Falha no upload: ${uploadError.message}`,
          );
        }

        return;
      }

      const { data: publicData } = supabase.storage
        .from("studio")
        .getPublicUrl(path);

      const imageUrl = publicData.publicUrl;

      if (!imageUrl) {
        await supabase.storage
          .from("studio")
          .remove([path]);

        toast.error(
          "Não foi possível gerar o endereço da imagem.",
        );

        return;
      }

      const { error: databaseError } = await supabase
        .from("portfolio_items")
        .insert({
          studio_id: STUDIO_ID,
          title: form.title.trim(),
          description: form.description.trim(),
          category_id: form.category_id || null,
          image_url: imageUrl,
          sort_order: (data?.items.length ?? 0) + 1,
        });

      if (databaseError) {
        console.error(
          "Erro ao salvar portfólio:",
          databaseError,
        );

        await supabase.storage
          .from("studio")
          .remove([path]);

        toast.error(
          `Não foi possível publicar a foto: ${databaseError.message}`,
        );

        return;
      }

      toast.success("Foto publicada com sucesso!");

      setForm({
        title: "",
        description: "",
        category_id: "",
      });

      clearSelectedFile();

      void qc.invalidateQueries({
        queryKey: ["portfolio"],
      });
    } catch (error) {
      console.error(
        "Erro inesperado no upload do portfólio:",
        error,
      );

      toast.error(
        "Ocorreu um erro inesperado ao enviar a foto.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, imageUrl: string) {
    setBusy(true);

    try {
      const { error: databaseError } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", id);

      if (databaseError) {
        console.error(
          "Erro ao remover registro do portfólio:",
          databaseError,
        );

        toast.error(
          `Não foi possível remover a foto: ${databaseError.message}`,
        );

        return;
      }

      const storagePath =
        getStoragePathFromPublicUrl(imageUrl);

      if (storagePath) {
        const { error: storageError } =
          await supabase.storage
            .from("studio")
            .remove([storagePath]);

        if (storageError) {
          console.error(
            "Erro ao remover arquivo do Storage:",
            storageError,
          );
        }
      }

      toast.success("Foto removida.");

      void qc.invalidateQueries({
        queryKey: ["portfolio"],
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">
        Portfólio
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        {(data?.items ?? []).length} trabalhos publicados
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="p-title">
            Título
          </Label>

          <Input
            id="p-title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="h-11 rounded-xl"
            disabled={busy}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-desc">
            Descrição
          </Label>

          <Input
            id="p-desc"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="h-11 rounded-xl"
            disabled={busy}
          />
        </div>

        <div className="space-y-1.5">
          <Label>
            Categoria
          </Label>

          <Select
            value={form.category_id}
            onValueChange={(v) =>
              setForm({
                ...form,
                category_id: v,
              })
            }
            disabled={busy}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent>
              {(data?.categories ?? []).map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {previewUrl && selectedFile && (
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={previewUrl}
              alt="Pré-visualização"
              className="aspect-square max-h-80 w-full object-cover"
            />

            <div className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={clearSelectedFile}
                disabled={busy}
              >
                Remover
              </Button>
            </div>
          </div>
        )}

        {!selectedFile ? (
          <label className="flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />

            <span className="text-sm font-medium">
              Selecionar foto
            </span>

            <span className="text-xs text-muted-foreground">
              JPG, PNG ou WEBP • máximo 10 MB
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                selectFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <Button
            type="button"
            className="h-12 w-full rounded-full"
            disabled={busy}
            onClick={() => void upload()}
          >
            <Upload className="mr-2 h-4 w-4" />

            {busy
              ? "Enviando…"
              : "Adicionar ao portfólio"}
          </Button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(data?.items ?? []).map((item) => (
          <figure
            key={item.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />

            <figcaption className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
              <span className="min-w-0 truncate text-xs">
                {item.title}
              </span>

              <button
                onClick={() =>
                  void remove(
                    item.id,
                    item.image_url,
                  )
                }
                disabled={busy}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground disabled:opacity-50"
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
