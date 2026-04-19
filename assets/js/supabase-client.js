import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://uzrftgskzojsdyqsomac.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_O11y00No-mlV8aVRQoHwfg_yMY9hZwi";

export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("PASTE_YOUR_SUPABASE_URL_HERE") &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR_SUPABASE_ANON_KEY_HERE");

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function getAbsoluteUrl(pathname) {
  return new URL(pathname, window.location.href).toString();
}

export function requireConfiguredSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  return supabase;
}
