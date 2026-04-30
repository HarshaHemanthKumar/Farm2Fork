-- Supabase Schema for Farm2Fork

CREATE TABLE IF NOT EXISTS public.users (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  role text not null,
  name text,
  location text,
  upi_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.users FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid default gen_random_uuid() primary key,
  "farmerId" uuid references public.users(id) not null,
  crop_name text not null,
  quantity_kg numeric not null,
  price_per_kg numeric not null,
  harvest_date date not null,
  "farmerName" text,
  distance numeric default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.listings FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.baskets (
  id uuid default gen_random_uuid() primary key,
  "listingId" uuid references public.listings(id) not null,
  "organiserId" uuid references public.users(id) not null,
  min_quantity_kg numeric not null,
  current_quantity_kg numeric default 0 not null,
  status text not null,
  community_name text,
  community_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.baskets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.baskets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.baskets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.baskets FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid default gen_random_uuid() primary key,
  "listingId" uuid references public.listings(id) not null,
  "consumerId" uuid references public.users(id) not null,
  basket_id uuid references public.baskets(id),
  quantity_kg numeric not null,
  price_at_order numeric,
  delivery_address text,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.orders FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS public.basket_participants (
  id uuid default gen_random_uuid() primary key,
  basket_id uuid references public.baskets(id) not null,
  consumer_id uuid references public.users(id) not null,
  quantity_kg numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.basket_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.basket_participants FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.basket_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.basket_participants FOR UPDATE USING (true);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Allow public view for product-images" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Allow authenticated uploads for product-images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
CREATE POLICY "Allow authenticated updates for product-images" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' );
