"use client";

import { getSupabase } from "@/lib/supabase";

export default function SocialAuthButtons() {
  const handleGoogle = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleApple = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Google */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      {/* Apple */}
      <button
        onClick={handleApple}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
      >
        <svg width="16" height="18" viewBox="0 0 17 20" fill="white">
          <path d="M13.05 10.73c-.02-2.15 1.76-3.19 1.84-3.24-1-1.47-2.57-1.67-3.12-1.7-1.33-.13-2.6.78-3.27.78-.68 0-1.72-.76-2.83-.74-1.46.02-2.8.85-3.55 2.15-1.52 2.63-.39 6.52 1.09 8.66.72 1.05 1.59 2.22 2.72 2.18 1.09-.04 1.5-.71 2.82-.71s1.69.71 2.84.68c1.18-.02 1.93-1.06 2.64-2.11.83-1.21 1.18-2.39 1.2-2.45-.03-.01-2.3-.88-2.32-3.5h-.06zM10.95 3.88c.6-.73 1-1.73.89-2.74-.86.04-1.9.57-2.52 1.3-.55.64-1.03 1.66-.9 2.64.96.07 1.94-.49 2.53-1.2z" />
        </svg>
        Continue with Apple
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">or use email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    </div>
  );
}
