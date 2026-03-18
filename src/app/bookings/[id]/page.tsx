"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBooking, updateBookingStatus } from "@/services/bookings";
import { hasReviewed, createReview } from "@/services/reviews";
import { useApp } from "@/context/AppContext";
import { BOOKING_STATUSES } from "@/types";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId, showToast } = useApp();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !userId) return;
    getBooking(id).then(async (b) => {
      setBooking(b);
      const r = await hasReviewed(id, userId);
      setReviewed(r);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id, userId]);

  if (loading) return <div className="page-container py-8"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!booking) return <div className="page-container py-20 text-center"><div className="text-5xl mb-4">😕</div><h2 className="text-xl font-bold text-navy">Booking not found</h2></div>;

  const isConfirmed = ["confirmed", "active", "completed"].includes(booking.status);
  const isCompleted = booking.status === "completed";
  const isParticipant = userId === booking.renter_id || userId === booking.owner_id;
  const isOwner = userId === booking.owner_id;
  const statusInfo = BOOKING_STATUSES[booking.status as keyof typeof BOOKING_STATUSES];

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateBookingStatus(booking.id, newStatus);
      setBooking({ ...booking, status: newStatus });
      showToast(`Booking ${newStatus} ✅`);
    } catch { showToast("Action failed"); }
  };

  const handleReview = async () => {
    if (rating === 0) { showToast("Please select a rating"); return; }
    setSubmitting(true);
    try {
      await createReview({
        booking_id: booking.id,
        listing_id: booking.listing_id,
        reviewer_id: userId!,
        owner_id: booking.owner_id,
        rating,
        comment: comment.trim(),
      });
      setReviewed(true);
      setShowReview(false);
      showToast("Review posted ⭐");
    } catch { showToast("Failed to post review"); }
    setSubmitting(false);
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <button onClick={() => router.push("/bookings")} className="text-sm text-slate-500 hover:text-navy mb-6 inline-block">
        ← Back to Bookings
      </button>

      {/* Status */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{booking.status === "pending" ? "⏳" : booking.status === "confirmed" ? "✅" : booking.status === "active" ? "🔑" : booking.status === "completed" ? "🏁" : "❌"}</div>
        <span className={`badge text-base px-5 py-2 ${statusInfo?.color}`}>{statusInfo?.label}</span>
      </div>

      {/* Address (privacy-gated) */}
      {isConfirmed && isParticipant && booking.listing?.location ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
          <h4 className="text-sm font-bold text-green-700 mb-1">📍 Pickup Address</h4>
          <p className="text-base font-semibold text-navy">{booking.listing.location}</p>
          <p className="text-xs text-slate-500 mt-1">{booking.listing.city}</p>
        </div>
      ) : (
        <div className="bg-surface-muted rounded-2xl p-5 mb-6 text-center">
          <p className="text-sm text-slate-400">🔒 Address will be revealed after booking is confirmed</p>
        </div>
      )}

      {/* Payment summary */}
      <div className="bg-surface-muted rounded-2xl p-5 mb-6 space-y-3">
        <h4 className="font-bold text-navy mb-2">Payment Summary</h4>
        {[["Rental", booking.subtotal], ["Service fee", booking.fee], ["Deposit", booking.deposit]].map(([label, amount]) => (
          <div key={String(label)} className="flex justify-between text-sm text-slate-600">
            <span>{label}</span><span>₹{amount}</span>
          </div>
        ))}
        <div className="border-t border-surface-border pt-3 flex justify-between font-bold text-lg text-navy">
          <span>Total</span><span>₹{booking.total}</span>
        </div>
      </div>

      {/* Escrow placeholder */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h4 className="font-bold text-sm">Secure Escrow — Coming Soon</h4>
            <p className="text-xs text-slate-300">Deposits will be locked in smart contracts on Polygon</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-3 mb-6">
        {isOwner && booking.status === "pending" && (
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={() => handleStatusChange("confirmed")}>✅ Approve</button>
            <button className="btn-outline flex-1 !text-red-500 !border-red-200" onClick={() => handleStatusChange("cancelled")}>✕ Reject</button>
          </div>
        )}
        {isOwner && booking.status === "confirmed" && (
          <button className="btn-primary w-full" onClick={() => handleStatusChange("active")}>🤝 Confirm Handover</button>
        )}
        {!isOwner && booking.status === "active" && (
          <button className="btn-primary w-full" onClick={() => handleStatusChange("completed")}>📦 Confirm Return</button>
        )}
      </div>

      {/* Review */}
      {isCompleted && !reviewed && !showReview && (
        <button className="btn-primary w-full mb-6" onClick={() => setShowReview(true)}>⭐ Write a Review</button>
      )}
      {reviewed && (
        <div className="bg-green-50 text-green-700 text-center p-4 rounded-xl font-semibold text-sm mb-6">✅ You have reviewed this rental</div>
      )}
      {showReview && (
        <div className="bg-white border border-surface-border rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-navy mb-4">Your Review</h4>
          <div className="flex gap-2 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="text-4xl transition-transform hover:scale-110">
                <span className={s <= rating ? "text-amber-400" : "text-slate-200"}>★</span>
              </button>
            ))}
          </div>
          <textarea className="input-field mb-4" rows={3} placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn-primary w-full" onClick={handleReview} disabled={submitting}>
            {submitting ? "Posting..." : "Submit Review"}
          </button>
        </div>
      )}

      {/* Listing info */}
      {booking.listing && (
        <div className="card p-4 cursor-pointer" onClick={() => router.push(`/listing/${booking.listing_id}`)}>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
              {booking.listing.images?.[0] ? <img src={booking.listing.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
            </div>
            <div>
              <h4 className="font-bold text-navy">{booking.listing.title}</h4>
              <p className="text-xs text-slate-500">📍 {booking.listing.city}</p>
              <p className="text-xs text-slate-400 mt-1">View listing →</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
