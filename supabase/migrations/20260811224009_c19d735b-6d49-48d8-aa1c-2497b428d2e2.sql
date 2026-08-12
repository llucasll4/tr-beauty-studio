REVOKE EXECUTE ON FUNCTION public.enforce_booking_insert() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.coupon_discount(uuid, text, uuid, numeric) FROM public, anon;