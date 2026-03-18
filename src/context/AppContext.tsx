"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { getProfile } from "@/services/auth";
import type { Profile } from "@/types";

interface AppContextType {
  user: Profile | null;
  userId: string | null;
  loading: boolean;
  toast: string | null;
  showToast: (msg: string) => void;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  userId: null,
  loading: true,
  toast: null,
  showToast: () => {},
  refreshUser: async () => {},
  signOut: async () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshUser = useCallback(async () => {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      const profile = await getProfile(session.user.id);
      setUser(profile);
    } else {
      setUser(null);
      setUserId(null);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setUserId(null);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        getProfile(session.user.id).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserId(session.user.id);
          const profile = await getProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
          setUserId(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ user, userId, loading, toast, showToast, refreshUser, signOut: handleSignOut }}>
      {children}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-navy text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-sm max-w-[90vw] animate-pulse">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
