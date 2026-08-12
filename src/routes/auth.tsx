import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar | TR Beauty Concept" },
      {
        name: "description",
        content: "Acesse sua conta para agendar horários e acompanhar seus atendimentos no studio.",
      },
      { property: "og:title", content: "Entrar | TR Beauty Concept" },
      { property: "og:description", content: "Área da cliente do studio TR Beauty Concept." },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, role, loading, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    password: "",
  });

  useEffect(() => {
    if (loading || !user) return;
    const dest = safePath(search.redirect) ?? (role === "admin" ? "/admin" : "/meus-horarios");
    void navigate({ to: dest, replace: true });
  }, [user, role, loading, search.redirect, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("confirm") || msg.includes("not confirmed")) {
        toast.error("Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e o spam.");
      } else if (msg.includes("invalid") || msg.includes("credentials")) {
        toast.error("E-mail ou senha incorretos.");
      } else {
        toast.error(error.message || "Não foi possível entrar. Verifique e-mail e senha.");
      }
      return;
    }
    await refresh();
    toast.success("Bem-vinda de volta!");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const schema = z.object({
      full_name: z.string().trim().min(2, "Informe seu nome").max(120),
      email: z.string().trim().email("E-mail inválido").max(255),
      phone: z.string().trim().min(10, "Informe seu WhatsApp com DDD").max(20),
      password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").max(72),
      birth_date: z.string().optional(),
    });
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          birth_date: parsed.data.birth_date || null,
        },
      },
    });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        toast.error("Este e-mail já possui conta. Faça login.");
      } else if (msg.includes("password")) {
        toast.error("Senha inválida. Use pelo menos 8 caracteres.");
      } else if (msg.includes("rate") || msg.includes("limit")) {
        toast.error("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
      } else {
        toast.error(error.message || "Não foi possível criar a conta.");
      }
      return;
    }

    // Com confirmação de e-mail desligada, o Supabase já devolve sessão e o useEffect redireciona.
    // Com confirmação ligada, o usuário precisa clicar no link do e-mail antes de entrar.
    if (data.session) {
      await refresh();
      toast.success("Conta criada! Você será redirecionada… 💅");
    } else if (data.user) {
      toast.success(
        "Conta criada! Verifique seu e-mail e clique no link de confirmação para entrar. (No Supabase: Authentication → Email → desative Confirm email para pular essa etapa em desenvolvimento.)",
        { duration: 10000 },
      );
    } else {
      toast.success("Conta criada! 💅");
    }
  }

  async function handleGoogle() {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(
          "Login com Google indisponível neste ambiente. Use e-mail e senha (Criar conta / Entrar).",
        );
      }
    } catch {
      toast.error(
        "Login com Google indisponível neste ambiente. Use e-mail e senha (Criar conta / Entrar).",
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-10">
      <Link to="/" className="mb-6 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold-gradient font-display text-xl text-espresso shadow-soft">
          TR
        </span>
        <p className="mt-3 font-display text-2xl">TR Beauty Concept</p>
        <p className="text-[10px] tracking-luxe text-muted-foreground">Thalita Rebeca | Nail Design</p>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-lift">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="login" className="rounded-full text-xs tracking-luxe">
              Entrar
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full text-xs tracking-luxe">
              Criar conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-5 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">E-mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-full text-xs tracking-luxe"
              >
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-5 space-y-4">
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">WhatsApp</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="(11) 90000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth">Data de nascimento</Label>
                <Input
                  id="birth"
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-full text-xs tracking-luxe"
              >
                Criar minha conta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[10px] tracking-luxe text-muted-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="outline"
          onClick={handleGoogle}
          className="h-12 w-full rounded-full text-xs tracking-luxe"
        >
          Continuar com Google
        </Button>
      </div>

      <Link to="/" className="mt-6 text-xs tracking-luxe text-muted-foreground">
        Voltar ao studio
      </Link>
    </div>
  );
}
