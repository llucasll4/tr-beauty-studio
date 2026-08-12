-- Garante que o bucket de imagens do Studio exista
-- e fique público para exibição das fotos do portfólio.

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio', 'studio', true)
ON CONFLICT (id) DO UPDATE
SET public = true;


-- Política de leitura das imagens do Studio

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'studio media read'
  ) THEN

    CREATE POLICY "studio media read"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'studio');

  END IF;


-- Permitir upload somente para ADMIN

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'studio media admin insert'
  ) THEN

    CREATE POLICY "studio media admin insert"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'studio'
        AND public.is_admin()
      );

  END IF;


-- Permitir alteração somente para ADMIN

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'studio media admin update'
  ) THEN

    CREATE POLICY "studio media admin update"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'studio'
        AND public.is_admin()
      )
      WITH CHECK (
        bucket_id = 'studio'
        AND public.is_admin()
      );

  END IF;


-- Permitir exclusão somente para ADMIN

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'studio media admin delete'
  ) THEN

    CREATE POLICY "studio media admin delete"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'studio'
        AND public.is_admin()
      );

  END IF;

END $$;
