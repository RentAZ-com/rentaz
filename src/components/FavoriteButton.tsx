"use client";

import { useState } from "react";
import { toggleFavorite } from "@/services/favorites";
import { useApp } from "@/context/AppContext";

interface Props {
  listingId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onToggle?: (isFav: boolean) => void;
}

export default function FavoriteButton({ listingId, initialFavorited = false, size = "md", className = "", onToggle }: Props) {
  const { userId } = useApp();
  const [fav, setFav] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const sizes = { sm: "w-8 h-8 text-base", md: "w-10 h-10 text-lg", lg: "w-12 h-12 text-xl" };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!userId || loading) return;

    setLoading(true);
    try {
      const result = await toggleFavorite(userId, listingId);
      setFav(result);
      onToggle?.(result);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || !userId}
      className={`${sizes[size]} rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all active:scale-110 hover:bg-white ${className}`}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}
