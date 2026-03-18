"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn, signInWithOTP } from "@/services/auth";
import { useApp } from "@/context/AppContext";

export default function AuthPage() {
  const router = useRouter();
  const { showToast, refreshUser } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim() || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (mode === "signup" && !name.trim()) { setError("Name is required"); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name.trim());
        showToast("Account created! Check your email to verify.");
      } else {
        await signIn(email, password);
        await refreshUser();
        showToast("Welcome back! 👋");
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) { setError("Enter your email first"); return; }
    setLoading(true);
    try {
      await signInWithOTP(email);
      showToast("Magic link sent! Check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-extrabold text-xl">RZ</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {mode === "login" ? "Sign in to your RENTA-Z account" : "Join RENTA-Z and start renting"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-border p-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-slate-400">or</span></div>
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            className="btn-outline w-full text-sm"
            disabled={loading}
          >
            ✨ Send Magic Link
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-sm text-slate-500 hover:text-accent transition"
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
