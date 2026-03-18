"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getListings } from "@/services/listings";
import { getAllBookings, updateBookingStatus } from "@/services/bookings";
import { useApp } from "@/context/AppContext";
import { BOOKING_STATUSES } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const { user, userId, showToast } = useApp();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Promise.all([getListings({}), getAllBookings()])
      .then(([l, b]) => { setListings(l); setBookings(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bookings.filter((b) => b.status === "completed").reduce((a, b) => a + (b.fee || 0), 0);
  const disputed = bookings.filter((b) => b.escrow_state === "disputed");
  const active = bookings.filter((b) => ["confirmed", "active"].includes(b.status));

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-navy">🛡️ Admin Panel</h1>
        <button onClick={() => router.push("/profile")} className="text-sm text-slate-500 hover:text-navy">← Profile</button>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-muted rounded-xl p-1 mb-8 overflow-x-auto">
        {["overview", "bookings", "listings", "disputes"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition ${tab === t ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Overview */}
          {tab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["📦", "Listings", listings.length, "text-blue-600"],
                ["📋", "Bookings", bookings.length, "text-green-600"],
                ["⚠️", "Disputes", disputed.length, "text-red-600"],
                ["💰", "Revenue", `₹${totalRevenue}`, "text-amber-600"],
                ["✅", "Active", active.length, "text-green-600"],
                ["🏁", "Completed", bookings.filter((b) => b.status === "completed").length, "text-slate-600"],
                ["❌", "Cancelled", bookings.filter((b) => b.status === "cancelled").length, "text-red-400"],
                ["⏳", "Pending", bookings.filter((b) => b.status === "pending").length, "text-amber-500"],
              ].map(([icon, label, value, color], i) => (
                <div key={i} className="card p-5">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                  <div className="text-xs text-slate-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* All Bookings */}
          {tab === "bookings" && (
            <div className="space-y-3">
              {bookings.length === 0 ? <p className="text-center text-slate-400 py-12">No bookings</p> : bookings.map((b: any) => {
                const si = (BOOKING_STATUSES as any)[b.status];
                return (
                  <div key={b.id} className="card p-4 cursor-pointer" onClick={() => router.push(`/bookings/${b.id}`)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-navy">{b.listing?.title || "—"}</h4>
                        <p className="text-xs text-slate-500 mt-1">{b.renter?.full_name} → {b.owner?.full_name}</p>
                        <p className="text-xs text-slate-400">{b.start_date} • {b.days}d • ₹{b.total}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${si?.color || "bg-slate-100 text-slate-600"}`}>{b.status}</span>
                        {b.escrow_state !== "none" && <div className="badge bg-blue-100 text-blue-700 mt-1">🛡️ {b.escrow_state}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All Listings */}
          {tab === "listings" && (
            <div className="space-y-3">
              {listings.map((l: any) => (
                <div key={l.id} className="card p-4 cursor-pointer" onClick={() => router.push(`/listing/${l.id}`)}>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-muted flex-shrink-0">
                      {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-navy">{l.title}</h4>
                      <p className="text-xs text-slate-500">by {l.owner?.full_name || "—"} • {l.city}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-navy">₹{l.price_daily}/day</span>
                        <span className="text-xs text-slate-400">⭐ {l.rating?.toFixed(1)} ({l.reviews_count})</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disputes */}
          {tab === "disputes" && (
            <div>
              {disputed.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-bold text-navy">No active disputes</h3>
                  <p className="text-slate-400 text-sm">All clear!</p>
                </div>
              ) : disputed.map((b: any) => (
                <div key={b.id} className="card p-5 mb-3 border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <h4 className="font-bold text-red-600">{b.listing?.title || "—"}</h4>
                  </div>
                  <p className="text-xs text-slate-500">{b.renter?.full_name} vs {b.owner?.full_name}</p>
                  <p className="text-xs text-slate-400 mt-1">₹{b.total} • {b.start_date}</p>
                  <button className="btn-primary text-sm py-2 mt-3" onClick={() => router.push(`/bookings/${b.id}`)}>Review Dispute</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
