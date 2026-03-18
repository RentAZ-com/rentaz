"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyListings, deleteListing } from "@/services/listings";
import { getMyBookings } from "@/services/bookings";
import { updateProfile } from "@/services/auth";
import { useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";
import { BOOKING_STATUSES } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userId, showToast, refreshUser, signOut } = useApp();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("listings");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", city: "" });

  useEffect(() => {
    if (!userId) return;
    Promise.all([getMyListings(userId), getMyBookings(userId)])
      .then(([l, b]) => { setListings(l); setBookings(b); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", phone: user.phone || "", city: user.city || "" });
  }, [user]);

  if (!userId) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-navy mb-2">Sign in to view your profile</h2>
        <button onClick={() => router.push("/auth")} className="btn-primary mt-4">Sign In</button>
      </div>
    );
  }

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const ownerBookings = bookings.filter((b) => b.owner_id === userId);
  const totalEarned = ownerBookings.filter((b) => b.status === "completed").reduce((a, b) => a + (b.subtotal || 0), 0);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(userId, form);
      await refreshUser();
      setEditing(false);
      showToast("Profile updated ✅");
    } catch { showToast("Failed to save"); }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing(listingId);
      setListings((p) => p.filter((l) => l.id !== listingId));
      showToast("Listing deleted");
    } catch { showToast("Failed to delete"); }
  };

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy to-navy-light rounded-3xl p-8 text-white mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold text-accent">
            {(user?.full_name || "?")[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{user?.full_name || "User"}</h1>
            <p className="text-slate-300 text-sm">{user?.email}</p>
            {user?.city && <p className="text-slate-400 text-xs mt-1">📍 {user.city}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold">{listings.length}</div>
            <div className="text-xs text-slate-300">Listings</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold">{completedBookings.length}</div>
            <div className="text-xs text-slate-300">Rentals</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold">₹{totalEarned}</div>
            <div className="text-xs text-slate-300">Earned</div>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      {editing ? (
        <div className="card p-6 mb-8 space-y-4">
          <h3 className="font-bold text-navy">Edit Profile</h3>
          <input className="input-field" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={handleSaveProfile}>Save</button>
            <button className="btn-outline flex-1" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 mb-8">
          <button className="btn-outline flex-1 text-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          <button className="btn-outline flex-1 text-sm" onClick={() => router.push("/admin")}>🛡️ Admin</button>
          <button className="btn-outline flex-1 text-sm !text-red-500 !border-red-200" onClick={async () => { await signOut(); router.push("/"); }}>Log Out</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-surface-muted rounded-xl p-1 mb-6">
        {["listings", "bookings", "owner"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition ${tab === t ? "bg-white text-navy shadow-sm" : "text-slate-500"}`}>
            {t === "owner" ? "Owner Dashboard" : `My ${t}`}
          </button>
        ))}
      </div>

      {/* My Listings */}
      {tab === "listings" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-navy">My Listings ({listings.length})</h3>
            <button className="btn-primary text-sm py-2 px-4" onClick={() => router.push("/create")}>+ New</button>
          </div>
          {loading ? <div className="skeleton h-32 rounded-2xl" /> : listings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No listings yet</p>
              <button className="btn-primary mt-4" onClick={() => router.push("/create")}>Create Listing</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map((l) => (
                <div key={l.id}>
                  <ListingCard listing={l} />
                  <button className="text-xs text-red-400 hover:text-red-600 mt-1 ml-1" onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Bookings */}
      {tab === "bookings" && (
        <div>
          <h3 className="font-bold text-navy mb-4">My Bookings ({bookings.length})</h3>
          {bookings.length === 0 ? <p className="text-slate-400 text-center py-12">No bookings yet</p> : (
            <div className="space-y-3">
              {bookings.map((b: any) => (
                <div key={b.id} className="card p-4 cursor-pointer" onClick={() => router.push(`/bookings/${b.id}`)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-navy">{b.listing?.title || "Listing"}</h4>
                      <p className="text-xs text-slate-500">{b.start_date} • {b.days} days</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${(BOOKING_STATUSES as any)[b.status]?.color || "bg-slate-100 text-slate-600"}`}>{b.status}</span>
                      <p className="text-sm font-bold text-navy mt-1">₹{b.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Owner Dashboard */}
      {tab === "owner" && (
        <div>
          <h3 className="font-bold text-navy mb-4">Owner Dashboard</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-4 text-center">
              <div className="text-2xl font-extrabold text-green-600">₹{totalEarned}</div>
              <div className="text-xs text-slate-500">Total Earned</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-extrabold text-amber-600">{ownerBookings.filter((b) => b.status === "pending").length}</div>
              <div className="text-xs text-slate-500">Pending Approvals</div>
            </div>
          </div>
          {ownerBookings.filter((b) => b.status === "pending").length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-navy mb-3">🔔 Pending Approvals</h4>
              {ownerBookings.filter((b) => b.status === "pending").map((b: any) => (
                <div key={b.id} className="card p-4 mb-3">
                  <p className="font-semibold text-navy">{b.listing?.title}</p>
                  <p className="text-xs text-slate-500">From {b.renter?.full_name} • {b.start_date} • {b.days}d • ₹{b.total}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-primary flex-1 py-2 text-sm" onClick={() => router.push(`/bookings/${b.id}`)}>View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
