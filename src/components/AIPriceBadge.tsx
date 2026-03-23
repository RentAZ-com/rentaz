"use client";

interface Props {
  currentPrice: number;
  suggestedPrice: number | null;
  variant?: "card" | "detail" | "banner";
}

export default function AIPriceBadge({ currentPrice, suggestedPrice, variant = "card" }: Props) {
  if (!suggestedPrice || suggestedPrice <= currentPrice) return null;

  const pct = Math.round(((suggestedPrice - currentPrice) / currentPrice) * 100);

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
        <span className="text-xl">🧠</span>
        <div className="flex-1">
          <div className="text-sm font-bold text-amber-900">AI Pricing Engine Active</div>
          <div className="text-xs text-amber-700">Your items could earn {pct}% more with smart pricing</div>
        </div>
        <button className="px-4 py-2 rounded-xl bg-amber-400 text-white text-xs font-bold hover:bg-amber-500 transition">
          Enable →
        </button>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200">
        <span className="text-2xl">🧠</span>
        <div>
          <div className="text-sm font-bold text-amber-900">AI suggests ₹{suggestedPrice}/day</div>
          <div className="text-xs text-amber-700">Earn {pct}% more based on market analysis</div>
        </div>
      </div>
    );
  }

  // card variant (compact)
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 mt-2">
      <span className="text-xs">🧠</span>
      <span className="text-[11px] font-semibold text-amber-900">
        Earn {pct}% more → ₹{suggestedPrice}/day
      </span>
    </div>
  );
}
