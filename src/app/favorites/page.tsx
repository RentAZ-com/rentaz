"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFavorites } from "@/services/favorites";
import { useApp } from "@/context/AppContext";
import ListingCard from "@/components/ListingCard";

export default function FavoritesPage() {
  const router = useRouter();
  const { userId } = useApp();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getFavorites(userId)
      .then((data) => setFavorites(data.map((f: any) => ({ ...f.listings, _favId: f.listing_id }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="page-container py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-lg text-slate-500 hover:text-navy">←</button>
        <h1 className="text-xl font-extrabold text-navy">Favorites ({favorites.length})</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-accent rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-lg font-bold text-navy">No favorites yet</h3>
          <p className="text-slate-500 text-sm mt-1">Tap the heart on any listing to save it here</p>
          <button
            onClick={() => router.push("/search")}
            className="mt-4 px-6 py-3 bg-accent text-white font-bold rounded-2xl hover:bg-accent/90 transition"
          >
            Browse Listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
