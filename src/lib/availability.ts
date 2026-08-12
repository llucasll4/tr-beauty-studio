import type { BusinessHour, Studio } from "./data";
import { fetchBusyRanges } from "./data";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function slotLabel(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export async function availableSlots(opts: {
  day: Date;
  durationMin: number;
  studio: Studio;
  hours: BusinessHour[];
}): Promise<Date[]> {
  const { day, durationMin, studio, hours } = opts;
  const config = hours.find((h) => h.weekday === day.getDay());
  if (!config || !config.active) return [];

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const busy = await fetchBusyRanges(dayStart.toISOString(), dayEnd.toISOString());
  const busyRanges: { start: number; end: number }[] = busy.map((b) => ({
    start: new Date(b.starts_at).getTime(),
    end: new Date(b.ends_at).getTime(),
  }));

  const step = studio.slot_step_minutes || 30;
  const buffer = studio.buffer_minutes || 0;
  const open = timeToMinutes(config.start_time);
  const close = timeToMinutes(config.end_time);
  const breakStart = config.break_start ? timeToMinutes(config.break_start) : null;
  const breakEnd = config.break_end ? timeToMinutes(config.break_end) : null;

  const slots: Date[] = [];
  const now = Date.now();

  for (let m = open; m + durationMin <= close; m += step) {
    if (breakStart !== null && breakEnd !== null && m < breakEnd && m + durationMin > breakStart) {
      continue;
    }
    const start = new Date(dayStart);
    start.setMinutes(m);
    const startMs = start.getTime();
    const endMs = startMs + durationMin * 60000;
    if (startMs < now + 60 * 60000) continue;

    const overlaps = busyRanges.some(
      (r) => startMs < r.end + buffer * 60000 && endMs + buffer * 60000 > r.start,
    );
    if (!overlaps) slots.push(start);
  }
  return slots;
}
