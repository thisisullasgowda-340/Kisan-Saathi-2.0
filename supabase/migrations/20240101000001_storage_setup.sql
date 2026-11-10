-- Supabase Storage Setup for KisanSaathi
-- Buckets: crop-images, disease-reference-images, profile-images

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('crop-images', 'crop-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('disease-reference-images', 'disease-reference-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies

-- crop-images: Users can upload to their own folder, read their own, and admins/experts can view
CREATE POLICY "Users can upload their own crop images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own crop images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'crop-images' AND (
  (storage.foldername(name))[1] = auth.uid()::text 
  OR public.is_expert(auth.uid()) 
  OR public.is_admin(auth.uid())
));

CREATE POLICY "Users can delete their own crop images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'crop-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- disease-reference-images: Public read, Admin write
CREATE POLICY "Anyone can view disease reference images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'disease-reference-images');

CREATE POLICY "Admins can upload disease reference images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'disease-reference-images' AND public.is_admin(auth.uid()));

-- profile-images: Public read, User write own
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
