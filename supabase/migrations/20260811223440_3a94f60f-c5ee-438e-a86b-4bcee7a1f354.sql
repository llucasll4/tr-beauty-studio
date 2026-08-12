CREATE POLICY "studio media read" ON storage.objects FOR SELECT USING (bucket_id = 'studio');
CREATE POLICY "studio media admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'studio' AND public.is_admin());
CREATE POLICY "studio media admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'studio' AND public.is_admin()) WITH CHECK (bucket_id = 'studio' AND public.is_admin());
CREATE POLICY "studio media admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'studio' AND public.is_admin());

INSERT INTO public.portfolio_items (studio_id, category_id, title, description, image_url, sort_order)
SELECT '11111111-1111-1111-1111-111111111111', c.id, v.title, v.descr, v.img, v.ord
FROM (VALUES
  ('Nude atemporal','Alongamento em fibra com acabamento fino','/portfolio/1.jpg','Resultados',1),
  ('Francesinha leitosa','Clássico moderno com alta durabilidade','/portfolio/2.jpg','Unhas naturais',2),
  ('Detalhe dourado','Nail art minimalista com fio champagne','/portfolio/3.jpg','Nail Art',3),
  ('Produtos premium','Materiais selecionados para cada atendimento','/portfolio/4.jpg','Serviços',4),
  ('Biossegurança','Instrumentais esterilizados e descartáveis','/portfolio/5.jpg','Biossegurança',5),
  ('Nosso espaço','Ambiente acolhedor e reservado','/portfolio/6.jpg','Experiências',6)
) AS v(title, descr, img, cat, ord)
JOIN public.portfolio_categories c ON c.name = v.cat AND c.studio_id = '11111111-1111-1111-1111-111111111111';