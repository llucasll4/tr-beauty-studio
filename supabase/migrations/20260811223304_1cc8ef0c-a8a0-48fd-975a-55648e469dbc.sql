CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE public.app_role AS ENUM ('admin','client');
CREATE TYPE public.appointment_status AS ENUM ('agendado','confirmado','concluido','cancelado','nao_compareceu');
CREATE TYPE public.coupon_type AS ENUM ('percent','fixed');

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- STUDIOS
CREATE TABLE public.studios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  professional_name text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  logo_url text,
  cover_url text,
  cancellation_policy text NOT NULL DEFAULT '',
  cancel_min_hours int NOT NULL DEFAULT 24,
  reschedule_min_hours int NOT NULL DEFAULT 24,
  client_can_cancel boolean NOT NULL DEFAULT true,
  buffer_minutes int NOT NULL DEFAULT 10,
  slot_step_minutes int NOT NULL DEFAULT 30,
  payment_methods text[] NOT NULL DEFAULT ARRAY['Pix','Dinheiro','Cartão de crédito','Cartão de débito','Outros'],
  loyalty_enabled boolean NOT NULL DEFAULT true,
  loyalty_target int NOT NULL DEFAULT 5,
  loyalty_benefit text NOT NULL DEFAULT 'Esmaltação em gel gratuita',
  loyalty_validity_days int NOT NULL DEFAULT 180,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id uuid REFERENCES public.studios(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  whatsapp text,
  instagram text,
  birth_date date,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  studio_id uuid REFERENCES public.studios(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.my_studio_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT studio_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_studio_admin(_studio uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = auth.uid() AND r.role = 'admin'
      AND (r.studio_id IS NULL OR r.studio_id = _studio)
  );
$$;

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Outros',
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_min int NOT NULL DEFAULT 60,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name text NOT NULL DEFAULT '',
  client_phone text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  service_name text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  duration_min int NOT NULL DEFAULT 60,
  price numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  coupon_code text,
  status public.appointment_status NOT NULL DEFAULT 'agendado',
  payment_method text,
  client_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
    studio_id WITH =, tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status <> 'cancelado' AND status <> 'nao_compareceu')
);
CREATE INDEX appointments_studio_start_idx ON public.appointments (studio_id, starts_at);
CREATE INDEX appointments_client_idx ON public.appointments (client_id);

-- INTERNAL NOTES (admin only)
CREATE TABLE public.internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- BUSINESS HOURS
CREATE TABLE public.business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  weekday int NOT NULL,
  active boolean NOT NULL DEFAULT true,
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '19:00',
  break_start time,
  break_end time,
  UNIQUE (studio_id, weekday)
);

-- BLOCKED TIMES
CREATE TABLE public.blocked_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text NOT NULL DEFAULT 'Horário bloqueado',
  all_day boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PORTFOLIO
CREATE TABLE public.portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.portfolio_categories(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- COUPONS
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  code text NOT NULL,
  type public.coupon_type NOT NULL DEFAULT 'percent',
  value numeric(10,2) NOT NULL DEFAULT 0,
  starts_on date,
  ends_on date,
  max_uses int,
  uses int NOT NULL DEFAULT 0,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (studio_id, code)
);

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_name text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'Pix',
  paid_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id uuid REFERENCES public.studios(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  audience text NOT NULL DEFAULT 'client',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS
GRANT SELECT ON public.studios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studios TO authenticated;
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.portfolio_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;
GRANT SELECT ON public.portfolio_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_categories TO authenticated;
GRANT SELECT ON public.business_hours TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_hours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_times TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.studios, public.profiles, public.user_roles, public.services,
  public.appointments, public.internal_notes, public.business_hours, public.blocked_times,
  public.portfolio_categories, public.portfolio_items, public.coupons, public.payments,
  public.notifications TO service_role;

-- RLS
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "studios public read" ON public.studios FOR SELECT USING (true);
CREATE POLICY "studios admin write" ON public.studios FOR UPDATE TO authenticated USING (public.is_studio_admin(id)) WITH CHECK (public.is_studio_admin(id));

CREATE POLICY "profiles own read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_studio_admin(studio_id));
CREATE POLICY "profiles own insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles own update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_studio_admin(studio_id)) WITH CHECK (id = auth.uid() OR public.is_studio_admin(studio_id));

CREATE POLICY "roles own read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "services public read active" ON public.services FOR SELECT USING (active = true OR public.is_studio_admin(studio_id));
CREATE POLICY "services admin all" ON public.services FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "hours public read" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "hours admin all" ON public.business_hours FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "blocked admin all" ON public.blocked_times FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "portfolio cat public read" ON public.portfolio_categories FOR SELECT USING (true);
CREATE POLICY "portfolio cat admin all" ON public.portfolio_categories FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));
CREATE POLICY "portfolio public read" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "portfolio admin all" ON public.portfolio_items FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "appointments own read" ON public.appointments FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_studio_admin(studio_id));
CREATE POLICY "appointments client insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK ((client_id = auth.uid() AND status = 'agendado') OR public.is_studio_admin(studio_id));
CREATE POLICY "appointments own update" ON public.appointments FOR UPDATE TO authenticated USING (client_id = auth.uid() OR public.is_studio_admin(studio_id)) WITH CHECK (client_id = auth.uid() OR public.is_studio_admin(studio_id));
CREATE POLICY "appointments admin delete" ON public.appointments FOR DELETE TO authenticated USING (public.is_studio_admin(studio_id));

CREATE POLICY "internal notes admin only" ON public.internal_notes FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));
CREATE POLICY "payments admin only" ON public.payments FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "coupons admin all" ON public.coupons FOR ALL TO authenticated USING (public.is_studio_admin(studio_id)) WITH CHECK (public.is_studio_admin(studio_id));

CREATE POLICY "notifications own read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR (audience = 'admin' AND public.is_studio_admin(studio_id)));
CREATE POLICY "notifications insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid() OR (audience = 'admin' AND public.is_studio_admin(studio_id))) WITH CHECK (true);

-- Client cancellation window enforcement
CREATE OR REPLACE FUNCTION public.enforce_client_appointment_rules() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE min_h int; can_cancel boolean;
BEGIN
  IF public.is_studio_admin(NEW.studio_id) THEN RETURN NEW; END IF;
  SELECT cancel_min_hours, client_can_cancel INTO min_h, can_cancel FROM public.studios WHERE id = NEW.studio_id;
  IF NEW.status <> OLD.status THEN
    IF NEW.status <> 'cancelado' THEN
      RAISE EXCEPTION 'Somente a administração pode alterar este status';
    END IF;
    IF NOT can_cancel THEN RAISE EXCEPTION 'Cancelamentos devem ser solicitados ao studio'; END IF;
    IF OLD.starts_at < now() + make_interval(hours => min_h) THEN
      RAISE EXCEPTION 'Cancelamento permitido somente com % horas de antecedência', min_h;
    END IF;
  END IF;
  IF NEW.price <> OLD.price OR NEW.starts_at <> OLD.starts_at OR NEW.service_id IS DISTINCT FROM OLD.service_id THEN
    RAISE EXCEPTION 'Alteração permitida somente pela administração';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER appointments_client_rules BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_appointment_rules();

-- Auto payment record when completed
CREATE OR REPLACE FUNCTION public.sync_payment_on_complete() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'concluido' THEN
    INSERT INTO public.payments (studio_id, appointment_id, client_id, service_name, amount, method, paid_at)
    VALUES (NEW.studio_id, NEW.id, NEW.client_id, NEW.service_name, GREATEST(NEW.price - NEW.discount, 0), COALESCE(NEW.payment_method,'Pix'), COALESCE(NEW.ends_at, now()))
    ON CONFLICT (appointment_id) DO UPDATE SET amount = EXCLUDED.amount, method = EXCLUDED.method, service_name = EXCLUDED.service_name;
  ELSE
    DELETE FROM public.payments WHERE appointment_id = NEW.id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER appointments_payment_sync AFTER INSERT OR UPDATE OF status, price, discount, payment_method ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.sync_payment_on_complete();

-- Availability (safe: only busy ranges, no client data)
CREATE OR REPLACE FUNCTION public.busy_ranges(_studio uuid, _from timestamptz, _to timestamptz)
RETURNS TABLE (starts_at timestamptz, ends_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.starts_at, a.ends_at FROM public.appointments a
   WHERE a.studio_id = _studio AND a.status NOT IN ('cancelado','nao_compareceu')
     AND a.starts_at < _to AND a.ends_at > _from
  UNION ALL
  SELECT b.starts_at, b.ends_at FROM public.blocked_times b
   WHERE b.studio_id = _studio AND b.starts_at < _to AND b.ends_at > _from;
$$;
GRANT EXECUTE ON FUNCTION public.busy_ranges(uuid, timestamptz, timestamptz) TO anon, authenticated;

-- New user handling: first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s uuid; has_admin boolean;
BEGIN
  SELECT id INTO s FROM public.studios ORDER BY created_at LIMIT 1;
  INSERT INTO public.profiles (id, studio_id, full_name, email, phone, whatsapp, birth_date)
  VALUES (NEW.id, s,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email,
    NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'birth_date','')::date);
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO has_admin;
  INSERT INTO public.user_roles (user_id, studio_id, role)
  VALUES (NEW.id, s, CASE WHEN has_admin THEN 'client'::public.app_role ELSE 'admin'::public.app_role END);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER studios_touch BEFORE UPDATE ON public.studios FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER services_touch BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED
INSERT INTO public.studios (id, slug, name, professional_name, tagline, subtitle, description, city, address, instagram, whatsapp, cancellation_policy)
VALUES ('11111111-1111-1111-1111-111111111111','thalitanaildesign','TR Beauty Concept','Thalita Rebeca | Nail Design',
 'Especialista em unhas naturais e elegantes','Acabamento fino • Alta durabilidade',
 'Studio de nail design com foco em unhas naturais, acabamento fino e alta durabilidade. Atendimento personalizado e biossegurança em cada detalhe.',
 'Diadema/SP','Diadema/SP','_thalitanaildesign','5511999999999',
 'Cancelamentos e reagendamentos devem ser realizados com pelo menos 24 horas de antecedência.');

INSERT INTO public.business_hours (studio_id, weekday, active, start_time, end_time, break_start, break_end) VALUES
 ('11111111-1111-1111-1111-111111111111',0,false,'09:00','18:00',NULL,NULL),
 ('11111111-1111-1111-1111-111111111111',1,true,'09:00','19:00','12:00','13:00'),
 ('11111111-1111-1111-1111-111111111111',2,true,'09:00','19:00','12:00','13:00'),
 ('11111111-1111-1111-1111-111111111111',3,true,'09:00','19:00','12:00','13:00'),
 ('11111111-1111-1111-1111-111111111111',4,true,'09:00','19:00','12:00','13:00'),
 ('11111111-1111-1111-1111-111111111111',5,true,'09:00','19:00','12:00','13:00'),
 ('11111111-1111-1111-1111-111111111111',6,true,'09:00','16:00',NULL,NULL);

INSERT INTO public.services (studio_id, name, description, category, price, duration_min, sort_order) VALUES
 ('11111111-1111-1111-1111-111111111111','Alongamento em fibra','Alongamento natural com acabamento fino e alta durabilidade.','Alongamento',180.00,150,1),
 ('11111111-1111-1111-1111-111111111111','Manutenção de alongamento','Manutenção completa com refinamento de estrutura e nova esmaltação.','Manutenção',140.00,120,2),
 ('11111111-1111-1111-1111-111111111111','Banho de gel','Fortalecimento das unhas naturais com brilho e resistência.','Banho de gel',120.00,90,3),
 ('11111111-1111-1111-1111-111111111111','Esmaltação em gel','Esmaltação duradoura com acabamento impecável.','Esmaltação',90.00,60,4),
 ('11111111-1111-1111-1111-111111111111','Blindagem','Proteção das unhas naturais para crescimento saudável.','Blindagem',100.00,75,5),
 ('11111111-1111-1111-1111-111111111111','Nail Art','Detalhes artísticos personalizados, do minimalista ao elaborado.','Nail Art',40.00,30,6),
 ('11111111-1111-1111-1111-111111111111','Remoção','Remoção segura preservando a saúde da unha natural.','Remoção',50.00,45,7);

INSERT INTO public.portfolio_categories (studio_id, name, sort_order) VALUES
 ('11111111-1111-1111-1111-111111111111','Resultados',1),
 ('11111111-1111-1111-1111-111111111111','Unhas naturais',2),
 ('11111111-1111-1111-1111-111111111111','Nail Art',3),
 ('11111111-1111-1111-1111-111111111111','Serviços',4),
 ('11111111-1111-1111-1111-111111111111','Experiências',5),
 ('11111111-1111-1111-1111-111111111111','Biossegurança',6);