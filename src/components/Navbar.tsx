"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const { user, signOut, loading } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-border">
      <div className="page-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-navy rounded-xl flex items-center justify-center">
            <span className="text-accent font-extrabold text-sm">RZ</span>
          </div>
          <span className="font-display font-extrabold text-xl text-navy">
            RENT<span className="text-accent">A-Z</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/search" className="text-sm font-medium text-slate-600 hover:text-navy transition">
            Browse
          </Link>
          {user && (
            <>
              <Link href="/create" className="text-sm font-medium text-slate-600 hover:text-navy transition">
                List Item
              </Link>
              <Link href="/bookings" className="text-sm font-medium text-slate-600 hover:text-navy transition">
                Bookings
              </Link>
              <Link href="/chat" className="text-sm font-medium text-slate-600 hover:text-navy transition">
                Chat
              </Link>
            </>
          )}
        </div>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="skeleton w-20 h-9 rounded-lg" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-muted transition">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                  {(user.full_name || "?")[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-navy">{user.full_name || "Profile"}</span>
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="btn-primary text-sm py-2 px-5">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-navy"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-surface-border px-4 pb-4">
          <Link href="/search" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-slate-600 border-b border-surface-border">
            Browse
          </Link>
          {user ? (
            <>
              <Link href="/create" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-slate-600 border-b border-surface-border">
                List Item
              </Link>
              <Link href="/bookings" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-slate-600 border-b border-surface-border">
                My Bookings
              </Link>
              <Link href="/chat" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-slate-600 border-b border-surface-border">
                Chat
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-slate-600 border-b border-surface-border">
                Profile
              </Link>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left py-3 text-sm font-medium text-red-500">
                Log Out
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-semibold text-accent">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
