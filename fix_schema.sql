-- 1. Add missing columns
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS upi_id text;

ALTER TABLE public.baskets 
ADD COLUMN IF NOT EXISTS community_name text,
ADD COLUMN IF NOT EXISTS community_address text;

-- 2. Force Supabase to reload the schema cache so it picks up the new columns immediately
NOTIFY pgrst, 'reload schema';
