import { supabase } from "@/integrations/supabase/client";
import { STUDIO_ID } from "./studio";

export type Studio = {
  id: string;
  slug: string;
  name: string;
  professional_name: string;
  tagline: string;
  subtitle: string;
  description: string;
  city: string;
  address: string;
  instagram: string;
  whatsapp: string;
  logo_url: string | null;
  cover_url: string | null;
  cancellation_policy: string;
  cancel_min_hours: number;
  reschedule_min_hours: number;
  client_can_cancel: boolean;
  buffer_minutes: number;
  slot_step_minutes: number;
  payment_methods: string[];
  loyalty_enabled: boolean;
  loyalty_target: number;
  loyalty_benefit: string;
  loyalty_validity_days: number;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration_min: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type Appointment = {
  id: string;
  studio_id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  service_id: string | null;
  service_name: string;
  starts_at: string;
  ends_at: string;
  duration_min: number;
  price: number;
  discount: number;
  coupon_code: string | null;
  status: "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu";
  payment_method: string | null;
  client_note: string | null;
};

export type BusinessHour = {
  id: string;
  weekday: number;
  active: boolean;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
};

export type PortfolioItem = {
  id: string;
  category_id: string | null;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
};

export const studioQuery = {
  queryKey: ["studio"],
  queryFn: async (): Promise<Studio> => {
    const { data, error } = await supabase.from("studios").select("*").eq("id", STUDIO_ID).single();
    if (error) throw error;
    return data as unknown as Studio;
  },
};

export const servicesQuery = (adminView = false) => ({
  queryKey: ["services", adminView],
  queryFn: async (): Promise<Service[]> => {
    let q = supabase.from("services").select("*").eq("studio_id", STUDIO_ID).order("sort_order");
    if (!adminView) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Service[];
  },
});

export const portfolioQuery = {
  queryKey: ["portfolio"],
  queryFn: async () => {
    const [items, cats] = await Promise.all([
      supabase
        .from("portfolio_items")
        .select("*")
        .eq("studio_id", STUDIO_ID)
        .order("sort_order"),
      supabase
        .from("portfolio_categories")
        .select("*")
        .eq("studio_id", STUDIO_ID)
        .order("sort_order"),
    ]);
    if (items.error) throw items.error;
    if (cats.error) throw cats.error;
    return {
      items: (items.data ?? []) as unknown as PortfolioItem[],
      categories: (cats.data ?? []) as unknown as { id: string; name: string; sort_order: number }[],
    };
  },
};

export const businessHoursQuery = {
  queryKey: ["business_hours"],
  queryFn: async (): Promise<BusinessHour[]> => {
    const { data, error } = await supabase
      .from("business_hours")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("weekday");
    if (error) throw error;
    return (data ?? []) as unknown as BusinessHour[];
  },
};

export const myAppointmentsQuery = (userId: string | undefined) => ({
  queryKey: ["my-appointments", userId],
  enabled: !!userId,
  queryFn: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", userId!)
      .order("starts_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Appointment[];
  },
});

export const appointmentsRangeQuery = (fromIso: string, toIso: string) => ({
  queryKey: ["appointments", fromIso, toIso],
  queryFn: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .gte("starts_at", fromIso)
      .lt("starts_at", toIso)
      .order("starts_at");
    if (error) throw error;
    return (data ?? []) as unknown as Appointment[];
  },
});

export const allAppointmentsQuery = {
  queryKey: ["appointments-all"],
  queryFn: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("starts_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Appointment[];
  },
};

export const clientsQuery = {
  queryKey: ["clients"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("full_name");
    if (error) throw error;
    return data ?? [];
  },
};

export const paymentsQuery = {
  queryKey: ["payments"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("paid_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const blockedTimesQuery = {
  queryKey: ["blocked_times"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("blocked_times")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("starts_at");
    if (error) throw error;
    return data ?? [];
  },
};

export const couponsQuery = {
  queryKey: ["coupons"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("studio_id", STUDIO_ID)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export async function fetchBusyRanges(fromIso: string, toIso: string) {
  const { data, error } = await supabase.rpc("busy_ranges", {
    _studio: STUDIO_ID,
    _from: fromIso,
    _to: toIso,
  });
  if (error) throw error;
  return (data ?? []) as { starts_at: string; ends_at: string }[];
}
