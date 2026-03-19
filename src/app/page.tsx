"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getListings } from "@/services/listings";
import ListingCard from "@/components/ListingCard";
import { CATEGORIES } from "@/types";

export default function HomePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListings({ limit: 8, sort: "newest" })
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy opacity-90" />
        <div className="relative page-container py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Rent <span className="text-accent">Anything.</span>
              <br />
              Earn From <span className="text-accent">Everything.</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl mb-8 leading-relaxed">
              The marketplace for cameras, vehicles, tools, venues, electronics and more.
              List your stuff, earn money. Find what you need, rent it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/search" className="btn-primary text-center text-base">
                🔍 Browse Listings
              </Link>
              <Link href="/create" className="btn-outline !border-white/20 !text-white hover:!bg-white/10 text-center text-base">
                📦 List Your Item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container py-12">
        <h2 className="text-2xl font-extrabold text-navy mb-8">Browse Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?category=${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-surface-border hover:border-accent/30 hover:shadow-md transition group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-semibold text-slate-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-navy">Recent Listings</h2>
          <Link href="/search" className="text-sm font-semibold text-accent hover:underline">
            See all →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card">
                <div className="skeleton aspect-[4/3]" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-5 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-navy mb-2">No listings yet</h3>
            <p className="text-slate-500 mb-6">Be the first to list an item on RENTA-Z</p>
            <Link href="/create" className="btn-primary">Create Listing</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-surface-muted py-16">
        <div className="page-container">
          <h2 className="text-2xl font-extrabold text-navy text-center mb-12">How RENTA-Z Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📱", title: "List or Browse", desc: "Create a listing in minutes or browse thousands of items available for rent." },
              { icon: "🤝", title: "Book & Pay", desc: "Request a booking, agree on dates, and pay securely. Deposits are protected." },
              { icon: "✅", title: "Rent & Return", desc: "Pick up the item, enjoy it, return it. Owner confirms and your deposit is released." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow teaser */}
      <section className="page-container py-16">
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Secure Escrow Coming Soon</h2>
          <p className="text-slate-300 max-w-xl mx-auto leading-relaxed">
            We&apos;re building blockchain-powered escrow on Polygon.
            Your deposits will be locked in smart contracts — released only when both parties confirm.
            Trustless, transparent, secure.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Phase 2 — In Development
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="page-container text-center">
          <div className="font-display font-extrabold text-xl mb-2">
            RENT<span className="text-accent">A-Z</span>
          </div>
          <p className="text-slate-400 text-sm">Rent Anything. Earn From Everything.</p>
          <p className="text-slate-500 text-xs mt-4">© 2026 RENTA-Z. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
