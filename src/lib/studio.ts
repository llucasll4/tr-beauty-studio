export const STUDIO_ID = "11111111-1111-1111-1111-111111111111";

export const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não compareceu",
};

export const STATUS_TONE: Record<string, string> = {
  agendado: "bg-secondary text-secondary-foreground",
  confirmado: "bg-accent text-accent-foreground",
  concluido: "bg-primary text-primary-foreground",
  cancelado: "bg-muted text-muted-foreground line-through",
  nao_compareceu: "bg-destructive/10 text-destructive",
};

export const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export function brl(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function digits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function whatsappLink(phone: string | null | undefined, message: string) {
  const raw = digits(phone);
  const number = raw.length <= 11 ? `55${raw}` : raw;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function instagramLink(handle: string | null | undefined) {
  return `https://instagram.com/${(handle ?? "").replace(/^@/, "")}`;
}

export function minutesToLabel(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}h${String(m).padStart(2, "0")}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export const WA_TEMPLATES = {
  newBooking: (studio: string) =>
    `Olá, Thalita! Gostaria de agendar um horário no ${studio}.`,
  confirmation: (name: string, studio: string, date: string, time: string, service: string) =>
    `Olá, ${name}! 💅 Seu horário no ${studio} está confirmado para ${date} às ${time}. Serviço: ${service}. Te esperamos!`,
  reminder: (name: string, studio: string, date: string, time: string, service: string) =>
    `Olá, ${name}! 💅 Passando para lembrar do seu horário no ${studio} em ${date} às ${time}. Serviço: ${service}. Até logo!`,
  reschedule: (name: string, studio: string) =>
    `Olá, ${name}! Precisamos reagendar seu horário no ${studio}. Qual dia e horário ficam melhores para você?`,
  cancellation: (name: string, studio: string, date: string, time: string) =>
    `Olá, ${name}! Seu horário no ${studio} em ${date} às ${time} foi cancelado. Se quiser, já podemos escolher uma nova data.`,
  afterCare: (name: string, studio: string) =>
    `Oi, ${name}! 💕 Como estão suas unhas? Qualquer dúvida sobre os cuidados, é só me chamar. Obrigada por confiar no ${studio}!`,
  birthday: (name: string, studio: string) =>
    `Oi, ${name}! 💕 Feliz aniversário! Para comemorar seu dia, o ${studio} preparou uma condição especial para você.`,
  comeback: (name: string, studio: string) =>
    `Oi, ${name}! Saudades de você por aqui 💅 Quer garantir um horário no ${studio} nesta semana?`,
};

export function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}
