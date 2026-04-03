-- Run this in your Supabase Dashboard -> SQL Editor

ALTER TABLE public.volunteers
ADD COLUMN IF NOT EXISTS full_address TEXT;
