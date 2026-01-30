-- 1. Ensure the 'rugs' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('rugs', 'rugs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts (clean slate for 'rugs')
DROP POLICY IF EXISTS "Give me access to rugs" ON storage.objects;
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update/Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- 3. Create Permissive Policies for the 'rugs' bucket
-- Note: Since we use a simple PIN on the frontend, we must allow 'anon' uploads.
-- In a stricter app, we would require Supabase Auth.

-- Enable Read Access (Images need to be visible)
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'rugs' );

-- Enable Upload Access (For Admin Panel)
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'rugs' );

-- Enable Update/Delete Access (For Admin Panel edits)
CREATE POLICY "Public Update/Delete"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'rugs' );

CREATE POLICY "Public Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'rugs' );
