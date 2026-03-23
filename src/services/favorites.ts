import { getSupabase } from "@/lib/supabase";

// Get all favorites for current user
export async function getFavorites(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id, created_at, listings(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get just the listing IDs that are favorited
export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId);

  if (error) throw error;
  return new Set((data || []).map((f: any) => f.listing_id));
}

// Toggle favorite — add if not exists, remove if exists
export async function toggleFavorite(userId: string, listingId: string): Promise<boolean> {
  const supabase = getSupabase();

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  if (existing) {
    // Remove
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
    return false; // no longer favorited
  } else {
    // Add
    await supabase
      .from("favorites")
      .insert({ user_id: userId, listing_id: listingId });
    return true; // now favorited
  }
}

// Check if a specific listing is favorited
export async function isFavorited(userId: string, listingId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}

// Get favorite count for a listing (social proof)
export async function getFavoriteCount(listingId: string): Promise<number> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  return count || 0;
}
