import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/studio/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { blockedTimesQuery, businessHoursQuery, type BusinessHour } from "@/lib/data";
import { STUDIO_ID, WEEKDAYS } from "@/lib/studio";

export const Route = createFileRoute("/_authenticated/admin/horarios")({
  head: () => ({
    meta: [
      { title: "Horários | Painel TR Beauty Concept" },
      { name: "description", content: "Defina os dias e horários de atendimento e bloqueios da agenda." },
      { property: "og:title", content: "Horários | Painel TR Beauty Concept" },
      { property: "og:description", content: "Gestão de horários do studio." },
    ],
  }),
  component: AdminHours,
});

type Blocked = { id: string; starts_at: string; ends_at: string; reason: string | null };

function AdminHours() {
  const qc = useQueryClient();
  const { data: hours } = useQuery(businessHoursQuery);
  const { data: blocked } = useQuery(blockedTimesQuery);
  const [rows, setRows] = useState<BusinessHour[]>([]);
  const [block, setBlock] = useState({ date: "", start: "09:00", end: "18:00", reason: "" });

  useEffect(() => {
    if (hours) setRows(hours);
  }, [hours]);

  function update(id: string, patch: Partial<BusinessHour>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveRow(row: BusinessHour) {
    const { error } = await supabase
      .from("business_hours")
      .update({
        active: row.active,
        start_time: row.start_time,
        end_time: row.end_time,
        break_start: row.break_start || null,
        break_end: row.break_end || null,
      })
      .eq("id", row.id);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success(`${WEEKDAYS[row.weekday]} atualizado.`);
    void qc.invalidateQueries({ queryKey: ["business_hours"] });
  }

  async function addBlock() {
    if (!block.date) {
      toast.error("Escolha a data do bloqueio.");
      return;
    }
    const [y, m, d] = block.date.split("-").map(Number);
    const [sh, sm] = block.start.split(":").map(Number);
    const [eh, em] = block.end.split(":").map(Number);
    const starts = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, sh ?? 0, sm ?? 0);
    const ends = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1, eh ?? 0, em ?? 0);
    if (ends <= starts) {
      toast.error("O fim precisa ser depois do início.");
      return;
    }
    const reason = block.reason.trim();
    const { error } = await supabase.from("blocked_times").insert({
      studio_id: STUDIO_ID,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      ...(reason ? { reason } : {}),
    });
    if (error) {
      toast.error("Não foi possível criar o bloqueio.");
      return;
    }
    toast.success("Bloqueio criado.");
    setBlock({ date: "", start: "09:00", end: "18:00", reason: "" });
    void qc.invalidateQueries({ queryKey: ["blocked_times"] });
  }

  async function removeBlock(id: string) {
    await supabase.from("blocked_times").delete().eq("id", id);
    void qc.invalidateQueries({ queryKey: ["blocked_times"] });
  }

  return (
    <AdminShell>
      <h1 className="font-display text-3xl">Horários</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure a semana de atendimento e bloqueie períodos específicos.
      </p>

      <section className="mt-6 space-y-3">
        {rows.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate font-display text-lg">{WEEKDAYS[r.weekday]}</h2>
              <Switch
                checked={r.active}
                onCheckedChange={(v) => update(r.id, { active: v })}
                className="shrink-0"
              />
            </div>
            {r.active && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <TimeField
                  id={`${r.id}-start`}
                  label="Abre"
                  value={r.start_time.slice(0, 5)}
                  onChange={(v) => update(r.id, { start_time: v })}
                />
                <TimeField
                  id={`${r.id}-end`}
                  label="Fecha"
                  value={r.end_time.slice(0, 5)}
                  onChange={(v) => update(r.id, { end_time: v })}
                />
                <TimeField
                  id={`${r.id}-bs`}
                  label="Intervalo início"
                  value={(r.break_start ?? "").slice(0, 5)}
                  onChange={(v) => update(r.id, { break_start: v })}
                />
                <TimeField
                  id={`${r.id}-be`}
                  label="Intervalo fim"
                  value={(r.break_end ?? "").slice(0, 5)}
                  onChange={(v) => update(r.id, { break_end: v })}
                />
              </div>
            )}
            <Button
              size="sm"
              onClick={() => saveRow(r)}
              className="mt-3 rounded-full text-xs tracking-luxe"
            >
              Salvar
            </Button>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl">Bloqueios</h2>
        <div className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bl-date">Data</Label>
              <Input
                id="bl-date"
                type="date"
                value={block.date}
                onChange={(e) => setBlock({ ...block, date: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bl-reason">Motivo</Label>
              <Input
                id="bl-reason"
                value={block.reason}
                onChange={(e) => setBlock({ ...block, reason: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <TimeField
              id="bl-start"
              label="Início"
              value={block.start}
              onChange={(v) => setBlock({ ...block, start: v })}
            />
            <TimeField
              id="bl-end"
              label="Fim"
              value={block.end}
              onChange={(v) => setBlock({ ...block, end: v })}
            />
          </div>
          <Button onClick={addBlock} className="h-11 w-full rounded-full text-xs tracking-luxe">
            <Plus className="h-4 w-4" /> Adicionar bloqueio
          </Button>
        </div>

        <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
          {((blocked ?? []) as unknown as Blocked[]).length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>
          )}
          {((blocked ?? []) as unknown as Blocked[]).map((b) => (
            <div key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
              <span className="min-w-0">
                <span className="block truncate text-sm">
                  {new Date(b.starts_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  →{" "}
                  {new Date(b.ends_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {b.reason ?? "Sem motivo informado"}
                </span>
              </span>
              <button
                onClick={() => removeBlock(b.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground"
                aria-label="Remover bloqueio"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function TimeField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl"
      />
    </div>
  );
}
