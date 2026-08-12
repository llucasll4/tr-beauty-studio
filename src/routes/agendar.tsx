import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  MapPin,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ClientShell } from "@/components/studio/ClientShell";
import { MonthCalendar } from "@/components/studio/MonthCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { availableSlots, slotLabel } from "@/lib/availability";
import { businessHoursQuery, servicesQuery, studioQuery, type Service } from "@/lib/data";
import { brl, dateKey, minutesToLabel, STUDIO_ID, WA_TEMPLATES, whatsappLink } from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar horário | TR Beauty Concept" },
      {
        name: "description",
        content:
          "Escolha o serviço, o dia e o horário disponível e garanta seu atendimento no studio TR Beauty Concept em Diadema/SP.",
      },
      { property: "og:title", content: "Agendar horário | TR Beauty Concept" },
      { property: "og:description", content: "Agendamento online rápido e simples." },
    ],
  }),
  component: BookingPage,
});

function icsHref(title: string, start: Date, end: Date, location: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

function BookingPage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { data: studio } = useQuery(studioQuery);
  const { data: services } = useQuery(servicesQuery());
  const { data: hours } = useQuery(businessHoursQuery);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ startsAt: Date; endsAt: Date; price: number; discount: number } | null>(
    null,
  );

  useEffect(() => {
    if (profile) {
      setName((n) => n || profile.full_name);
      setPhone((p) => p || profile.whatsapp || profile.phone || "");
    }
  }, [profile]);

  const dayMeta = useMemo(() => {
    const meta: Record<string, { closed?: boolean }> = {};
    if (!hours) return meta;
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const config = hours.find((h) => h.weekday === d.getDay());
      if (!config?.active) {
        meta[dateKey(d)] = { closed: true };
      }
    }
    return meta;
  }, [hours, viewMonth]);

  const slotsQuery = useQuery({
    queryKey: ["slots", service?.id, day ? dateKey(day) : null],
    enabled: !!service && !!day && !!studio && !!hours,
    queryFn: () =>
      availableSlots({
        day: day!,
        durationMin: service!.duration_min,
        studio: studio!,
        hours: hours!,
      }),
  });

  async function confirm() {
    if (!service || !slot) return;
    if (!user) {
      void navigate({ to: "/auth", search: { redirect: "/agendar" } });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        studio_id: STUDIO_ID,
        client_id: user.id,
        client_name: name.trim(),
        client_phone: phone.trim(),
        service_id: service.id,
        service_name: service.name,
        starts_at: slot.toISOString(),
        ends_at: new Date(slot.getTime() + service.duration_min * 60000).toISOString(),
        duration_min: service.duration_min,
        price: service.price,
        coupon_code: coupon.trim() || null,
        client_note: note.trim() || null,
        status: "agendado" as const,
      })
      .select("*")
      .single();
    setSaving(false);

    if (error) {
      toast.error(
        error.message.includes("appointments_no_overlap")
          ? "Este horário acabou de ser reservado. Escolha outro."
          : "Não foi possível concluir o agendamento.",
      );
      void slotsQuery.refetch();
      return;
    }

    await supabase.from("profiles").update({ full_name: name.trim(), whatsapp: phone.trim() }).eq("id", user.id);
    await supabase.from("notifications").insert({
      studio_id: STUDIO_ID,
      audience: "admin",
      title: "Novo agendamento",
      body: `${name.trim()} • ${service.name} • ${slot.toLocaleString("pt-BR")}`,
    });

    setDone({
      startsAt: new Date(data.starts_at),
      endsAt: new Date(data.ends_at),
      price: Number(data.price),
      discount: Number(data.discount),
    });
    setStep(6);
  }

  if (done) {
    const total = done.price - done.discount;
    return (
      <ClientShell>
        <div className="mx-auto max-w-md rounded-3xl bg-cream p-7 text-center shadow-soft">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-gradient">
            <Check className="h-6 w-6 text-espresso" />
          </span>
          <h1 className="mt-4 font-display text-2xl">Agendamento confirmado! 💅</h1>
          <div className="mt-6 space-y-2 rounded-2xl border border-border bg-card p-5 text-left text-sm">
            <Row label="Serviço" value={service?.name ?? ""} />
            <Row
              label="Data"
              value={done.startsAt.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            />
            <Row label="Horário" value={slotLabel(done.startsAt)} />
            <Row label="Duração" value={minutesToLabel(service?.duration_min ?? 0)} />
            {done.discount > 0 && <Row label="Desconto" value={`- ${brl(done.discount)}`} />}
            <Row label="Valor" value={brl(total)} />
            <Row label="Endereço" value={studio?.address ?? "Diadema/SP"} />
          </div>
          <div className="mt-5 space-y-2.5">
            <Button asChild variant="outline" className="h-11 w-full rounded-full bg-card text-xs">
              <a
                href={icsHref(
                  `${service?.name} • ${studio?.name}`,
                  done.startsAt,
                  done.endsAt,
                  studio?.address ?? "Diadema/SP",
                )}
                download="agendamento.ics"
              >
                <CalendarPlus className="h-4 w-4" /> Adicionar ao calendário
              </a>
            </Button>
            <Button asChild className="h-11 w-full rounded-full text-xs tracking-luxe">
              <a
                target="_blank"
                rel="noreferrer"
                href={whatsappLink(
                  studio?.whatsapp,
                  WA_TEMPLATES.confirmation(
                    name,
                    studio?.name ?? "TR Beauty Concept",
                    done.startsAt.toLocaleDateString("pt-BR"),
                    slotLabel(done.startsAt),
                    service?.name ?? "",
                  ),
                )}
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            </Button>
            <Button asChild variant="ghost" className="h-11 w-full rounded-full text-xs tracking-luxe">
              <Link to="/meus-horarios">Ver meus horários</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{studio?.cancellation_policy}</p>
        </div>
      </ClientShell>
    );
  }

  return (
    <ClientShell>
      <div className="mx-auto max-w-lg">
        <header className="mb-5 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] tracking-luxe text-gold">Etapa {step} de 5</p>
            <h1 className="truncate font-display text-2xl">
              {step === 1 && "Escolha o serviço"}
              {step === 2 && "Escolha a data"}
              {step === 3 && "Horários disponíveis"}
              {step === 4 && "Seus dados"}
              {step === 5 && "Confirmar agendamento"}
            </h1>
          </div>
        </header>

        <div className="mb-6 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={cn("h-1 flex-1 rounded-full bg-border", i <= step && "bg-gold")}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-2.5">
            {(services ?? []).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setService(s);
                  setSlot(null);
                  setStep(2);
                }}
                className={cn(
                  "w-full rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-gold",
                  service?.id === s.id && "border-gold",
                )}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg">{s.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                    <p className="mt-2 text-[11px] tracking-luxe text-muted-foreground">
                      {minutesToLabel(s.duration_min)}
                    </p>
                  </div>
                  <span className="shrink-0 font-display text-lg text-gold">{brl(s.price)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <MonthCalendar
              month={viewMonth}
              onMonthChange={setViewMonth}
              selected={day}
              disablePast
              dayMeta={dayMeta}
              onSelect={(d) => {
                setDay(d);
                setSlot(null);
                setStep(3);
              }}
            />
            <p className="text-center text-xs text-muted-foreground">
              Dias riscados estão fechados. Escolha um dia disponível.
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              {day?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} •{" "}
              {service?.name}
            </p>
            {slotsQuery.isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Carregando horários…</p>
            ) : (slotsQuery.data ?? []).length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum horário disponível neste dia. Escolha outra data.
                </p>
                <Button variant="ghost" className="mt-3 rounded-full text-xs" onClick={() => setStep(2)}>
                  Escolher outra data
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(slotsQuery.data ?? []).map((s) => (
                  <button
                    key={s.toISOString()}
                    onClick={() => {
                      setSlot(s);
                      setStep(4);
                    }}
                    className={cn(
                      "rounded-xl border border-border bg-card py-3 text-sm shadow-soft",
                      slot?.getTime() === s.getTime() && "border-gold",
                    )}
                  >
                    {slotLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-name">Nome</Label>
              <Input
                id="b-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-phone">WhatsApp</Label>
              <Input
                id="b-phone"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-coupon">Cupom (opcional)</Label>
              <Input
                id="b-coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-note">Observação (opcional)</Label>
              <Textarea
                id="b-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={400}
                className="rounded-xl"
              />
            </div>
            <Button
              className="h-12 w-full rounded-full text-xs tracking-luxe"
              disabled={name.trim().length < 2 || phone.trim().length < 8}
              onClick={() => setStep(5)}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm shadow-soft">
              <Row label="Serviço" value={service?.name ?? ""} />
              <Row
                label="Data"
                value={
                  slot?.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  }) ?? ""
                }
              />
              <Row label="Horário" value={slot ? slotLabel(slot) : ""} />
              <Row label="Duração" value={minutesToLabel(service?.duration_min ?? 0)} />
              <Row label="Valor" value={brl(service?.price ?? 0)} />
              <Row label="Cliente" value={name} />
              <Row label="WhatsApp" value={phone} />
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
              {studio?.address} • {studio?.cancellation_policy}
            </p>
            {!user && !loading && (
              <p className="mt-4 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
                Para confirmar, entre na sua conta ou crie uma em poucos segundos.
              </p>
            )}
            <Button
              className="mt-5 h-12 w-full rounded-full text-xs tracking-luxe"
              disabled={saving}
              onClick={confirm}
            >
              <Sparkles className="h-4 w-4" />
              {user ? "Confirmar agendamento" : "Entrar e confirmar"}
            </Button>
          </div>
        )}
      </div>
    </ClientShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-3">
      <span className="text-[10px] tracking-luxe text-muted-foreground">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  );
}
