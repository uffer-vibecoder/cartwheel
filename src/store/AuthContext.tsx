import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type Profile = {
  id: string;
  display_name: string;
  avatar_emoji: string;
  saved_total: number;
};

export type Daydream = {
  id: string;
  total: number;
  window_seconds: number;
  surprise: boolean;
  items: { emoji: string; name: string }[];
  placed_at: string;
};

type AuthValue = {
  mode: "supabase" | "local";
  ready: boolean;
  signedIn: boolean;
  profile: Profile | null;
  history: Daydream[];
  /** Supabase mode: emails a magic link. Returns true if sent. */
  signInWithEmail: (email: string) => Promise<boolean>;
  /** Local mode: claim a browser profile with a display name. */
  signInLocal: (name: string) => void;
  signOut: () => Promise<void>;
  recordDaydream: (d: Omit<Daydream, "id" | "placed_at">) => Promise<void>;
};

const PROFILE_KEY = "whim.profile";
const HISTORY_KEY = "whim.history";

const AuthContext = createContext<AuthValue | null>(null);

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode: "supabase" | "local" = isSupabaseConfigured ? "supabase" : "local";
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<Daydream[]>([]);

  // ── Supabase data loaders ────────────────────────────────────────────────
  const loadSupabaseData = useCallback(async (userId: string, email?: string) => {
    if (!supabase) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji, saved_total")
      .eq("id", userId)
      .maybeSingle();
    setProfile(
      prof ?? {
        id: userId,
        display_name: email?.split("@")[0] ?? "friend",
        avatar_emoji: "🛒",
        saved_total: 0,
      }
    );
    const { data: dreams } = await supabase
      .from("daydreams")
      .select("id, total, window_seconds, surprise, items, placed_at")
      .order("placed_at", { ascending: false })
      .limit(100);
    setHistory((dreams as Daydream[]) ?? []);
  }, []);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "local") {
      setProfile(loadLocal<Profile | null>(PROFILE_KEY, null));
      setHistory(loadLocal<Daydream[]>(HISTORY_KEY, []));
      setReady(true);
      return;
    }
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) loadSupabaseData(u.id, u.email ?? undefined).finally(() => setReady(true));
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) loadSupabaseData(u.id, u.email ?? undefined);
      else {
        setProfile(null);
        setHistory([]);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [mode, loadSupabaseData]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return false;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    return !error;
  }, []);

  const signInLocal = useCallback((name: string) => {
    const p: Profile = {
      id: "local",
      display_name: name.trim() || "friend",
      avatar_emoji: "🛒",
      saved_total: 0,
    };
    setProfile(p);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(async () => {
    if (mode === "supabase" && supabase) {
      await supabase.auth.signOut();
      return;
    }
    setProfile(null);
    try {
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const recordDaydream = useCallback(
    async (d: Omit<Daydream, "id" | "placed_at">) => {
      if (!profile) return;
      if (mode === "supabase" && supabase && profile.id !== "local") {
        await supabase.from("daydreams").insert({
          user_id: profile.id,
          total: d.total,
          window_seconds: d.window_seconds,
          surprise: d.surprise,
          items: d.items,
        });
        await supabase
          .from("profiles")
          .update({ saved_total: profile.saved_total + d.total })
          .eq("id", profile.id);
        await loadSupabaseData(profile.id);
        return;
      }
      // local mode
      const entry: Daydream = {
        ...d,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        placed_at: new Date().toISOString(),
      };
      const nextHistory = [entry, ...history].slice(0, 100);
      const nextProfile = { ...profile, saved_total: profile.saved_total + d.total };
      setHistory(nextHistory);
      setProfile(nextProfile);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
      } catch {
        /* ignore */
      }
    },
    [mode, profile, history, loadSupabaseData]
  );

  const value = useMemo<AuthValue>(
    () => ({
      mode,
      ready,
      signedIn: !!profile,
      profile,
      history,
      signInWithEmail,
      signInLocal,
      signOut,
      recordDaydream,
    }),
    [mode, ready, profile, history, signInWithEmail, signInLocal, signOut, recordDaydream]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
