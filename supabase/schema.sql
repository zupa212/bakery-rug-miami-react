-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CATALOG ITEMS TABLE
create table if not exists public.catalog_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  category text,
  images text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for catalog_items
alter table public.catalog_items enable row level security;

-- Policy: Everyone can read catalog items
create policy "Public items are viewable by everyone"
  on public.catalog_items for select
  using ( true );

-- Policy: Only authenticated (admins) can insert/update/delete
-- note: assumes you have setup auth, or you just use the service role key for admin tasks
create policy "Admins can insert catalog items"
  on public.catalog_items for insert
  with check ( auth.role() = 'service_role' );

create policy "Admins can update catalog items"
  on public.catalog_items for update
  using ( auth.role() = 'service_role' );


-- LEADS TABLE
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  phone text,
  city_or_area text,
  message text,
  item_name text,
  item_slug text,
  source_page text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Enable RLS for leads
alter table public.leads enable row level security;

-- Policy: Anyone can insert a lead (public form)
create policy "Public can submit leads"
  on public.leads for insert
  with check ( true );

-- Policy: Only admins/service_role can read leads
create policy "Admins can view leads"
  on public.leads for select
  using ( auth.role() = 'service_role' );
