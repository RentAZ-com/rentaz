"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyBookings, updateBookingStatus } from "@/services/bookings";
import { useApp } from "@/context/AppContext";
import { BOOKING_STATUSES } from "@/types";

export default function BookingsPage() {
  const router = useRouter();
  const { userId, showToast } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    if (!userId) return;
    getMyBookings(userId).then(setBookings).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-navy">Sign in to see your bookings</h2>
        <button onClick={() => router.push("/auth")} className="btn-primary mt-6">Sign In</button>
      </div>
    );
  }

  const statusMap: Record<string, string[]> = {
    upcoming: ["pending", "confirmed"],
    active: ["active"],
    past: ["completed", "cancelled"],
  };
  const filtered = bookings.filter((b) => statusMap[tab]?.includes(b.status));

  const handleApprove = async (id: string) => {
    try {
      await updateBookingStatus(id, "confirmed");
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "confirmed" } : b));
      showToast("Booking approved ✅");
    } catch { showToast("Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    try {
      await updateBookingStatus(id, "cancelled");
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
      showToast("Booking cancelled");
    } catch { showToast("Failed to cancel"); }
  };

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-extrabold text-navy mb-6">My Bookings</h1>

      {/* Tabs */}
      <div className="flex bg-surface-muted rounded-xl p-1 mb-8 max-w-sm">
        {["upcoming", "active", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition ${tab === t ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-navy">No {tab} bookings</h3>
          <p className="text-slate-500 text-sm mt-1">Your bookings will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b: any) => {
            const statusInfo = BOOKING_STATUSES[b.status as keyof typeof BOOKING_STATUSES];
            const isOwner = b.owner_id === userId;
            const isPending = b.status === "pending";
            const img = b.listing?.images?.[0];

            return (
              <div
                key={b.id}
                className="card p-4 cursor-pointer"
                onClick={() => router.push(`/bookings/${b.id}`)}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy truncate">{b.listing?.title || "Listing"}</h3>
                    <p className="text-xs text-slate-500 mt-1">📅 {b.start_date} • {b.days} day{b.days > 1 ? "s" : ""}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`badge ${statusInfo?.color || "bg-slate-100 text-slate-600"}`}>
                        {statusInfo?.label || b.status}
                      </span>
                      <span className="text-lg font-extrabold text-navy">₹{b.total}</span>
                    </div>
                    {b.escrow_state !== "none" && (
                      <span className="badge bg-blue-100 text-blue-700 mt-1">🛡️ Escrow: {b.escrow_state}</span>
                    )}
                  </div>
                </div>

                {/* Owner actions for pending bookings */}
                {isOwner && isPending && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-surface-border" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-primary flex-1 py-2 text-sm" onClick={() => handleApprove(b.id)}>✅ Approve</button>
                    <button className="btn-outline flex-1 py-2 text-sm !text-red-500 !border-red-200" onClick={() => handleReject(b.id)}>✕ Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
