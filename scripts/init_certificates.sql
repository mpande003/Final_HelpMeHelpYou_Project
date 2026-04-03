-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Create the `certificate_templates` table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  target_audience text NOT NULL,
  image_url text NOT NULL,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  signature_url text,
  signature_x float8 DEFAULT 85,
  signature_y float8 DEFAULT 85,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `certificate_issuances` table
CREATE TABLE IF NOT EXISTS public.certificate_issuances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  recipient_id text NOT NULL, -- e.g. vol_1, ben_5
  recipient_name text NOT NULL,
  event_name text NOT NULL,
  token_id text UNIQUE NOT NULL, -- e.g. CEP-XXXX-XXXX
  issued_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_issuances ENABLE ROW LEVEL SECURITY;

-- Policies for templates
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.certificate_templates FOR SELECT
  USING ( true );

CREATE POLICY "Anyone can insert a template"
  ON public.certificate_templates FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Anyone can update a template"
  ON public.certificate_templates FOR UPDATE
  USING ( true );

CREATE POLICY "Anyone can delete a template"
  ON public.certificate_templates FOR DELETE
  USING ( true );

-- Policies for issuances
CREATE POLICY "Anyone can view issuances"
  ON public.certificate_issuances FOR SELECT
  USING ( true );

CREATE POLICY "Anyone can insert an issuance"
  ON public.certificate_issuances FOR INSERT
  WITH CHECK ( true );

-- 3. Create the `certificate_templates` storage bucket
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
