import { getSupabase } from "@/lib/supabase";
import type { Listing } from "@/types";

const supabase = () => getSupabase();

export async function getListings(opts?: {
  category?: string;
  city?: string;
  search?: string;
  sort?: string;
  limit?: number;
}) {
  let q = supabase()
    .from("listings")
    .select("*, owner:profiles!owner_id(id, full_name, avatar_url)")
    .eq("active", true);

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.city) q = q.ilike("city", `%${opts.city}%`);
  if (opts?.search) {
    q = q.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%,city.ilike.%${opts.search}%`);
  }

  if (opts?.sort === "price-low") q = q.order("price_daily", { ascending: true });
  else if (opts?.sort === "price-high") q = q.order("price_daily", { ascending: false });
  else if (opts?.sort === "rating") q = q.order("rating", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as (Listing & { owner: { id: string; full_name: string; avatar_url: string | null } })[];
}

export async function getListing(id: string) {
  const { data, error } = await supabase()
    .from("listings")
    .select("*, owner:profiles!owner_id(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Listing & { owner: any };
}

export async function getMyListings(userId: string) {
  const { data, error } = await supabase()
    .from("listings")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Listing[];
}

export async function createListing(listing: Partial<Listing>) {
  const { data, error } = await supabase()
    .from("listings")
    .insert(listing)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const { data, error } = await supabase()
    .from("listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function deleteListing(id: string) {
  const { error } = await supabase().from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadListingImage(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase().storage
    .from("listing-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data } = supabase().storage.from("listing-images").getPublicUrl(path);
  return data.publicUrl;
}
