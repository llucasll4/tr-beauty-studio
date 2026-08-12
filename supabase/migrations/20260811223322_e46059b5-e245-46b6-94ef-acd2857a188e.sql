REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_studio_admin(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.my_studio_id() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_payment_on_complete() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_client_appointment_rules() FROM public, anon, authenticated;