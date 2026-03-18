"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/services/listings";
import { useApp } from "@/context/AppContext";
import ImageUploader from "@/components/ImageUploader";
import { CATEGORIES } from "@/types";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, userId, showToast } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", location: "", city: "",
    price_daily: "", price_weekly: "", deposit: "", instant: false, images: [] as string[],
  });

  const up = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  if (!userId) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-navy mb-2">Sign in required</h2>
        <p className="text-slate-500 mb-6">You need to be signed in to create a listing</p>
        <button onClick={() => router.push("/auth")} className="btn-primary">Sign In</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required"); return; }
    if (!form.category) { showToast("Select a category"); return; }
    if (!form.city.trim()) { showToast("City is required"); return; }
    if (!form.price_daily || Number(form.price_daily) <= 0) { showToast("Daily rate must be > 0"); return; }

    setSaving(true);
    try {
      await createListing({
        owner_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        location: form.location.trim(),
        city: form.city.trim(),
        price_daily: Number(form.price_daily),
        price_weekly: form.price_weekly ? Number(form.price_weekly) : null,
        deposit: form.deposit ? Number(form.deposit) : 0,
        instant: form.instant,
        images: form.images,
      });
      showToast("Listing published! 🎉");
      router.push("/profile");
    } catch (err: any) {
      showToast(err.message || "Failed to create listing");
    }
    setSaving(false);
  };

  return (
    <div className="page-container py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-navy mb-8">Create Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Category *</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => up("category", cat.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition text-sm ${form.category === cat.id ? "border-accent bg-accent/5" : "border-surface-border hover:border-accent/30"}`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Title *</label>
          <input className="input-field" placeholder="e.g. Canon EOS R6 Mark II" value={form.title} onChange={(e) => up("title", e.target.value)} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Description</label>
          <textarea className="input-field resize-y" rows={4} placeholder="Describe your item, condition, what's included..." value={form.description} onChange={(e) => up("description", e.target.value)} />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Photos</label>
          <ImageUploader userId={userId} images={form.images} onChange={(imgs) => up("images", imgs)} />
        </div>

        {/* Location */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">City *</label>
            <input className="input-field" placeholder="Mumbai" value={form.city} onChange={(e) => up("city", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Pickup Address <span className="text-xs text-slate-400 font-normal">(shown after booking)</span></label>
            <input className="input-field" placeholder="Full address..." value={form.location} onChange={(e) => up("location", e.target.value)} />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Daily Rate (₹) *</label>
            <input className="input-field" type="number" min="0" placeholder="500" value={form.price_daily} onChange={(e) => up("price_daily", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Weekly Rate (₹)</label>
            <input className="input-field" type="number" min="0" placeholder="2800" value={form.price_weekly} onChange={(e) => up("price_weekly", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Deposit (₹)</label>
            <input className="input-field" type="number" min="0" placeholder="1000" value={form.deposit} onChange={(e) => up("deposit", e.target.value)} />
          </div>
        </div>

        {/* Instant toggle */}
        <div className="flex items-center gap-3 bg-surface-muted rounded-xl p-4">
          <button
            type="button"
            onClick={() => up("instant", !form.instant)}
            className={`w-12 h-7 rounded-full p-0.5 transition ${form.instant ? "bg-green-500" : "bg-slate-300"}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${form.instant ? "translate-x-5" : ""}`} />
          </button>
          <div>
            <p className="text-sm font-semibold">Instant Booking</p>
            <p className="text-xs text-slate-400">Auto-confirm without manual approval</p>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full text-base" disabled={saving}>
          {saving ? "Publishing..." : "🚀 Publish Listing"}
        </button>
      </form>
    </div>
  );
}
