"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { getEarningsOverview, getRecentPayouts, getMonthlyEarnings } from "@/services/earnings";
import type { EarningsOverview, Payout, MonthlyEarning } from "@/services/earnings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EarningsDashboard({ open, onClose }: Props) {
  const { userId } = useApp();
  const [overview, setOverview] = useState<EarningsOverview | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [monthly, setMonthly] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    Promise.all([
      getEarningsOverview(userId),
      getRecentPayouts(userId),
      getMonthlyEarnings(userId),
    ])
      .then(([o, p, m]) => {
        setOverview(o);
        setPayouts(p);
        setMonthly(m);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, userId]);

  if (!open) return null;

  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;
  const maxBar = monthly.length > 0 ? Math.max(...monthly.map((m) => m.amount), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-extrabold text-navy mb-1">💰 Earnings Dashboard</h2>
        <p className="text-sm text-slate-400 mb-5">Your rental income overview</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-accent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-4 rounded-2xl bg-green-50">
                <div className="text-lg font-extrabold text-green-600">{fmt(overview?.earnedThisMonth || 0)}</div>
                <div className="text-[10px] text-slate-500 mt-1">This Month</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-orange-50">
                <div className="text-lg font-extrabold text-accent">{fmt(overview?.totalEarned || 0)}</div>
                <div className="text-[10px] text-slate-500 mt-1">Total Earned</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-blue-50">
                <div className="text-lg font-extrabold text-blue-600">{overview?.activeRentals || 0}</div>
                <div className="text-[10px] text-slate-500 mt-1">Active Rentals</div>
              </div>
            </div>

            {/* Monthly Chart */}
            {monthly.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <div className="text-xs font-semibold text-slate-500 mb-3">Monthly Earnings</div>
                <div className="flex items-end gap-2 h-20">
                  {monthly.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-accent to-amber-400"
                        style={{ height: `${(m.amount / maxBar) * 100}%`, minHeight: 4, transition: "height 0.5s ease" }}
                      />
                      <span className="text-[9px] text-slate-400">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payouts */}
            {payouts.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-navy mb-3">Recent Payouts</h4>
                {payouts.map((p, i) => (
                  <div key={p.id} className={`flex justify-between items-center py-3 ${i < payouts.length - 1 ? "border-b border-slate-100" : ""}`}>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{p.listingTitle}</div>
                      <div className="text-xs text-slate-400">{p.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">₹{p.amount}</div>
                      <div className={`text-[10px] font-semibold ${p.status === "completed" ? "text-green-500" : "text-amber-500"}`}>
                        {p.status === "completed" ? "Completed" : "Pending"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {payouts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">💸</div>
                <p className="text-sm text-slate-400">No payouts yet. List an item to start earning!</p>
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Close
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.2s ease; }
      `}</style>
    </div>
  );
}
