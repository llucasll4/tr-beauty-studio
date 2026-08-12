import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ClientShell } from "@/components/studio/ClientShell";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { myAppointmentsQuery, studioQuery, type Appointment } from "@/lib/data";
import { brl, STATUS_LABEL, STATUS_TONE, WA_TEMPLATES, whatsappLink } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/meus-horarios")({
  head: () => ({
    meta: [
      { title: "Meus horários | TR Beauty Concept" },
      {
        name: "description",
        content: "Acompanhe seus próximos atendimentos e o histórico de serviços no studio.",
      },
      { property: "og:title", content: "Meus horários | TR Beauty Concept" },
      { property: "og:description", content: "Sua agenda pessoal no studio TR Beauty Concept." },
    ],
  }),
  component: MyAppointments,
});

function MyAppointments() {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const { data: studio } = useQuery(studioQuery);
  const { data: appointments } = useQuery(myAppointmentsQuery(user?.id));

  const now = Date.now();
  const upcoming = (appointments ?? [])
    .filter((a) => new Date(a.starts_at).getTime() >= now && a.status !== "cancelado")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = (appointments ?? []).filter(
    (a) => new Date(a.starts_at).getTime() < now || a.status === "cancelado",
  );
  const completed = (appointments ?? []).filter((a) => a.status === "concluido").length;
  const target = studio?.loyalty_target ?? 10;

  async function cancel(a: Appointment) {
    const hours = (new Date(a.starts_at).getTime() - Date.now()) / 3600000;
    if (hours < (studio?.cancel_min_hours ?? 24)) {
      toast.error(
        `Cancelamentos só podem ser feitos com ${studio?.cancel_min_hours ?? 24}h de antecedência. Fale com a Thalita pelo WhatsApp.`,
      );
      return;
    }
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelado" })
      .eq("id", a.id);
    if (error) {
      toast.error("Não foi possível cancelar.");
      return;
    }
    toast.success("Horário cancelado.");
    void qc.invalidateQueries({ queryKey: ["my-appointments"] });
  }

  return (
    <ClientShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl">
          Olá, {(profile?.full_name ?? "").split(" ")[0] || "linda"}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui ficam seus horários e todo o seu histórico no studio.
        </p>

        {studio?.loyalty_enabled && (
          <div className="mt-6 rounded-3xl bg-cream p-5 shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] tracking-luxe text-gold">Programa de fidelidade</p>
                <h2 className="font-display text-xl">{studio.loyalty_benefit}</h2>
              </div>
              <span className="shrink-0 font-display text-2xl">
                {completed % target}/{target}
              </span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: target }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full bg-border",
                    i < completed % target && "bg-gold",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <section className="mt-8">
          <h2 className="font-display text-xl">Próximos horários</h2>
          {upcoming.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-2 text-sm text-muted-foreground">
                Você ainda não tem horários agendados.
              </p>
              <Button asChild className="mt-4 h-11 rounded-full text-xs tracking-luxe">
                <Link to="/agendar">
                  <Sparkles className="h-4 w-4" /> Agendar agora
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {upcoming.map((a) => (
                <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg">{a.service_name}</h3>
                      <p className="mt-1 text-sm capitalize text-muted-foreground">
                        {new Date(a.starts_at).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        })}{" "}
                        às{" "}
                        {new Date(a.starts_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1 text-[10px] tracking-luxe",
                        STATUS_TONE[a.status],
                      )}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-lg text-gold">
                    {brl(Number(a.price) - Number(a.discount))}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={whatsappLink(
                          studio?.whatsapp,
                          WA_TEMPLATES.reschedule(a.client_name, studio?.name ?? "studio"),
                        )}
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Reagendar
                      </a>
                    </Button>
                    {studio?.client_can_cancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-full text-xs">
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display">
                              Cancelar este horário?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {studio?.cancellation_policy}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">Voltar</AlertDialogCancel>
                            <AlertDialogAction className="rounded-full" onClick={() => cancel(a)}>
                              Cancelar horário
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl">Histórico</h2>
            <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {past.map((a) => (
                <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.starts_at).toLocaleDateString("pt-BR")} •{" "}
                      {STATUS_LABEL[a.status]}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {brl(Number(a.price) - Number(a.discount))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </ClientShell>
  );
}
