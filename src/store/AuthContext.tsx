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

export type CollectedDrop = { product_id: string; collected_at: string };

type AuthValue = {
  mode: "supabase" | "local";
  ready: boolean;
  signedIn: boolean;
  profile: Profile | null;
  history: Daydream[];
  /**
   * Primary sign-in: instant account with just a display name. Uses a real
   * Supabase anonymous account when configured, else a local browser profile.
   * Returns an error message, or null on success.
   */
  startProfile: (name: string) => Promise<string | null>;
  /** Optional upgrade: email a magic link to sync across devices. Returns true if sent. */
  signInWithEmail: (email: string) => Promise<boolean>;
  /** Local mode: claim a browser profile with a display name. */
  signInLocal: (name: string) => void;
  signOut: () => Promise<void>;
  recordDaydream: (d: Omit<Daydream, "id" | "placed_at">) => Promise<void>;
  /** Limited-drop collection (collectible "caught" items). */
  collected: CollectedDrop[];
  collectDrop: (productId: string) => Promise<void>;
  isCollected: (productId: string) => boolean;
};

const PROFILE_KEY = "whim.profile";
const HISTORY_KEY = "whim.history";
const COLLECTED_KEY = "whim.collected";

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
  const [collected, setCollected] = useState<CollectedDrop[]>([]);

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
    // collected_drops may not exist until the user runs the migration; tolerate it.
    const { data: drops } = await supabase
      .from("collected_drops")
      .select("product_id, collected_at")
      .order("collected_at", { ascending: false });
    setCollected((drops as CollectedDrop[]) ?? []);
  }, []);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "local") {
      setProfile(loadLocal<Profile | null>(PROFILE_KEY, null));
      setHistory(loadLocal<Daydream[]>(HISTORY_KEY, []));
      setCollected(loadLocal<CollectedDrop[]>(COLLECTED_KEY, []));
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
        setCollected([]);
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

  const startProfile = useCallback(
    async (name: string): Promise<string | null> => {
      const display = name.trim() || "friend";
      if (mode === "local" || !supabase) {
        signInLocal(display);
        return null;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Most common: the "Allow anonymous sign-ins" toggle is off in the dashboard.
        return /disabled/i.test(error.message)
          ? "Anonymous sign-ins are turned off in Supabase. Enable them under Authentication → Sign In / Providers."
          : error.message;
      }
      const uid = data.user?.id;
      if (uid) {
        await supabase
          .from("profiles")
          .upsert({ id: uid, display_name: display, avatar_emoji: "🛒" });
        await loadSupabaseData(uid);
      }
      return null;
    },
    [mode, signInLocal, loadSupabaseData]
  );

  const signOut = useCallback(async () => {
    if (mode === "supabase" && supabase) {
      await supabase.auth.signOut();
      return;
    }
    setProfile(null);
    setCollected([]);
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(COLLECTED_KEY);
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

  const collectDrop = useCallback(
    async (productId: string) => {
      if (!profile) return;
      if (collected.some((c) => c.product_id === productId)) return; // already caught
      const entry: CollectedDrop = {
        product_id: productId,
        collected_at: new Date().toISOString(),
      };
      if (mode === "supabase" && supabase && profile.id !== "local") {
        await supabase
          .from("collected_drops")
          .upsert(
            { user_id: profile.id, product_id: productId },
            { onConflict: "user_id,product_id" }
          );
        setCollected((prev) => [entry, ...prev]);
        return;
      }
      const next = [entry, ...collected];
      setCollected(next);
      try {
        localStorage.setItem(COLLECTED_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [mode, profile, collected]
  );

  const isCollected = useCallback(
    (productId: string) => collected.some((c) => c.product_id === productId),
    [collected]
  );

  const value = useMemo<AuthValue>(
    () => ({
      mode,
      ready,
      signedIn: !!profile,
      profile,
      history,
      startProfile,
      signInWithEmail,
      signInLocal,
      signOut,
      recordDaydream,
      collected,
      collectDrop,
      isCollected,
    }),
    [
      mode,
      ready,
      profile,
      history,
      startProfile,
      signInWithEmail,
      signInLocal,
      signOut,
      recordDaydream,
      collected,
      collectDrop,
      isCollected,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
