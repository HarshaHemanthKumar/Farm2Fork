-- Add community fields to baskets
ALTER TABLE public.baskets 
ADD COLUMN IF NOT EXISTS community_name text,
ADD COLUMN IF NOT EXISTS community_address text;

-- Force Supabase to reload the schema cache so it picks up the new columns immediately
NOTIFY pgrst, 'reload schema';
