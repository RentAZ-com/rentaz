"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getListings } from "@/services/listings";
import ListingCard from "@/components/ListingCard";
import { CATEGORIES } from "@/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("newest");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListings({ category: category || undefined, search: search || undefined, sort });
      setListings(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [category, search, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="page-container py-8">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search cameras, vehicles, tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchListings()}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <select
          className="input-field w-full sm:w-48"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setCategory("")}
          className={`badge whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${!category ? "bg-navy text-white" : "bg-white border border-surface-border text-slate-600 hover:bg-surface-muted"}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(category === cat.id ? "" : cat.id)}
            className={`badge whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition ${category === cat.id ? "bg-navy text-white" : "bg-white border border-surface-border text-slate-600 hover:bg-surface-muted"}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-navy mb-2">No listings found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{listings.length} listing{listings.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="page-container py-8">
        <div className="skeleton h-12 rounded-xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="card"><div className="skeleton aspect-[4/3]" /><div className="p-3 space-y-2"><div className="skeleton h-4 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div></div>
          ))}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
