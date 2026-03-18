import { getSupabase } from "@/lib/supabase";
import type { Booking } from "@/types";

const supabase = () => getSupabase();

export async function getMyBookings(userId: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, listing:listings(id, title, images, city, price_daily), renter:profiles!renter_id(id, full_name), owner:profiles!owner_id(id, full_name)")
    .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as any[];
}

export async function getBooking(id: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, listing:listings(*), renter:profiles!renter_id(*), owner:profiles!owner_id(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as any;
}

export async function getAllBookings() {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, listing:listings(id, title), renter:profiles!renter_id(id, full_name), owner:profiles!owner_id(id, full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as any[];
}

export async function checkDateConflict(listingId: string, startDate: string, days: number): Promise<boolean> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  const endStr = endDate.toISOString().split("T")[0];

  const { data } = await supabase()
    .from("bookings")
    .select("id, start_date, days")
    .eq("listing_id", listingId)
    .in("status", ["confirmed", "active"])
    .gte("start_date", new Date(new Date(startDate).getTime() - days * 86400000).toISOString().split("T")[0]);

  if (!data || data.length === 0) return false;

  const reqStart = new Date(startDate).getTime();
  const reqEnd = endDate.getTime();

  return data.some((b: any) => {
    const bStart = new Date(b.start_date).getTime();
    const bEnd = bStart + b.days * 86400000;
    return reqStart < bEnd && bStart < reqEnd;
  });
}

export async function createBooking(booking: Partial<Booking>) {
  const { data, error } = await supabase()
    .from("bookings")
    .insert(booking)
    .select()
    .single();
  if (error) throw error;

  // Increment bookings_count on listing
  await supabase().rpc("increment_booking_count", { listing_id_input: booking.listing_id });

  return data as Booking;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}
