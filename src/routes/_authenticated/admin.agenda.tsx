import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/studio/AdminShell";
import { MonthCalendar } from "@/components/studio/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  appointmentsRangeQuery,
  businessHoursQuery,
  servicesQuery,
  studioQuery,
  type Appointment,
} from "@/lib/data";
import {
  brl,
  dateKey,
  STATUS_LABEL,
  STATUS_TONE,
  STUDIO_ID,
  WA_TEMPLATES,
  whatsappLink,
} from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda | Painel TR Beauty Concept" },
      { name: "description", content: "Gerencie os atendimentos do dia, status e novos agendamentos." },
      { property: "og:title", content: "Agenda | Painel TR Beauty Concept" },
      { property: "og:description", content: "Agenda administrativa do studio." },
    ],
  }),
  component: AdminAgenda,
});

const STATUSES = ["agendado", "confirmado", "concluido", "cancelado", "nao_compareceu"] as const;

function AdminAgenda() {
  const qc = useQueryClient();
  const [day, setDay] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const { data: studio } = useQuery(studioQuery);
  const { data: services } = useQuery(servicesQuery(true));
  const { data: hours } = useQuery(businessHoursQuery);

  const dayRange = useMemo(() => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return { from: day.toISOString(), to: next.toISOString() };
  }, [day]);

  const monthRange = useMemo(() => {
    const from = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const to = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }, [viewMonth]);

  const { data: appointments } = useQuery(appointmentsRangeQuery(dayRange.from, dayRange.to));
  const { data: monthAppointments } = useQuery({
    ...appointmentsRangeQuery(monthRange.from, monthRange.to),
    queryKey: ["appointments-month", dateKey(viewMonth)],
  });

  const list = (appointments ?? []).slice().sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const dayMeta = useMemo(() => {
    const meta: Record<string, { count?: number; closed?: boolean }> = {};
    if (hours) {
      const year = viewMonth.getFullYear();
      const month = viewMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const d = new Date(year, month, dayNum);
        const config = hours.find((h) => h.weekday === d.getDay());
        if (!config?.active) {
          meta[dateKey(d)] = { ...(meta[dateKey(d)] ?? {}), closed: true };
        }
      }
    }
    for (const a of monthAppointments ?? []) {
      if (a.status === "cancelado") continue;
      const d = new Date(a.starts_at);
      const key = dateKey(d);
      meta[key] = {
        ...(meta[key] ?? {}),
        count: (meta[key]?.count ?? 0) + 1,
      };
    }
    return meta;
  }, [hours, viewMonth, monthAppointments]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", serviceId: "", time: "09:00" });

  function refresh() {
    void qc.invalidateQueries({ queryKey: ["appointments"] });
    void qc.invalidateQueries({ queryKey: ["appointments-all"] });
    void qc.invalidateQueries({ queryKey: ["appointments-month"] });
  }

  async function setStatus(a: Appointment, status: Appointment["status"]) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", a.id);
    if (error) {
      toast.error("Não foi possível atualizar o status.");
      return;
    }
    if (status === "concluido") {
      await supabase.from("payments").insert({
        studio_id: STUDIO_ID,
        appointment_id: a.id,
        client_id: a.client_id,
        amount: Number(a.price) - Number(a.discount),
        method: a.payment_method ?? "pix",
      });
    }
    toast.success("Status atualizado.");
    refresh();
  }

  async function createAppointment() {
    const service = (services ?? []).find((s) => s.id === form.serviceId);
    if (!service || form.name.trim().length < 2) {
      toast.error("Informe o nome e o serviço.");
      return;
    }
    const parts = form.time.split(":").map(Number);
    const start = new Date(day);
    start.setHours(parts[0] ?? 9, parts[1] ?? 0, 0, 0);
    const { error } = await supabase.from("appointments").insert({
      studio_id: STUDIO_ID,
      client_name: form.name.trim(),
      client_phone: form.phone.trim() || null,
      service_id: service.id,
      service_name: service.name,
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + service.duration_min * 60000).toISOString(),
      duration_min: service.duration_min,
      price: service.price,
      status: "confirmado" as const,
    });
    if (error) {
      toast.error(
        error.message.includes("appointments_no_overlap")
          ? "Já existe atendimento neste horário."
          : "Não foi possível criar o agendamento.",
      );
      return;
    }
    toast.success("Agendamento criado.");
    setOpen(false);
    setForm({ name: "", phone: "", serviceId: "", time: "09:00" });
    refresh();
  }

  function shiftDay(days: number) {
    const d = new Date(day);
    d.setDate(d.getDate() + days);
    setDay(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  return (
    <AdminShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl">Agenda</h1>
          <p className="mt-1 truncate text-sm capitalize text-muted-foreground">
            {day.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 rounded-full text-xs tracking-luxe">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Novo agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-name">Cliente</Label>
                <Input
                  id="a-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-phone">WhatsApp</Label>
                <Input
                  id="a-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Serviço</Label>
                <Select
                  value={form.serviceId}
                  onValueChange={(v) => setForm({ ...form, serviceId: v })}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(services ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} • {brl(s.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-time">Horário</Label>
                <Input
                  id="a-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <Button onClick={createAppointment} className="h-12 w-full rounded-full text-xs tracking-luxe">
                Criar agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendário mensal */}
      <div className="mt-5">
        <MonthCalendar
          month={viewMonth}
          onMonthChange={(m) => {
            setViewMonth(m);
          }}
          selected={day}
          dayMeta={dayMeta}
          onSelect={(d) => {
            setDay(d);
            setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
          }}
        />
      </div>

      {/* Navegação rápida do dia + lista */}
      <div className="mt-5 flex items-center gap-2">
        <button
          onClick={() => shiftDay(-1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="flex-1 text-center text-sm capitalize text-muted-foreground">
          {list.length === 0
            ? "Nenhum atendimento"
            : `${list.length} atendimento${list.length > 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => shiftDay(1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border"
          aria-label="Próximo dia"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum atendimento neste dia. Toque em um dia no calendário ou crie um novo.
          </p>
        )}
        {list.map((a) => (
          <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <span className="shrink-0 font-display text-xl">
                {new Date(a.starts_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-medium">{a.client_name}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {a.service_name} • {brl(Number(a.price) - Number(a.discount))}
                </p>
                {a.client_note && (
                  <p className="mt-1 text-xs italic text-muted-foreground">“{a.client_note}”</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] tracking-luxe",
                  STATUS_TONE[a.status],
                )}
              >
                {STATUS_LABEL[a.status]}
              </span>
              <Select value={a.status} onValueChange={(v) => setStatus(a, v as Appointment["status"])}>
                <SelectTrigger className="h-8 w-[10.5rem] rounded-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {a.client_phone && (
                <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(
                      a.client_phone,
                      WA_TEMPLATES.reminder(
                        a.client_name,
                        studio?.name ?? "TR Beauty Concept",
                        new Date(a.starts_at).toLocaleDateString("pt-BR"),
                        new Date(a.starts_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        a.service_name,
                      ),
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Lembrete
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
