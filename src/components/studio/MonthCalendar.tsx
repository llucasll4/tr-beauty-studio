import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateKey } from "@/lib/studio";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export type DayMeta = {
  /** Quantidade de atendimentos (admin) */
  count?: number;
  /** Dia fechado / sem expediente */
  closed?: boolean;
  /** Sem horários livres (cliente) */
  unavailable?: boolean;
};

type MonthCalendarProps = {
  /** Mês visível (qualquer dia do mês) */
  month: Date;
  onMonthChange: (month: Date) => void;
  /** Dia selecionado */
  selected?: Date | null;
  onSelect: (day: Date) => void;
  /** Metadados por dia (chave YYYY-MM-DD) */
  dayMeta?: Record<string, DayMeta>;
  /** Não permite selecionar dias anteriores a hoje */
  disablePast?: boolean;
  className?: string;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBeforeToday(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x < today;
}

export function MonthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  dayMeta = {},
  disablePast = false,
  className,
}: MonthCalendarProps) {
  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const startPad = first.getDay(); // 0 = domingo
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const total = Math.ceil((startPad + daysInMonth) / 7) * 7;
    const list: (Date | null)[] = [];
    for (let i = 0; i < total; i++) {
      const dayNum = i - startPad + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        list.push(null);
      } else {
        list.push(new Date(month.getFullYear(), month.getMonth(), dayNum));
      }
    }
    return list;
  }, [month]);

  const title = month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className={cn("rounded-3xl border border-border bg-card p-4 shadow-soft", className)}>
      {/* Cabeçalho do mês */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background transition-colors hover:border-gold"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl capitalize tracking-tight text-foreground">{title}</h2>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background transition-colors hover:border-gold"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="py-1 text-center text-[10px] font-medium tracking-luxe text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const key = dateKey(d);
          const meta = dayMeta[key] ?? {};
          const past = disablePast && isBeforeToday(d);
          const closed = !!meta.closed;
          const disabled = past || closed;
          const isSelected = selected ? isSameDay(selected, d) : false;
          const isToday = isSameDay(d, new Date());
          const count = meta.count ?? 0;

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm transition-all",
                "border-transparent bg-background/60 hover:border-gold/50 hover:bg-secondary/40",
                isToday && !isSelected && "border-border bg-secondary/50",
                isSelected && "border-gold bg-gold-gradient text-espresso shadow-soft",
                disabled && "cursor-not-allowed opacity-35 hover:border-transparent hover:bg-background/60",
                closed && !past && "line-through",
              )}
            >
              <span
                className={cn(
                  "font-display text-base leading-none",
                  isSelected && "text-espresso",
                )}
              >
                {d.getDate()}
              </span>
              {/* Indicador de atendimentos (admin) */}
              {count > 0 && (
                <span
                  className={cn(
                    "mt-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-medium",
                    isSelected
                      ? "bg-espresso/15 text-espresso"
                      : "bg-gold/20 text-gold",
                  )}
                >
                  {count}
                </span>
              )}
              {/* Ponto sutil quando há algo e não mostramos número */}
              {count === 0 && meta.unavailable && !disabled && (
                <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/40" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] tracking-luxe text-muted-foreground">
        Use as setas para mudar o mês
      </p>
    </div>
  );
}
