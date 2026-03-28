-- ══════════════════════════════════════════════════════
-- VibeBites – Storage Buckets & Policies
-- ══════════════════════════════════════════════════════

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('recipe-media',   'recipe-media',   true),
  ('avatars',        'avatars',        true),
  ('comment-photos', 'comment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════ RECIPE MEDIA ═══════════════
CREATE POLICY "Anyone can view recipe media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-media');

CREATE POLICY "Authenticated users can upload recipe media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own recipe media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════ AVATARS ═══════════════
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════ COMMENT PHOTOS ═══════════════
CREATE POLICY "Anyone can view comment photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'comment-photos');

CREATE POLICY "Authenticated users can upload comment photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comment-photos' AND auth.role() = 'authenticated');
