"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMessages, sendMessage } from "@/services/reviews";
import { useApp } from "@/context/AppContext";

export default function ChatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId, user } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    getMessages(id).then(setMessages).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !userId || !id) return;
    const msg = text.trim();
    setText("");
    try {
      const sent = await sendMessage(id, userId, user?.full_name || "User", msg);
      setMessages((p) => [...p, sent]);
    } catch { /* silent */ }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-surface-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push("/chat")} className="text-slate-500 hover:text-navy text-lg">←</button>
        <h2 className="font-bold text-navy">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl max-w-[60%]" style={{ marginLeft: i % 2 ? "auto" : 0 }} />)}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No messages yet. Say hello!</div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === userId;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-accent text-white rounded-br-md" : "bg-white border border-surface-border text-navy rounded-bl-md"}`}>
                  {!isMine && <div className="text-xs font-semibold text-slate-500 mb-1">{m.sender_name}</div>}
                  <p>{m.text}</p>
                  <div className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-slate-400"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-surface-border px-4 py-3 flex gap-2 flex-shrink-0">
        <input
          className="input-field flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn-primary px-5" onClick={handleSend} disabled={!text.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
