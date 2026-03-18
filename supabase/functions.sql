-- ═══════════════════════════════════════════════════════════
-- RENTA-Z: Additional RPC Functions
-- Run AFTER schema.sql
-- ═══════════════════════════════════════════════════════════

-- Increment booking count on a listing
create or replace function public.increment_booking_count(listing_id_input uuid)
returns void as $$
begin
  update public.listings
  set bookings_count = bookings_count + 1
  where id = listing_id_input;
end;
$$ language plpgsql security definer;
