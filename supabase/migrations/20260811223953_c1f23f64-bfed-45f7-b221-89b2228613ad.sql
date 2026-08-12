CREATE OR REPLACE FUNCTION public.coupon_discount(_studio uuid, _code text, _service uuid, _amount numeric)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.coupons;
BEGIN
  IF _code IS NULL OR btrim(_code) = '' THEN RETURN 0; END IF;
  SELECT * INTO c FROM public.coupons
   WHERE studio_id = _studio AND upper(code) = upper(btrim(_code)) AND active = true;
  IF NOT FOUND THEN RETURN 0; END IF;
  IF c.starts_on IS NOT NULL AND c.starts_on > current_date THEN RETURN 0; END IF;
  IF c.ends_on IS NOT NULL AND c.ends_on < current_date THEN RETURN 0; END IF;
  IF c.max_uses IS NOT NULL AND c.uses >= c.max_uses THEN RETURN 0; END IF;
  IF c.service_id IS NOT NULL AND c.service_id <> _service THEN RETURN 0; END IF;
  IF c.type = 'percent' THEN RETURN round(_amount * c.value / 100, 2); END IF;
  RETURN LEAST(c.value, _amount);
END; $$;
GRANT EXECUTE ON FUNCTION public.coupon_discount(uuid, text, uuid, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_booking_insert() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s public.services; d numeric;
BEGIN
  IF NEW.starts_at < now() THEN
    RAISE EXCEPTION 'Não é possível agendar em um horário que já passou';
  END IF;
  IF public.is_studio_admin(NEW.studio_id) THEN
    IF NEW.ends_at IS NULL OR NEW.ends_at <= NEW.starts_at THEN
      NEW.ends_at := NEW.starts_at + make_interval(mins => COALESCE(NEW.duration_min, 60));
    END IF;
    RETURN NEW;
  END IF;

  NEW.client_id := auth.uid();
  NEW.status := 'agendado';
  NEW.payment_method := NULL;
  SELECT * INTO s FROM public.services WHERE id = NEW.service_id AND studio_id = NEW.studio_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Serviço indisponível'; END IF;
  NEW.service_name := s.name;
  NEW.price := s.price;
  NEW.duration_min := s.duration_min;
  NEW.ends_at := NEW.starts_at + make_interval(mins => s.duration_min);
  d := public.coupon_discount(NEW.studio_id, NEW.coupon_code, s.id, s.price);
  NEW.discount := d;
  IF d = 0 THEN NEW.coupon_code := NULL; END IF;
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE public.coupons SET uses = uses + 1
     WHERE studio_id = NEW.studio_id AND upper(code) = upper(btrim(NEW.coupon_code));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER appointments_booking_guard BEFORE INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_insert();