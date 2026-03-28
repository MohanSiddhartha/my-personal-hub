INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vault-files', 'vault-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);