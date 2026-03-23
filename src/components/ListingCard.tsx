"use client";

import Link from "next/link";
import { CATEGORIES } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import AIPriceBadge from "@/components/AIPriceBadge";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    images: string[];
    category: string;
    city: string;
    price_daily: number;
    rating: number;
    reviews_count: number;
    instant: boolean;
    deposit: number;
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const cat = CATEGORIES.find((c) => c.id === listing.category);
  const hasImg = listing.images?.length > 0;

  return (
    <Link href={`/listing/${listing.id}`} className="card group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
              <div className="absolute top-2 right-2 flex gap-1.5 z-10"><FavoriteButton listingId={listing.id} size="sm" /><ShareButton listingId={listing.id} listingTitle={listing.title} price={listing.price_daily} size="sm" /></div>
        {hasImg ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{cat?.icon || "📦"}</span>
            <span className="text-xs font-semibold text-slate-400">{cat?.name || "Item"}</span>
          </div>
        )}
        {listing.instant && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            ⚡ INSTANT
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black/50 text-white text-[11px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
          {cat?.icon} {cat?.name}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-navy truncate">{listing.title}</h3>
        <div className="flex items-center gap-2 mt-1 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">★</span>
            <span className="text-xs font-semibold text-slate-600">{listing.rating?.toFixed(1) || "New"}</span>
          </div>
          <span className="text-xs text-slate-400">({listing.reviews_count || 0})</span>
          <span className="text-xs text-slate-400 ml-auto">📍 {listing.city}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-navy">₹{listing.price_daily}</span>
          <span className="text-xs text-slate-400">/day</span>
        </div>
      </div>
    </Link>
  );
}
