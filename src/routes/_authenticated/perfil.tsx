import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ClientShell } from "@/components/studio/ClientShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil | TR Beauty Concept" },
      { name: "description", content: "Atualize seus dados de contato e preferências do studio." },
      { property: "og:title", content: "Meu perfil | TR Beauty Concept" },
      { property: "og:description", content: "Dados da sua conta no studio TR Beauty Concept." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, role, refresh, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    birth_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      whatsapp: profile.whatsapp ?? "",
      instagram: profile.instagram ?? "",
      birth_date: profile.birth_date ?? "",
    });
  }, [profile]);

  async function save() {
    const schema = z.object({
      full_name: z.string().trim().min(2, "Informe seu nome").max(120),
      phone: z.string().trim().max(20).optional(),
      whatsapp: z.string().trim().max(20).optional(),
      instagram: z.string().trim().max(60).optional(),
      birth_date: z.string().optional(),
    });
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name,
        phone: parsed.data.phone || null,
        whatsapp: parsed.data.whatsapp || null,
        instagram: parsed.data.instagram || null,
        birth_date: parsed.data.birth_date || null,
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    await refresh();
    toast.success("Perfil atualizado!");
  }

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <ClientShell>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl">Meu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user?.email} • {role === "admin" ? "Administradora" : "Cliente"}
        </p>

        <div className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <Field
            id="p-name"
            label="Nome completo"
            value={form.full_name}
            onChange={(v) => setForm({ ...form, full_name: v })}
          />
          <Field
            id="p-whatsapp"
            label="WhatsApp"
            value={form.whatsapp}
            onChange={(v) => setForm({ ...form, whatsapp: v })}
          />
          <Field
            id="p-phone"
            label="Telefone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            id="p-instagram"
            label="Instagram"
            value={form.instagram}
            onChange={(v) => setForm({ ...form, instagram: v })}
          />
          <Field
            id="p-birth"
            label="Data de nascimento"
            type="date"
            value={form.birth_date}
            onChange={(v) => setForm({ ...form, birth_date: v })}
          />
          <Button
            onClick={save}
            disabled={saving}
            className="h-12 w-full rounded-full text-xs tracking-luxe"
          >
            Salvar alterações
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="mt-4 h-11 w-full rounded-full text-xs tracking-luxe text-muted-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>
    </ClientShell>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl"
      />
    </div>
  );
}
