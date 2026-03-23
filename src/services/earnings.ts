import { getSupabase } from "@/lib/supabase";

export interface EarningsOverview {
  totalEarned: number;
  earnedThisMonth: number;
  activeRentals: number;
  totalBookings: number;
}

export interface Payout {
  id: string;
  listingTitle: string;
  amount: number;
  date: string;
  status: "completed" | "pending";
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

// Get earnings overview from the view
export async function getEarningsOverview(userId: string): Promise<EarningsOverview> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("owner_earnings")
    .select("*")
    .eq("owner_id", userId)
    .single();

  if (error || !data) {
    return { totalEarned: 0, earnedThisMonth: 0, activeRentals: 0, totalBookings: 0 };
  }

  return {
    totalEarned: Number(data.total_earned) || 0,
    earnedThisMonth: Number(data.earned_this_month) || 0,
    activeRentals: Number(data.active_rentals) || 0,
    totalBookings: Number(data.total_bookings) || 0,
  };
}

// Get recent completed bookings as "payouts"
export async function getRecentPayouts(userId: string, limit = 10): Promise<Payout[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("id, total, status, created_at, listings(title)")
    .eq("owner_id", userId)
    .in("status", ["completed", "confirmed", "active"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((b: any) => ({
    id: b.id,
    listingTitle: b.listings?.title || "Unknown",
    amount: Number(b.total) || 0,
    date: new Date(b.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    status: b.status === "completed" ? "completed" : "pending",
  }));
}

// Get monthly earnings for chart (last 6 months)
export async function getMonthlyEarnings(userId: string): Promise<MonthlyEarning[]> {
  const supabase = getSupabase();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from("bookings")
    .select("total, created_at")
    .eq("owner_id", userId)
    .neq("status", "cancelled")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Group by month
  const months: Record<string, number> = {};
  data.forEach((b: any) => {
    const key = new Date(b.created_at).toLocaleDateString("en-US", { month: "short" });
    months[key] = (months[key] || 0) + Number(b.total || 0);
  });

  return Object.entries(months).map(([month, amount]) => ({ month, amount }));
}
