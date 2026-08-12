-- ============================================================
-- Promover uma conta para ADMIN
-- Use no SQL Editor do Supabase (Dashboard → SQL Editor)
-- ============================================================

-- 1) Ver usuários e papéis atuais
SELECT
  u.email,
  u.created_at,
  r.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at;

-- 2) Promover um e-mail específico para ADMIN
--    Troque o e-mail abaixo pelo da Thalita / da conta admin
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'SEU-EMAIL@exemplo.com'
);

-- 3) Se a linha de user_roles não existir, criar como admin:
-- INSERT INTO public.user_roles (user_id, studio_id, role)
-- SELECT id, '11111111-1111-1111-1111-111111111111', 'admin'
-- FROM auth.users WHERE email = 'SEU-EMAIL@exemplo.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
