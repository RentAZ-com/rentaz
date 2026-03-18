-- ═══════════════════════════════════════════════════════════
-- RENTA-Z: Complete Supabase SQL Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- ─── PROFILES ────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  city text default '',
  country text default 'IN',
  avatar_url text,
  verified boolean default false,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── LISTINGS ────────────────────────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  category text not null,
  location text default '',
  city text default '',
  price_daily numeric not null default 0,
  price_weekly numeric,
  deposit numeric default 0,
  instant boolean default false,
  images jsonb default '[]'::jsonb,
  rating numeric default 0,
  reviews_count integer default 0,
  bookings_count integer default 0,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_listings_owner on public.listings(owner_id);
create index idx_listings_category on public.listings(category);
create index idx_listings_city on public.listings(city);
create index idx_listings_created on public.listings(created_at desc);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
  on public.listings for select using (true);

create policy "Authenticated users can create listings"
  on public.listings for insert with check (auth.uid() = owner_id);

create policy "Owners can update own listings"
  on public.listings for update using (auth.uid() = owner_id);

create policy "Owners can delete own listings"
  on public.listings for delete using (auth.uid() = owner_id);

-- ─── BOOKINGS ────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  renter_id uuid not null references public.profiles(id),
  owner_id uuid not null references public.profiles(id),
  start_date date not null,
  days integer not null default 1,
  subtotal numeric not null default 0,
  fee numeric not null default 0,
  deposit numeric default 0,
  total numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending','confirmed','active','completed','cancelled')),
  -- Escrow fields (phase 2)
  escrow_id text,
  escrow_state text default 'none'
    check (escrow_state in ('none','deposit_pending','funded','in_use','return_pending','released','disputed')),
  wallet_address text,
  tx_hashes jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index idx_bookings_listing on public.bookings(listing_id);
create index idx_bookings_renter on public.bookings(renter_id);
create index idx_bookings_owner on public.bookings(owner_id);
create index idx_bookings_status on public.bookings(status);

alter table public.bookings enable row level security;

create policy "Booking participants can view their bookings"
  on public.bookings for select
  using (auth.uid() = renter_id or auth.uid() = owner_id);

create policy "Authenticated users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = renter_id);

create policy "Participants can update bookings"
  on public.bookings for update
  using (auth.uid() = renter_id or auth.uid() = owner_id);

-- Admin override: admins can see all bookings
create policy "Admins can view all bookings"
  on public.bookings for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── REVIEWS ─────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  owner_id uuid not null references public.profiles(id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text default '',
  created_at timestamptz default now()
);

create index idx_reviews_listing on public.reviews(listing_id);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Authenticated users can create reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Function to update listing rating after review
create or replace function public.update_listing_rating()
returns trigger as $$
begin
  update public.listings set
    rating = (select coalesce(avg(rating), 0) from public.reviews where listing_id = new.listing_id),
    reviews_count = (select count(*) from public.reviews where listing_id = new.listing_id)
  where id = new.listing_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row execute procedure public.update_listing_rating();

-- ─── CONVERSATIONS ───────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text default '',
  user_id uuid not null references public.profiles(id),
  other_id uuid not null references public.profiles(id),
  user_name text default '',
  other_name text default '',
  last_msg text default '',
  last_time timestamptz,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;

create policy "Conversation participants can view"
  on public.conversations for select
  using (auth.uid() = user_id or auth.uid() = other_id);

create policy "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Participants can update conversations"
  on public.conversations for update
  using (auth.uid() = user_id or auth.uid() = other_id);

-- ─── MESSAGES ────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  sender_name text default '',
  text text not null,
  created_at timestamptz default now()
);

create index idx_messages_convo on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Conversation participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user_id = auth.uid() or c.other_id = auth.uid())
    )
  );

create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- ─── STORAGE BUCKET ──────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
