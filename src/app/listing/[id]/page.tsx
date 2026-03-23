"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getListing } from "@/services/listings";
import { checkDateConflict, createBooking } from "@/services/bookings";
import { getListingReviews } from "@/services/reviews";
import { useApp } from "@/context/AppContext";
import { CATEGORIES, BOOKING_STATUSES } from "@/types";
import type { Listing, Review } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import AIPriceBadge from "@/components/AIPriceBadge";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, userId, showToast } = useApp();
  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  // Booking form
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(1);
  const [booking, setBooking] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getListing(id), getListingReviews(id)])
      .then(([l, r]) => { setListing(l); setReviews(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-container py-8">
      <div className="skeleton aspect-[16/9] rounded-2xl mb-6" />
      <div className="skeleton h-8 w-2/3 rounded mb-4" />
      <div className="skeleton h-4 w-1/2 rounded mb-2" />
      <div className="skeleton h-4 w-1/3 rounded" />
    </div>
  );

  if (!listing) return (
    <div className="page-container py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-navy">Listing not found</h2>
    </div>
  );

  const cat = CATEGORIES.find((c) => c.id === listing.category);
  const hasImages = listing.images?.length > 0;
  const sub = days >= 7 && listing.price_weekly
    ? Math.floor(days / 7) * listing.price_weekly + (days % 7) * listing.price_daily
    : days * listing.price_daily;
  const fee = Math.round(sub * 0.05);
  const total = sub + fee + (listing.deposit || 0);

  const handleBook = async () => {
    if (!userId) { router.push("/auth"); return; }
    if (!startDate) { showToast("Please select a start date"); return; }

    setBooking(true);
    try {
      const conflict = await checkDateConflict(listing.id, startDate, days);
      if (conflict) { showToast("These dates are already booked. Please choose different dates."); setBooking(false); return; }

      await createBooking({
        listing_id: listing.id,
        renter_id: userId,
        owner_id: listing.owner_id,
        start_date: startDate,
        days,
        subtotal: sub,
        fee,
        deposit: listing.deposit || 0,
        total,
        status: listing.instant ? "confirmed" : "pending",
      });

      showToast(listing.instant ? "Booking confirmed! 🎉" : "Booking request sent! ⏳");
      router.push("/bookings");
    } catch (err: any) {
      showToast(err.message || "Booking failed");
    }
    setBooking(false);
  };

  return (
    <div className="page-container py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — Images + Info */}
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface-muted mb-6">
            {hasImages ? (
              <>
                <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {listing.images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${i === imgIdx ? "bg-white scale-125" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-6xl">{cat?.icon || "📦"}</span>
                <span className="text-sm text-slate-400 mt-2">No photos</span>
              </div>
            )}
            {listing.instant && (
              <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-lg">⚡ Instant Book</span>
            )}
          </div>

          {/* Info */}
          <div className="mb-4">
            <div className="badge bg-surface-muted text-slate-600 mb-3">{cat?.icon} {cat?.name}</div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy mb-2">{listing.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
              <span>⭐ {listing.rating?.toFixed(1) || "New"} ({listing.reviews_count} reviews)</span>
              <span>📍 {listing.city}</span>
            </div>
          </div>

          {/* Pricing bar */}
          <div className="bg-surface-muted rounded-2xl p-5 mb-6">
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-3xl font-extrabold text-navy">₹{listing.price_daily}</span>
                <span className="text-slate-400 text-sm">/day</span>
              </div>
              {listing.price_weekly && (
                <div className="border-l border-surface-border pl-4">
                  <span className="text-xl font-bold text-navy">₹{listing.price_weekly}</span>
                  <span className="text-slate-400 text-sm">/week</span>
                </div>
              )}
            </div>
            {listing.deposit > 0 && (
              <p className="text-xs text-slate-500 mt-2">🔒 Security deposit: ₹{listing.deposit} (refundable)</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-navy mb-3">Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{listing.description || "No description provided."}</p>
          </div>

          {/* Location (public — city only) */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-navy mb-3">Location</h3>
            <p className="text-slate-600">📍 {listing.city}</p>
            <p className="text-xs text-slate-400 mt-1">🔒 Exact address shared after booking is confirmed</p>
          </div>

          {/* Escrow teaser */}
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-5 text-white mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h4 className="font-bold text-sm">Secure Escrow Coming Soon</h4>
                <p className="text-xs text-slate-300">Blockchain-powered deposit protection on Polygon — Phase 2</p>
              </div>
            </div>
          </div>

          {/* Owner info */}
          {listing.owner && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-navy mb-3">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-bold">
                  {(listing.owner.full_name || "?")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-navy">{listing.owner.full_name}</p>
                  <p className="text-xs text-slate-400">Member since {new Date(listing.owner.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-bold text-navy mb-4">Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-slate-400 text-sm">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="bg-white border border-surface-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-xs font-bold text-slate-500">
                        {(r.reviewer?.full_name || "?")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.reviewer?.full_name || "Anonymous"}</p>
                        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto text-sm text-amber-500">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Booking panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white border border-surface-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-navy mb-4">Book This Item</h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1">Duration (days)</label>
              <div className="flex items-center gap-3">
                <button className="btn-outline py-2 px-4 text-lg" onClick={() => setDays(Math.max(1, days - 1))}>−</button>
                <span className="text-xl font-bold text-navy w-12 text-center">{days}</span>
                <button className="btn-outline py-2 px-4 text-lg" onClick={() => setDays(days + 1)}>+</button>
              </div>
            </div>

            <div className="bg-surface-muted rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Rental ({days} day{days > 1 ? "s" : ""})</span>
                <span>₹{sub}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Service fee (5%)</span>
                <span>₹{fee}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Security deposit</span>
                <span>₹{listing.deposit || 0}</span>
              </div>
              <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-navy">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <p className="text-xs text-green-600 font-semibold mb-4">✓ Free cancellation up to 24h before start</p>

            <button
              className="btn-primary w-full"
              onClick={() => userId ? handleBook() : router.push("/auth")}
              disabled={!startDate || booking}
            >
              {booking ? "Processing..." : userId ? `Book for ₹${total}` : "Sign in to Book"}
            </button>

            {userId && userId === listing.owner_id && (
              <p className="text-xs text-slate-400 text-center mt-3">This is your listing</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
