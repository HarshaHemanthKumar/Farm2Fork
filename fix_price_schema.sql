ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS price_at_order numeric;

NOTIFY pgrst, 'reload schema';
