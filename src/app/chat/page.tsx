"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getConversations } from "@/services/reviews";
import { useApp } from "@/context/AppContext";

export default function ChatListPage() {
  const router = useRouter();
  const { userId } = useApp();
  const [convos, setConvos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getConversations(userId).then(setConvos).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return (
    <div className="page-container py-20 text-center">
      <div className="text-5xl mb-4">💬</div>
      <h2 className="text-xl font-bold text-navy">Sign in to see messages</h2>
      <button onClick={() => router.push("/auth")} className="btn-primary mt-4">Sign In</button>
    </div>
  );

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-extrabold text-navy mb-6">Messages</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : convos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-lg font-bold text-navy">No conversations yet</h3>
          <p className="text-slate-500 text-sm mt-1">Start a chat from a listing page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {convos.map((c) => {
            const otherName = c.user_id === userId ? c.other_name : c.user_name;
            return (
              <div
                key={c.id}
                className="card p-4 cursor-pointer hover:bg-surface-muted/50 transition"
                onClick={() => router.push(`/chat/${c.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                    {(otherName || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-navy truncate">{otherName}</h4>
                      {c.last_time && <span className="text-xs text-slate-400">{new Date(c.last_time).toLocaleDateString()}</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{c.listing_title}</p>
                    {c.last_msg && <p className="text-sm text-slate-400 truncate mt-1">{c.last_msg}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
