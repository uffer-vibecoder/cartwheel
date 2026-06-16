import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reads Vite env vars. Until you create a Supabase project and fill these in
// (.env from .env.example), whim runs in "local account" mode — profiles and
// daydream history live in the browser. Add the keys and it flips to real,
// cross-device accounts with zero code changes.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
