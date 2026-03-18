export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string;
  country: string;
  avatar_url: string | null;
  verified: boolean;
  role: "user" | "admin";
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  price_daily: number;
  price_weekly: number | null;
  deposit: number;
  instant: boolean;
  images: string[];
  rating: number;
  reviews_count: number;
  bookings_count: number;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  owner?: Profile;
}

export interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  days: number;
  subtotal: number;
  fee: number;
  deposit: number;
  total: number;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  escrow_id: string | null;
  escrow_state: string;
  wallet_address: string | null;
  tx_hashes: string[];
  created_at: string;
  // Joined
  listing?: Listing;
  renter?: Profile;
  owner?: Profile;
}

export interface Review {
  id: string;
  booking_id: string | null;
  listing_id: string;
  reviewer_id: string;
  owner_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Conversation {
  id: string;
  listing_id: string | null;
  listing_title: string;
  user_id: string;
  other_id: string;
  user_name: string;
  other_name: string;
  last_msg: string;
  last_time: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export const CATEGORIES = [
  { id: "vehicles", name: "Vehicles", icon: "🚗", color: "#3B82F6" },
  { id: "electronics", name: "Electronics", icon: "📱", color: "#8B5CF6" },
  { id: "cameras", name: "Cameras", icon: "📷", color: "#EC4899" },
  { id: "spaces", name: "Spaces", icon: "🏠", color: "#10B981" },
  { id: "venues", name: "Venues", icon: "🎪", color: "#F59E0B" },
  { id: "luxury", name: "Luxury", icon: "💎", color: "#6366F1" },
  { id: "sports", name: "Sports", icon: "⚽", color: "#EF4444" },
  { id: "tools", name: "Tools", icon: "🔧", color: "#78716C" },
  { id: "party", name: "Party", icon: "🎉", color: "#D946EF" },
  { id: "fashion", name: "Fashion", icon: "👗", color: "#F97316" },
  { id: "music", name: "Music", icon: "🎸", color: "#14B8A6" },
  { id: "other", name: "Other", icon: "📦", color: "#64748B" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  active: { label: "Active", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-slate-100 text-slate-600" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;
