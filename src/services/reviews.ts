import { getSupabase } from "@/lib/supabase";
import type { Review, Conversation, Message } from "@/types";

const supabase = () => getSupabase();

// ─── REVIEWS ─────────────────────────────────────────────
export async function getListingReviews(listingId: string) {
  const { data, error } = await supabase()
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(id, full_name, avatar_url)")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as (Review & { reviewer: any })[];
}

export async function createReview(review: Partial<Review>) {
  const { data, error } = await supabase()
    .from("reviews")
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

export async function hasReviewed(bookingId: string, userId: string): Promise<boolean> {
  const { data } = await supabase()
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("reviewer_id", userId)
    .limit(1);
  return (data?.length || 0) > 0;
}

// ─── CONVERSATIONS ───────────────────────────────────────
export async function getConversations(userId: string) {
  const { data, error } = await supabase()
    .from("conversations")
    .select("*")
    .or(`user_id.eq.${userId},other_id.eq.${userId}`)
    .order("last_time", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data || []) as Conversation[];
}

export async function getOrCreateConversation(
  listingId: string,
  listingTitle: string,
  userId: string,
  userName: string,
  otherId: string,
  otherName: string
): Promise<Conversation> {
  // Check existing
  const { data: existing } = await supabase()
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .or(`user_id.eq.${userId},other_id.eq.${userId}`)
    .limit(1);

  if (existing && existing.length > 0) return existing[0] as Conversation;

  const { data, error } = await supabase()
    .from("conversations")
    .insert({
      listing_id: listingId,
      listing_title: listingTitle,
      user_id: userId,
      other_id: otherId,
      user_name: userName,
      other_name: otherName,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase()
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, senderName: string, text: string) {
  const { data, error } = await supabase()
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, sender_name: senderName, text })
    .select()
    .single();
  if (error) throw error;

  // Update conversation last message
  await supabase()
    .from("conversations")
    .update({ last_msg: text, last_time: new Date().toISOString() })
    .eq("id", conversationId);

  return data as Message;
}
