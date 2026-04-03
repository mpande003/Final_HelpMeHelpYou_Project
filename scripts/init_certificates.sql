-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Create the `certificate_templates` table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  target_audience text NOT NULL,
  image_url text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to templates
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.certificate_templates FOR SELECT
  USING ( true );

-- Allow authenticated admins to insert/update. (Assuming your app relies on next-auth for admin, you might just want this to be public for now or limit it)
CREATE POLICY "Anyone can insert a template"
  ON public.certificate_templates FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Anyone can update a template"
  ON public.certificate_templates FOR UPDATE
  USING ( true );

CREATE POLICY "Anyone can delete a template"
  ON public.certificate_templates FOR DELETE
  USING ( true );

-- 2. Create the `certificate_templates` storage bucket
-- (Note: It's often easier to do this in the Storage UI, but this SQL does it programmatically)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate_templates', 'certificate_templates', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'certificate_templates');

CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'certificate_templates');
