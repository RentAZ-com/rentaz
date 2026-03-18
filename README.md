# RENTA-Z — Rent Anything. Earn From Everything.

Production-ready rental marketplace built with Next.js 14, Supabase, and Tailwind CSS.

## Quick Start (15 minutes to deploy)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose region closest to your users (Mumbai for India)
3. Save the **Project URL** and **Anon Key** from Settings → API

### 2. Run Database Schema

1. Go to Supabase Dashboard → SQL Editor → New Query
2. Paste contents of `supabase/schema.sql` → Run
3. Paste contents of `supabase/functions.sql` → Run

### 3. Configure Storage

The schema.sql already creates the `listing-images` bucket. Verify:
- Go to Storage → You should see `listing-images` bucket
- It should be set to **public**

### 4. Configure Auth

1. Go to Authentication → Settings
2. Enable **Email** provider
3. Set **Site URL** to your domain (or `http://localhost:3000` for dev)
4. Set **Redirect URLs** to include `http://localhost:3000/auth/callback`

### 5. Local Development

```bash
# Clone and install
git clone <your-repo>
cd rentaz-next
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home — hero, categories, listings
│   ├── auth/page.tsx      # Sign up / sign in
│   ├── search/page.tsx    # Browse + filter + sort
│   ├── listing/[id]/      # Listing detail + booking
│   ├── create/page.tsx    # Create new listing
│   ├── bookings/          # My bookings + detail
│   ├── profile/page.tsx   # Profile + owner dashboard
│   ├── admin/page.tsx     # Admin panel
│   └── chat/              # Messaging
├── components/            # Reusable UI components
├── context/               # Auth + app state
├── lib/                   # Supabase client
├── services/              # Database operations
└── types/                 # TypeScript types
```

## Features

- **Auth**: Email/password + Magic Link via Supabase Auth
- **Listings**: CRUD with image upload to Supabase Storage
- **Search**: Filter by category, city, keyword. Sort by price/date/rating
- **Bookings**: Full lifecycle (pending → confirmed → active → completed)
- **Date conflict detection**: Prevents overlapping bookings
- **Reviews**: Post-completion reviews with auto-rating aggregation
- **Chat**: Real conversation threads stored in Supabase
- **Admin Panel**: Overview stats, all bookings, listings, disputes queue
- **Owner Dashboard**: Earnings, pending approvals, active rentals
- **Address Privacy**: Exact address only shown after booking confirmation
- **Escrow Ready**: Database columns prepared for Phase 2 blockchain integration
- **RLS Security**: Row Level Security on all tables
- **Mobile Responsive**: Full mobile-first design

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | User profiles (auto-created on signup) |
| listings | Rental items with images, pricing, location |
| bookings | Booking records with escrow-ready fields |
| reviews | Ratings + comments (trigger updates listing avg) |
| conversations | Chat thread metadata |
| messages | Individual chat messages |

## Phase 2: Blockchain Escrow

The database already includes escrow columns:
- `escrow_id`, `escrow_state`, `wallet_address`, `tx_hashes`

See `renta-z-contracts/` for the Solidity escrow contract ready for deployment on Polygon.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for auth redirects) |
