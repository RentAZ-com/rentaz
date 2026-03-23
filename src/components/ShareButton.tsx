"use client";

import { useState, useEffect } from "react";

interface Props {
  listingId: string;
  listingTitle: string;
  price: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ShareButton({ listingId, listingTitle, price, size = "md", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = `https://renta-z.com/listing/${listingId}`;
  const text = `Check out "${listingTitle}" on RENTA-Z! ₹${price}/day`;

  const sizes = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg" };

  // Reset copied state
  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const share = (platform: string) => {
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard?.writeText(url);
        setCopied(true);
        break;
      case "native":
        if (navigator.share) {
          navigator.share({ title: listingTitle, text, url });
        }
        break;
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(true); }}
        className={`${sizes[size]} rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white ${className}`}
        aria-label="Share listing"
      >
        ↗
      </button>

      {/* Bottom Sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="font-bold text-lg text-navy mb-4">Share this listing</h3>

            <div className="flex gap-3">
              {/* WhatsApp */}
              <button
                onClick={() => share("whatsapp")}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">💬</div>
                <span className="text-xs font-semibold text-slate-700">WhatsApp</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => share("twitter")}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold">𝕏</div>
                <span className="text-xs font-semibold text-slate-700">Twitter / X</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => share("copy")}
                className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                  {copied ? "✅" : "📋"}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}
