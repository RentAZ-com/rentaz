import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: "listingId required" }, { status: 400 });
    }

    // Get the listing
    const { data: listing, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Get comparable listings (same category, similar city)
    const { data: comparables } = await supabase
      .from("listings")
      .select("price_daily, city, category")
      .eq("category", listing.category)
      .eq("status", "active")
      .neq("id", listingId)
      .limit(20);

    // Calculate suggested price
    let suggestedPrice: number;

    if (comparables && comparables.length >= 3) {
      // Market-based pricing: median of comparables + 10-15% premium
      const prices = comparables.map((c: any) => Number(c.price_daily)).sort((a, b) => a - b);
      const median = prices[Math.floor(prices.length / 2)];

      // If our price is below median, suggest median + 10%
      // If our price is at/above median, suggest 15% bump
      if (listing.price_daily < median) {
        suggestedPrice = Math.round(median * 1.1);
      } else {
        suggestedPrice = Math.round(listing.price_daily * 1.15);
      }
    } else {
      // Not enough data — suggest 25-35% increase as default
      const bump = 1 + (0.25 + Math.random() * 0.1);
      suggestedPrice = Math.round(listing.price_daily * bump);
    }

    // Don't suggest a lower price
    if (suggestedPrice <= listing.price_daily) {
      suggestedPrice = Math.round(listing.price_daily * 1.2);
    }

    // Store suggestion in DB
    await supabase
      .from("listings")
      .update({
        suggested_price: suggestedPrice,
        suggested_at: new Date().toISOString(),
      })
      .eq("id", listingId);

    return NextResponse.json({
      currentPrice: listing.price_daily,
      suggestedPrice,
      percentIncrease: Math.round(((suggestedPrice - listing.price_daily) / listing.price_daily) * 100),
      comparablesCount: comparables?.length || 0,
    });
  } catch (err) {
    console.error("AI pricing error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
